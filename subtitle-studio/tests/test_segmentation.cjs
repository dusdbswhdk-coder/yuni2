"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { reflowSegments, splitCue, mergeCueUp } = require("../static/segmentation.js");

test("changing from two lines to one creates sequential cues and changing back merges them", () => {
  let id = 0;
  const nextId = () => "part-" + ++id;
  const original = [{ id: 1, flowGroup: "source-1", start: 2, end: 8,
    text: "하나 둘 셋 넷 다섯 여섯 일곱", deleted: false, joinNext: false }];
  const two = reflowSegments(original, 7, 2, nextId);
  const one = reflowSegments(two, 7, 1, nextId);
  assert.equal(two.length, 2);
  assert.equal(one.length, 3);
  assert.ok(one.every((cue) => cue.text.split("\n").length === 1));
  assert.equal(one[0].start, 2);
  assert.equal(one.at(-1).end, 8);
  for (let i = 1; i < one.length; i++) assert.equal(one[i - 1].end, one[i].start);
  const restored = reflowSegments(one, 7, 2, nextId);
  assert.equal(restored.length, 2);
  assert.equal(restored.map((cue) => cue.text.replace(/\n/g, " ")).join(" "),
    original[0].text);
});

test("a long unspaced word is not changed when split cues are regrouped", () => {
  let id = 0;
  const original = "가나다라마바사아자차카타파하";
  const first = reflowSegments([{ id: 1, start: 0, end: 4,
    flowGroup: "source", text: original }], 4, 1, () => ++id);
  assert.ok(first.length > 1);
  assert.ok(first.every((cue) => Array.from(cue.text).length <= 4));
  const next = reflowSegments(first, 4, 3, () => ++id);
  assert.equal(next.map((cue) => cue.text.replace(/\n/g, "")).join(""), original);
  assert.ok(next.every((cue) => cue.text.split("\n").length <= 3));
});

test("a cut review fragment keeps its flag and timing when layout changes", () => {
  let id = 10;
  const parts = reflowSegments([{ id: 1, flowGroup: "source", start: 0,
    end: 6, text: "하나 둘 셋 넷 다섯 여섯 일곱" }], 7, 1, () => ++id);
  parts[1].deleted = true;
  const next = reflowSegments(parts, 7, 1, () => ++id);
  assert.equal(next.filter((cue) => cue.deleted).length, 1);
  assert.equal(next.find((cue) => cue.deleted).start, parts[1].start);
  assert.equal(next.find((cue) => cue.deleted).end, parts[1].end);
});

test("Enter splits at the caret and Backspace at the next cue start rejoins it", () => {
  let id = 0;
  const original = [{ id: 1, flowGroup: "source-1", start: 3, end: 7,
    text: "안녕하세요 반갑습니다", deleted: false }];
  const split = splitCue(original, 0, 6, 6, () => ++id);
  assert.equal(split.segments.length, 2);
  assert.equal(split.segments[0].text, "안녕하세요");
  assert.equal(split.segments[1].text, "반갑습니다");
  assert.equal(split.segments[0].start, 3);
  assert.equal(split.segments[1].end, 7);
  assert.equal(split.segments[0].end, split.segments[1].start);
  assert.equal(split.focusIndex, 1);
  const joined = mergeCueUp(split.segments, 1, () => ++id);
  assert.equal(joined.segments.length, 1);
  assert.equal(joined.segments[0].text, original[0].text);
  assert.equal(joined.segments[0].start, 3);
  assert.equal(joined.segments[0].end, 7);
  assert.equal(joined.caret, 6);
});

test("splitting inside a word rejoins without inventing a space", () => {
  let id = 0;
  const source = [{ id: 1, start: 0, end: 2, text: "바지락" }];
  const split = splitCue(source, 0, 1, 1, () => ++id);
  assert.equal(split.segments[1].text, "지락");
  assert.equal(mergeCueUp(split.segments, 1, () => ++id).segments[0].text, "바지락");
  assert.equal(mergeCueUp(source, 0, () => ++id), null);
});

test("merging a cut review cue into a normal cue is blocked", () => {
  const cues = [{ id: 1, text: "하나", deleted: false },
    { id: 2, text: "둘", deleted: true }];
  assert.equal(mergeCueUp(cues, 1, () => "next"), null);
  assert.equal(cues.length, 2);
});
