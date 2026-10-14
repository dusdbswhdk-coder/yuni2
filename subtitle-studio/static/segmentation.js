"use strict";
(function (root) {
  function layoutLines(text, limit) {
    const words = String(text).replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
    const lines = [];
    let line = "";
    for (const word of words) {
      const chars = Array.from(word);
      if (line && Array.from(line).length + 1 + chars.length <= limit) {
        line += " " + word;
        continue;
      }
      if (line) { lines.push({ text: line, joinNext: false }); line = ""; }
      while (chars.length > limit) {
        lines.push({ text: chars.splice(0, limit).join(""), joinNext: true });
      }
      line = chars.join("");
    }
    if (line) lines.push({ text: line, joinNext: false });
    return lines;
  }
  function wrapText(text, limit) {
    return layoutLines(text, limit).map((line) => line.text).join("\n");
  }
  function splitText(text, limit, maxLines) {
    const lines = layoutLines(text, limit);
    if (!lines.length) return [{ text: "", joinNext: false }];
    const parts = [];
    for (let i = 0; i < lines.length; i += maxLines) {
      const selected = lines.slice(i, i + maxLines);
      parts.push({
        text: selected.map((line) => line.text).join("\n"),
        joinNext: selected[selected.length - 1].joinNext
      });
    }
    return parts;
  }
  function reflowSegments(segments, limit, maxLines, newId) {
    const output = [];
    for (let i = 0; i < segments.length;) {
      const first = segments[i];
      const groupId = first.flowGroup ?? String(first.id);
      const group = [first];
      i++;
      while (i < segments.length &&
          (segments[i].flowGroup ?? String(segments[i].id)) === groupId &&
          !!segments[i].deleted === !!first.deleted) {
        group.push(segments[i++]);
      }
      let content = "";
      group.forEach((part, index) => {
        if (index) content += group[index - 1].joinNext ? "" : " ";
        content += part.text;
      });
      const parts = splitText(content, limit, maxLines);
      const start = Math.max(0, Number(first.start) || 0);
      const end = Math.max(start, Number(group[group.length - 1].end) || 0);
      const weights = parts.map((part) => Math.max(1, Array.from(part.text.replace(/\s/g, "")).length));
      const total = weights.reduce((sum, weight) => sum + weight, 0);
      let elapsed = 0;
      parts.forEach((part, index) => {
        const partStart = start + (end - start) * elapsed / total;
        elapsed += weights[index];
        const partEnd = index === parts.length - 1 ? end : start + (end - start) * elapsed / total;
        output.push({
          ...first,
          id: index === 0 ? first.id : newId(),
          flowGroup: groupId,
          text: part.text,
          joinNext: part.joinNext,
          start: partStart,
          end: partEnd
        });
      });
    }
    return output;
  }
  function splitCue(segments, index, selectionStart, selectionEnd, newId) {
    const cue = segments[index];
    if (!cue) return null;
    const source = String(cue.text);
    const from = Math.max(0, Math.min(source.length, selectionStart));
    const to = Math.max(from, Math.min(source.length, selectionEnd));
    const before = source.slice(0, from).trimEnd();
    const after = source.slice(to).trimStart();
    const start = Math.max(0, Number(cue.start) || 0);
    const end = Math.max(start + 0.02, Number(cue.end) || 0);
    const total = Array.from(before + after).length;
    const ratio = total ? Array.from(before).length / total : 0.5;
    const boundary = start + (end - start) * Math.max(0.15, Math.min(0.85, ratio));
    const first = { ...cue, text: before, end: boundary,
      flowGroup: "manual-" + newId(), joinNext: false };
    const second = { ...cue, id: newId(), text: after, start: boundary, end,
      flowGroup: "manual-" + newId(), joinNext: false,
      joinPrevious: from > 0 && to < source.length &&
        !/\\s/.test(source[from - 1]) && !/\\s/.test(source[to]) };
    const output = segments.slice();
    output.splice(index, 1, first, second);
    return { segments: output, focusIndex: index + 1, caret: 0 };
  }
  function mergeCueUp(segments, index, newId) {
    if (index <= 0 || index >= segments.length) return null;
    const previous = segments[index - 1], current = segments[index];
    if (!!previous.deleted !== !!current.deleted) return null;
    const left = previous.text.trimEnd(), right = current.text.trimStart();
    const separator = left && right && !current.joinPrevious ? " " : "";
    const combined = { ...previous, text: left + separator + right,
      end: Math.max(Number(previous.end) || 0, Number(current.end) || 0),
      flowGroup: "manual-" + newId(), joinNext: false };
    const output = segments.slice();
    output.splice(index - 1, 2, combined);
    return { segments: output, focusIndex: index - 1,
      caret: left.length + separator.length };
  }
  const api = { wrapText, splitText, reflowSegments, splitCue, mergeCueUp };
  root.SubtitleLayout = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
