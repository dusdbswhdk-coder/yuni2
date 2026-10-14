"use strict";

const el = (id) => document.getElementById(id);
let segments = [];
let suggestions = new Map();
let mediaUrl = null;
let previewImageUrl = null;
let previewIndex = 0;
let lastRemoval = null;
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
  el("reviewSrt").disabled = value || !segments.some((seg) => seg.deleted);
  el("undoDelete").disabled = value || !lastRemoval;
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
function exportSegments(includeDeleted = false) {
  return segments.filter((seg) => seg.text.trim() && (includeDeleted || !seg.deleted))
    .slice().sort((a, b) => a.start - b.start)
    .map((seg) => ({
      ...seg,
      start: Math.max(0, Number(seg.start) || 0),
      end: Math.max((Number(seg.start) || 0) + 0.01, Number(seg.end) || 0),
      text: seg.text.trim()
    }));
}

function diffRuns(original, corrected) {
  const a = Array.from(original), b = Array.from(corrected);
  const runs = [];
  const add = (kind, char) => {
    if (runs.length && runs[runs.length - 1].kind === kind) runs[runs.length - 1].text += char;
    else runs.push({ kind, text: char });
  };
  if (a.length * b.length > 30000) {
    let start = 0, endA = a.length, endB = b.length;
    while (start < endA && start < endB && a[start] === b[start]) start++;
    while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) { endA--; endB--; }
    a.slice(0, start).forEach((x) => add("same", x));
    a.slice(start, endA).forEach((x) => add("removed", x));
    b.slice(start, endB).forEach((x) => add("added", x));
    a.slice(endA).forEach((x) => add("same", x));
    return runs;
  }
  const dp = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) add("same", a[i++]), j++;
    else if (i < a.length && (j === b.length || dp[i + 1][j] >= dp[i][j + 1])) add("removed", a[i++]);
    else add("added", b[j++]);
  }
  return runs;
}
function diffLine(label, runs, selected, markerClass) {
  const line = document.createElement("p");
  line.className = "diff-line";
  const heading = document.createElement("b");
  heading.textContent = label;
  line.append(heading);
  for (const run of runs) {
    if (run.kind !== "same" && run.kind !== selected) continue;
    const part = document.createElement(run.kind === "same" ? "span" : "mark");
    if (run.kind !== "same") part.className = markerClass;
    part.textContent = run.text;
    line.append(part);
  }
  return line;
}


function maxChars() {
  const count = Number(el("lineLength").value);
  return Number.isInteger(count) && count >= 4 && count <= 40 ? count : 16;
}
function maxLines() {
  const count = Number(el("maxLines").value);
  return Number.isInteger(count) && count >= 1 && count <= 3 ? count : 3;
}
function wrapText(text, limit) {
  return SubtitleLayout.wrapText(text, limit);
}
function reflowCurrent() {
  lastRemoval = null;
  segments = SubtitleLayout.reflowSegments(segments, maxChars(), maxLines(),
    () => "split-" + Date.now() + "-" + Math.random());
}
function focusCue(index, caret) {
  requestAnimationFrame(() => {
    const field = el("items").querySelectorAll(".item textarea")[index];
    if (!field) return;
    field.focus();
    field.setSelectionRange(caret, caret);
    field.scrollIntoView({ block: "nearest" });
  });
}
function applyKeyboardEdit(result, message) {
  segments = result.segments;
  lastRemoval = null;
  suggestions.clear();
  previewIndex = result.focusIndex;
  render();
  focusCue(result.focusIndex, result.caret);
  showStatus(message, false);
}
function setSuggestions(items) {
  const limit = maxChars();
  suggestions = new Map(items.map((item) => [
    String(item.id), { ...item, corrected: wrapText(item.corrected, limit) }
  ]).filter(([id, item]) =>
    segments.some((seg) => String(seg.id) === id && seg.text !== item.corrected)
  ));
}


function findDuplicates(items) {
  const found = new Map();
  const phraseIndex = new Map();
  const gramIndex = new Map();
  const gramSets = [];
  const add = (index, start, end, other) => {
    if (end <= start) return;
    if (!found.has(index)) found.set(index, { spans: [], others: new Set() });
    found.get(index).spans.push({ start, end });
    found.get(index).others.add(other + 1);
  };
  items.forEach((seg, index) => {
    if (seg.deleted) { gramSets.push(new Set()); return; }
    const text = seg.text;
    const words = [...text.matchAll(/\S+/g)].map((match) => ({
      text: match[0].replace(/[\p{P}\p{S}]/gu, "").toLowerCase(),
      start: match.index, end: match.index + match[0].length
    }));
    for (let start = 0; start < words.length; start++) {
      for (let size = 2; size <= 4 && start + size <= words.length; size++) {
        const group = words.slice(start, start + size);
        const key = group.map((word) => word.text).join(" ");
        if (key.replace(/\s/g, "").length < 8) continue;
        const span = { index, start: group[0].start, end: group[group.length - 1].end };
        const prior = phraseIndex.get(key) || [];
        for (const match of prior) {
          if (match.index === index) continue;
          add(index, span.start, span.end, match.index);
          add(match.index, match.start, match.end, index);
        }
        if (!prior.some((match) => match.index === index) && prior.length < 3) prior.push(span);
        phraseIndex.set(key, prior);
      }
    }
    const compact = text.replace(/[\s\p{P}\p{S}]/gu, "").toLowerCase();
    const grams = new Set();
    if (compact.length >= 8) {
      for (let k = 0; k <= compact.length - 3; k++) grams.add(compact.slice(k, k + 3));
    }
    const candidates = new Map();
    for (const gram of grams) {
      for (const other of gramIndex.get(gram) || []) {
        candidates.set(other, (candidates.get(other) || 0) + 1);
      }
    }
    for (const [other, shared] of candidates) {
      const priorCompact = items[other].text.replace(/[\s\p{P}\p{S}]/gu, "").toLowerCase();
      if (Math.min(compact.length, priorCompact.length) / Math.max(compact.length, priorCompact.length) < 0.75) continue;
      const score = 2 * shared / (grams.size + gramSets[other].size);
      if (score >= 0.82) {
        add(index, 0, text.length, other);
        add(other, 0, items[other].text.length, index);
      }
    }
    gramSets.push(grams);
    for (const gram of grams) {
      if (!gramIndex.has(gram)) gramIndex.set(gram, []);
      gramIndex.get(gram).push(index);
    }
  });
  return found;
}
function duplicatePreview(text, spans) {
  const line = document.createElement("p");
  line.className = "duplicate-preview";
  const merged = [];
  for (const span of spans.sort((a, b) => a.start - b.start || b.end - a.end)) {
    const last = merged[merged.length - 1];
    if (last && span.start <= last.end) last.end = Math.max(last.end, span.end);
    else merged.push({ ...span });
  }
  let position = 0;
  for (const span of merged) {
    line.append(document.createTextNode(text.slice(position, span.start)));
    const mark = document.createElement("mark");
    mark.textContent = text.slice(span.start, span.end);
    line.append(mark);
    position = span.end;
  }
  line.append(document.createTextNode(text.slice(position)));
  return line;
}

function renderPreview() {
  const frame = el("previewFrame");
  const caption = el("previewCaption");
  previewIndex = Math.max(0, Math.min(previewIndex, Math.max(0, segments.length - 1)));
  const seg = segments[previewIndex];
  caption.textContent = seg ? (seg.deleted ? "[컷 검토]\n" : "") + seg.text : "자막을 추출하면 여기에 표시됩니다.";
  caption.classList.toggle("cut", !!seg?.deleted);
  const longest = Math.max(1, ...caption.textContent.split("\n").map((line) => Array.from(line).length));
  caption.style.fontSize = Math.min(frame.classList.contains("landscape") ? 25 : 20,
    Math.max(6, Math.floor((frame.clientWidth - 26) / longest))) + "px";
  document.querySelectorAll(".item").forEach((card, index) => {
    card.classList.toggle("preview-selected", index === previewIndex);
  });
}
function renderTimeline() {
  const track = el("timeline");
  track.replaceChildren();
  const duration = el("player").duration;
  if (!Number.isFinite(duration) || duration <= 0) return;
  segments.forEach((seg, index) => {
    if (!seg.text.trim()) return;
    const marker = document.createElement("button");
    marker.className = seg.deleted ? "cue-marker cut-marker" : "cue-marker";
    const start = Math.max(0, Math.min(duration, Number(seg.start) || 0));
    const end = Math.max(start, Math.min(duration, Number(seg.end) || start));
    marker.style.left = (start / duration * 100) + "%";
    marker.style.width = Math.max(0.4, (end - start) / duration * 100) + "%";
    marker.title = "#" + (index + 1) + (seg.deleted ? " 컷 검토" : " 자막") +
      " " + srtTime(start) + " ~ " + srtTime(end);
    marker.setAttribute("aria-label", marker.title);
    marker.addEventListener("click", () => {
      previewIndex = index;
      el("player").currentTime = start;
      renderPreview();
    });
    track.append(marker);
  });
}
el("player").addEventListener("loadedmetadata", renderTimeline);
el("player").addEventListener("timeupdate", () => {
  const position = el("player").currentTime;
  const index = segments.findIndex((seg) => position >= Number(seg.start) && position < Number(seg.end));
  if (index >= 0 && index !== previewIndex) { previewIndex = index; renderPreview(); }
});

function render() {
  const list = el("items");
  list.replaceChildren();
  el("count").textContent = "(" + segments.length + "구간 · 컷 검토 " + segments.filter((seg) => seg.deleted).length + ")";
  if (!segments.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "인식된 음성이 없습니다.";
    list.append(empty);
    setBusy(busy);
    renderTimeline();
    renderPreview();
    return;
  }
  const duplicates = findDuplicates(segments);
  segments.forEach((seg, index) => {
    const card = document.createElement("article");
    card.className = seg.deleted ? "item cut-pending" : "item";
    card.addEventListener("click", () => { previewIndex = index; renderPreview(); });
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
        seg.flowGroup = "timed-" + Date.now() + "-" + Math.random();
        renderTimeline();
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
    remove.textContent = seg.deleted ? "컷 검토 취소" : "컷 검토 표시";
    remove.setAttribute("aria-pressed", String(!!seg.deleted));
    remove.addEventListener("click", () => {
      seg.deleted = !seg.deleted;
      suggestions.delete(String(seg.id));
      render();
    });
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-cue";
    deleteButton.textContent = "자막 삭제";
    deleteButton.setAttribute("aria-label", (index + 1) + "번 자막 삭제");
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const prior = segments[index - 1], next = segments[index + 1];
      const renamed = [];
      if (prior && next && prior.flowGroup === seg.flowGroup &&
          next.flowGroup === seg.flowGroup) {
        const newGroup = "after-delete-" + Date.now() + "-" + Math.random();
        for (let j = index + 1; j < segments.length && segments[j].flowGroup === seg.flowGroup; j++) {
          renamed.push(segments[j]);
          segments[j].flowGroup = newGroup;
        }
      }
      lastRemoval = { segment: seg, index, renamed, oldGroup: seg.flowGroup };
      segments.splice(index, 1);
      suggestions.delete(String(seg.id));
      if (previewIndex >= index) previewIndex = Math.max(0, previewIndex - (previewIndex > index ? 1 : 0));
      render();
      showStatus("#" + (index + 1) + " 자막을 삭제했습니다. 뒤 자막의 번호만 당겨지고 영상 기준 시간은 유지됩니다.", false);
    });
    head.append(jump, remove, deleteButton);
    card.append(head);
    const text = document.createElement("textarea");
    text.value = seg.text;
    text.setAttribute("aria-label", (index + 1) + "번 자막");
    text.addEventListener("input", () => {
      seg.text = text.value;
      seg.joinNext = false;
      if (previewIndex === index) renderPreview();
      suggestions.delete(String(seg.id));
      card.querySelector(".suggest")?.remove();
    });
    card.append(text);
    text.addEventListener("keydown", (event) => {
      if (event.isComposing || event.keyCode === 229) return;
      if (event.key === "Enter") {
        event.preventDefault();
        seg.text = text.value;
        const result = SubtitleLayout.splitCue(segments, index,
          text.selectionStart, text.selectionEnd,
          () => "key-" + Date.now() + "-" + Math.random());
        applyKeyboardEdit(result, "커서 위치에서 자막을 나누고 시간을 배분했습니다.");
      } else if (event.key === "Backspace" &&
          text.selectionStart === 0 && text.selectionEnd === 0 && index > 0) {
        event.preventDefault();
        seg.text = text.value;
        const result = SubtitleLayout.mergeCueUp(segments, index,
          () => "key-" + Date.now() + "-" + Math.random());
        if (!result) {
          showStatus("컷 검토 상태가 다른 자막은 먼저 같은 상태로 맞춰 주세요.", true);
          return;
        }
        applyKeyboardEdit(result, "윗자막과 합쳤습니다. 합쳐진 시간과 줄 수를 확인해 주세요.");
      }
    });
    text.addEventListener("change", () => setTimeout(() => {
      if (!segments.includes(seg)) return;
      reflowCurrent();
      suggestions.clear();
      render();
    }, 0));
    const duplicate = seg.deleted ? null : duplicates.get(index);
    if (duplicate) {
      const box = document.createElement("div");
      box.className = "duplicate-box";
      const related = [...duplicate.others].sort((a, b) => a - b).slice(0, 3).map((n) => "#" + n).join(", ");
      const heading = document.createElement("strong");
      heading.textContent = "중복 의심 · " + related + " 자막과 비슷";
      box.append(heading, duplicatePreview(seg.text, duplicate.spans));
      card.append(box);
    }
    const suggestion = suggestions.get(String(seg.id));
    if (suggestion) {
      const box = document.createElement("div");
      box.className = "suggest";
      const title = document.createElement("strong");
      title.textContent = "수정 제안";
      const runs = diffRuns(seg.text, suggestion.corrected);
      const before = diffLine("원문 · ", runs, "removed", "suspect");
      const after = diffLine("추천 · ", runs, "added", "correction");
      const reason = document.createElement("small");
      reason.textContent = suggestion.reason;
      const accept = document.createElement("button");
      accept.textContent = "이 제안 적용";
      accept.addEventListener("click", () => {
        seg.text = suggestion.corrected;
        seg.joinNext = false;
        suggestions.clear();
        reflowCurrent();
        render();
      });
      box.append(title, before, after, reason, accept);
      card.append(box);
    }
    list.append(card);
  });
  setBusy(busy);
  renderTimeline();
  renderPreview();
}

el("previewRatio").addEventListener("change", () => {
  el("previewFrame").classList.toggle("landscape", el("previewRatio").value === "landscape");
  renderPreview();
});
el("previewImage").addEventListener("change", () => {
  if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
  const file = el("previewImage").files[0];
  previewImageUrl = file ? URL.createObjectURL(file) : null;
  el("previewPicture").src = previewImageUrl || "/static/preview-placeholder.svg";
});

el("file").addEventListener("change", () => {
  if (mediaUrl) URL.revokeObjectURL(mediaUrl);
  const file = el("file").files[0];
  if (file) {
    mediaUrl = URL.createObjectURL(file);
    el("player").src = mediaUrl;
    showStatus(file.name + " 선택됨", false);
  }
});
function applyLayout() {
  const count = Number(el("lineLength").value);
  if (!Number.isInteger(count) || count < 4 || count > 40) return;
  reflowCurrent();
  suggestions.clear();
  render();
  if (segments.length) showStatus("한 줄 " + count + "글자 · 자막당 최대 " + maxLines() + "줄을 적용했습니다.", false);
}
el("lineLength").addEventListener("input", applyLayout);
el("maxLines").addEventListener("change", applyLayout);
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
    segments = result.segments.map((seg, index) => ({
      ...seg, deleted: false, flowGroup: "source-" + index, joinNext: false
    }));
    reflowCurrent();
    previewIndex = 0;
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

el("checkLocal").addEventListener("click", async () => {
  setBusy(true);
  showStatus("띄어쓰기와 기본 표기를 검사 중입니다.", false);
  try {
    const response = await fetch("/api/proofread-local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        segments: segments.filter((seg) => !seg.deleted).map(({ id, text }) => ({ id, text })),
        protected_terms: el("terms").value
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || "기본 검사에 실패했습니다.");
    setSuggestions(result.suggestions);
    render();
    showStatus(suggestions.size ? suggestions.size + "개 구간에서 의심 표현을 찾았습니다. 빨간 표시와 추천 표현을 확인해 주세요." : "검사 완료 · 제안할 표현을 찾지 못했습니다. 원문을 직접 확인해 주세요.", false);
  } catch (error) {
    showStatus(error.message, true);
  } finally {
    setBusy(false);
  }
});
el("checkAi").addEventListener("click", async () => {
  setBusy(true);
  showStatus("AI 맞춤법 수정안을 만들고 있습니다.", false);
  try {
    const response = await fetch("/api/proofread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        segments: segments.filter((seg) => !seg.deleted).map(({ id, text }) => ({ id, text })),
        protected_terms: el("terms").value
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || "검사에 실패했습니다.");
    setSuggestions(result.suggestions);
    render();
    showStatus(suggestions.size + "개 AI 수정 제안. 확인 후 선택 적용해 주세요.", false);
  } catch (error) {
    showStatus(error.message, true);
  } finally {
    setBusy(false);
  }
});
el("undoDelete").addEventListener("click", () => {
  if (!lastRemoval) return;
  const { segment, index, renamed, oldGroup } = lastRemoval;
  renamed.forEach((part) => { if (segments.includes(part)) part.flowGroup = oldGroup; });
  segments.splice(Math.min(index, segments.length), 0, segment);
  lastRemoval = null;
  previewIndex = index;
  render();
  showStatus("삭제한 자막을 되돌렸습니다.", false);
});
el("add").addEventListener("click", () => {
  const start = Number(el("player").currentTime.toFixed(2)) || 0;
  const id = "new-" + Date.now() + "-" + Math.random();
  segments.push({
    id, flowGroup: id, joinNext: false,
    start, end: start + 2, text: "", original: "", deleted: false
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
el("reviewSrt").addEventListener("click", () => {
  const body = exportSegments(true).map((seg, index) =>
    (index + 1) + "\n" + srtTime(seg.start) + " --> " + srtTime(seg.end) +
    "\n" + (seg.deleted ? "[컷 검토] " : "") + seg.text + "\n"
  ).join("\n");
  download("review.srt", body, "application/x-subrip");
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
