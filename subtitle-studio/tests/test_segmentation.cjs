"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { reflowSegments } = require("../static/segmentation.js");

test("changing from two lines to one creates sequential cues and changing back merges them", () => {
  let id = 0;
  const nextId = () => "part-" + ++id;
  const original = [{ id: 1, flowGroup: "source-1", start: 2, end: 8,
    text: "하나 둘 셋 넷 다섯 여섯", deleted: false, joinNext: false }];
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
    end: 6, text: "하나 둘 셋 넷 다섯 여섯" }], 7, 1, () => ++id);
  parts[1].deleted = true;
  const next = reflowSegments(parts, 7, 1, () => ++id);
  assert.equal(next.filter((cue) => cue.deleted).length, 1);
  assert.equal(next.find((cue) => cue.deleted).start, parts[1].start);
  assert.equal(next.find((cue) => cue.deleted).end, parts[1].end);
});
