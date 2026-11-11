import test from "node:test";
import assert from "node:assert/strict";
import { buildSellingQuizSummary, getSellingQuizResult, sellingQuizQuestions } from "../lib/selling-quiz.js";
import { track } from "../lib/analytics.js";

const base = { condition: "ready", timeline: "three-to-six", inheritance: "no", occupancy: "owner", mortgage: "none-known", priority: "price" };

test("selling quiz exposes exactly six four-answer questions", () => {
  assert.equal(sellingQuizQuestions.length, 6);
  for (const question of sellingQuizQuestions) assert.equal(question.answers.length, 4, question.id);
});

test("traditional listing result requires listing signals and a flexible timeline", () => {
  assert.equal(getSellingQuizResult(base).key, "traditional");
  assert.equal(getSellingQuizResult({ ...base, condition: "minor", occupancy: "tenant", mortgage: "possible-liens" }).key, "traditional");
});

test("as-is result follows major repairs or avoiding repairs without using occupancy or liens", () => {
  assert.equal(getSellingQuizResult({ ...base, condition: "major", priority: "simplicity", timeline: "soon" }).key, "asIs");
  assert.equal(getSellingQuizResult({ ...base, condition: "minor", priority: "repairs", occupancy: "tenant", mortgage: "possible-liens" }).key, "asIs");
});

test("unresolved or uncertain estate authority takes precedence", () => {
  assert.equal(getSellingQuizResult({ ...base, inheritance: "resolving" }).key, "authority");
  assert.equal(getSellingQuizResult({ ...base, inheritance: "unsure", condition: "major", priority: "repairs" }).key, "authority");
});

test("mixed signals return the balanced comparison result", () => {
  assert.equal(getSellingQuizResult({ ...base, timeline: "soon", priority: "options" }).key, "compare");
  assert.equal(getSellingQuizResult({ ...base, condition: "major", priority: "price" }).key, "compare");
  assert.equal(getSellingQuizResult({ ...base, priority: undefined }), null);
});

test("quiz summary contains the six selected labels and no URL encoding", () => {
  const summary = buildSellingQuizSummary(base);
  assert.equal(summary.split("\n").length, 6);
  for (const value of ["Move-in ready", "Within 3–6 months", "No", "Owner occupied", "No known mortgage or liens", "Maximizing potential sale price"]) assert.match(summary, new RegExp(value));
  assert.doesNotMatch(summary, /%20|utm_|https?:\/\//);
});

test("quiz analytics require consent and discard answer fields", () => {
  const calls = [];
  global.window = { localStorage: { getItem: () => "denied" }, gtag: (...args) => calls.push(args) };
  track("selling_quiz_complete", { location: "selling_options_quiz", condition: "major", inheritance: "resolving", mortgage: "possible-liens" });
  assert.equal(calls.length, 0);
  global.window.localStorage.getItem = () => "granted";
  track("selling_quiz_complete", { location: "selling_options_quiz", condition: "major", inheritance: "resolving", mortgage: "possible-liens" });
  assert.deepEqual(calls, [["event", "selling_quiz_complete", { location: "selling_options_quiz" }]]);
  delete global.window;
});
