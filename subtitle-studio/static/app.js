"use strict";

const el = (id) => document.getElementById(id);
let segments = [];
let suggestions = new Map();
let mediaUrl = null;
let busy = false;

function showStatus(message, error) {
  el("status").textContent = message;
  el("status").className = error ? "status error" : "status";
}
function setBusy(value) {
  busy = value;
  el("start").disabled = value;
  for (const id of ["checkLocal", "checkAi", "add", "srt", "txt", "ass"]) {
    el(id).disabled = value || segments.length === 0;
  }
}
function fileBase() {
  const name = el("file").files[0]?.name || "subtitles";
  return name.replace(/\.[^.]+$/, "").replace(/[\\/:*?"<>|]/g, "_") || "subtitles";
}
function download(extension, content, mime) {
  const blob = new Blob(["\uFEFF", content], { type: mime + ";charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileBase() + "." + extension;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function srtTime(value) {
  const ms = Math.max(0, Math.round(Number(value) * 1000));
  const hh = Math.floor(ms / 3600000);
  const mm = Math.floor(ms / 60000) % 60;
  const ss = Math.floor(ms / 1000) % 60;
  return [hh, mm, ss].map((v) => String(v).padStart(2, "0")).join(":") +
    "," + String(ms % 1000).padStart(3, "0");
}
function assTime(value) {
  const cs = Math.max(0, Math.round(Number(value) * 100));
  return String(Math.floor(cs / 360000)) + ":" +
    String(Math.floor(cs / 6000) % 60).padStart(2, "0") + ":" +
    String(Math.floor(cs / 100) % 60).padStart(2, "0") + "." +
    String(cs % 100).padStart(2, "0");
}
function exportSegments() {
  return segments.filter((seg) => seg.text.trim())
    .slice().sort((a, b) => a.start - b.start)
    .map((seg) => ({
      ...seg,
      start: Math.max(0, Number(seg.start) || 0),
      end: Math.max((Number(seg.start) || 0) + 0.01, Number(seg.end) || 0),
      text: seg.text.trim()
    }));
}
function render() {
  const list = el("items");
  list.replaceChildren();
  el("count").textContent = "(" + segments.length + "구간)";
  if (!segments.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "인식된 음성이 없습니다.";
    list.append(empty);
    setBusy(busy);
    return;
  }
  segments.forEach((seg, index) => {
    const card = document.createElement("article");
    card.className = "item";
    const head = document.createElement("div");
    head.className = "item-head";
    const number = document.createElement("strong");
    number.textContent = "#" + (index + 1);
    head.append(number);
    for (const key of ["start", "end"]) {
      const label = document.createElement("label");
      label.append(document.createTextNode(key === "start" ? "시작" : "끝"));
      const input = document.createElement("input");
      input.type = "number";
      input.className = "time";
      input.min = "0";
      input.step = "0.01";
      input.value = seg[key];
      input.addEventListener("change", () => {
        seg[key] = Math.max(0, Number(input.value) || 0);
      });
      label.append(input);
      head.append(label);
    }
    const jump = document.createElement("button");
    jump.className = "secondary";
    jump.textContent = "▶ 이동";
    jump.addEventListener("click", () => {
      el("player").currentTime = seg.start;
      el("player").play().catch(() => {});
    });
    const remove = document.createElement("button");
    remove.className = "secondary";
    remove.textContent = "삭제";
    remove.addEventListener("click", () => {
      segments.splice(index, 1);
      suggestions.delete(String(seg.id));
      render();
    });
    head.append(jump, remove);
    card.append(head);
    const text = document.createElement("textarea");
    text.value = seg.text;
    text.setAttribute("aria-label", (index + 1) + "번 자막");
    text.addEventListener("input", () => {
      seg.text = text.value;
      suggestions.delete(String(seg.id));
      card.querySelector(".suggest")?.remove();
    });
    card.append(text);
    const suggestion = suggestions.get(String(seg.id));
    if (suggestion) {
      const box = document.createElement("div");
      box.className = "suggest";
      const title = document.createElement("strong");
      title.textContent = "수정 제안";
      const proposed = document.createElement("p");
      proposed.textContent = suggestion.corrected;
      const reason = document.createElement("small");
      reason.textContent = suggestion.reason;
      const accept = document.createElement("button");
      accept.textContent = "이 제안 적용";
      accept.addEventListener("click", () => {
        seg.text = suggestion.corrected;
        suggestions.delete(String(seg.id));
        render();
      });
      box.append(title, proposed, reason, accept);
      card.append(box);
    }
    list.append(card);
  });
  setBusy(busy);
}

el("file").addEventListener("change", () => {
  if (mediaUrl) URL.revokeObjectURL(mediaUrl);
  const file = el("file").files[0];
  if (file) {
    mediaUrl = URL.createObjectURL(file);
    el("player").src = mediaUrl;
    showStatus(file.name + " 선택됨", false);
  }
});
el("start").addEventListener("click", async () => {
  const file = el("file").files[0];
  if (!file) return showStatus("파일을 먼저 선택해 주세요.", true);
  setBusy(true);
  const startedAt = Date.now();
  const timer = setInterval(() => showStatus("분석 중 · " + Math.floor((Date.now() - startedAt) / 1000) + "초 경과", false), 1000);
  showStatus("분석을 시작합니다. 첫 실행이면 모델을 내려받습니다.", false);
  const form = new FormData();
  form.append("file", file);
  form.append("language", el("language").value);
  form.append("quality", el("quality").value);
  try {
    const response = await fetch("/api/transcribe", { method: "POST", body: form });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || "변환에 실패했습니다.");
    segments = result.segments;
    suggestions.clear();
    render();
    showStatus(segments.length + "개 구간 완료 · 감지 언어 " + result.language, false);
  } catch (error) {
    showStatus(error.message, true);
  } finally {
    clearInterval(timer);
    setBusy(false);
  }
});

const rules = [
  ["되서", "돼서"], ["되요", "돼요"], ["됬", "됐"],
  ["아니예요", "아니에요"], ["할께", "할게"], ["할수 ", "할 수 "],
  ["할수있", "할 수 있"], ["할수없", "할 수 없"],
  ["오랫만에", "오랜만에"], ["왠일", "웬일"], ["몇일", "며칠"],
  ["깨끗히", "깨끗이"], ["설겆이", "설거지"], ["역활", "역할"],
  ["어의없", "어이없"], ["메세지", "메시지"], ["금새", "금세"],
  ["데이타", "데이터"], ["가장 최고", "최고"]
];
el("checkLocal").addEventListener("click", () => {
  suggestions.clear();
  for (const seg of segments) {
    let corrected = seg.text;
    for (const [from, to] of rules) corrected = corrected.replaceAll(from, to);
    if (corrected !== seg.text) suggestions.set(String(seg.id), {
      corrected, reason: "기본 표기 규칙 제안 · 문맥을 확인해 주세요."
    });
  }
  render();
  showStatus(suggestions.size + "개 기본 수정 제안. 원문과 비교해 적용해 주세요.", false);
});
el("checkAi").addEventListener("click", async () => {
  setBusy(true);
  showStatus("AI 맞춤법 수정안을 만들고 있습니다.", false);
  try {
    const response = await fetch("/api/proofread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        segments: segments.map(({ id, text }) => ({ id, text })),
        protected_terms: el("terms").value
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || "검사에 실패했습니다.");
    suggestions = new Map(result.suggestions.map((item) => [String(item.id), item]));
    render();
    showStatus(suggestions.size + "개 AI 수정 제안. 확인 후 선택 적용해 주세요.", false);
  } catch (error) {
    showStatus(error.message, true);
  } finally {
    setBusy(false);
  }
});
el("add").addEventListener("click", () => {
  const start = Number(el("player").currentTime.toFixed(2)) || 0;
  segments.push({
    id: "new-" + Date.now() + "-" + Math.random(),
    start, end: start + 2, text: "", original: ""
  });
  render();
  el("items").lastElementChild?.scrollIntoView({ behavior: "smooth" });
});
el("srt").addEventListener("click", () => {
  const body = exportSegments().map((seg, index) =>
    (index + 1) + "\n" + srtTime(seg.start) + " --> " + srtTime(seg.end) +
    "\n" + seg.text + "\n"
  ).join("\n");
  download("srt", body, "application/x-subrip");
});
el("txt").addEventListener("click", () => {
  download("txt", exportSegments().map((seg) => seg.text).join("\n"), "text/plain");
});
el("ass").addEventListener("click", () => {
  const header = [
    "[Script Info]", "ScriptType: v4.00+", "PlayResX: 1920", "PlayResY: 1080",
    "", "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    "Style: Default,Malgun Gothic,56,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,50,50,40,1",
    "", "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"
  ].join("\n");
  const lines = exportSegments().map((seg) =>
    "Dialogue: 0," + assTime(seg.start) + "," + assTime(seg.end) +
    ",Default,,0,0,0,," + seg.text.replace(/\r?\n/g, "\\N").replace(/[{}]/g, "")
  );
  download("ass", header + "\n" + lines.join("\n"), "text/x-ssa");
});
