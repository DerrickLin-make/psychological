import assert from "node:assert/strict";
import test from "node:test";
import { scl90Scale } from "../src/data/scales/scl90";
import { scoreScale, type Scl90ScaleResult } from "../src/lib/scoring";
import { buildFallbackScl90Analysis, isScl90Result, parseScl90Analysis } from "../src/lib/scl90-report";

function scoreAll(value: number) {
  return scoreScale(scl90Scale, Array.from({ length: 90 }, () => value));
}

test("SCL-90 scoring returns report-ready factor details", () => {
  const result = scoreAll(2);

  assert.equal(result.kind, "custom");
  assert.equal(isScl90Result(result), true);
  if (!isScl90Result(result)) return;

  assert.equal(result.instrument, "scl90");
  assert.equal(result.totalScore, 180);
  assert.equal(result.maxScore, 450);
  assert.equal(result.overallMean, 2);
  assert.equal(result.positiveCount, 90);
  assert.equal(result.negativeCount, 0);
  assert.equal(result.positiveMean, 2);
  assert.equal(result.sections.length, 10);
  assert.deepEqual(result.sections.map((section) => section.score), Array.from({ length: 10 }, () => 2));
  assert.deepEqual(result.sections.map((section) => section.rawScore), [24, 20, 18, 26, 20, 12, 14, 12, 20, 14]);
  assert.deepEqual(result.sections.map((section) => section.level), Array.from({ length: 10 }, () => "轻度阳性"));
  assert.equal(result.label, "轻度阳性");
});

test("SCL-90 keeps all 1 answers negative and preserves the raw five-point scale", () => {
  const result = scoreAll(1);

  assert.equal(result.kind, "custom");
  if (!isScl90Result(result)) return;

  assert.equal(result.totalScore, 90);
  assert.equal(result.overallMean, 1);
  assert.equal(result.positiveCount, 0);
  assert.equal(result.negativeCount, 90);
  assert.equal(result.positiveMean, 0);
  assert.equal(result.label, "阴性");
  assert.deepEqual(result.sections.map((section) => section.rawScore), [12, 10, 9, 13, 10, 6, 7, 6, 10, 7]);
  assert.deepEqual(result.sections.map((section) => section.level), Array.from({ length: 10 }, () => "阴性"));
});

test("SCL-90 matches the reference report's total-score metrics", () => {
  const answers = [
    ...Array(34).fill(1),
    ...Array(42).fill(3),
    ...Array(14).fill(4),
  ];
  const result = scoreScale(scl90Scale, answers);

  assert.equal(isScl90Result(result), true);
  if (!isScl90Result(result)) return;

  assert.equal(result.totalScore, 216);
  assert.equal(result.maxScore, 450);
  assert.equal(result.overallMean, 2.4);
  assert.equal(result.positiveCount, 56);
  assert.equal(result.negativeCount, 34);
  assert.equal(result.positiveMean, 3.25);
  assert.equal(result.label, "轻度阳性");
});

test("SCL-90 fallback analysis is complete when AI is unavailable", () => {
  const result = scoreAll(1);
  assert.equal(isScl90Result(result), true);
  if (!isScl90Result(result)) return;

  const fallback = buildFallbackScl90Analysis(result);
  assert.equal(fallback.factorAnalyses.length, 10);
  assert.equal(fallback.recommendations.length, 3);
  assert.match(fallback.riskNotice, /不构成医学诊断/);
});

test("SCL-90 AI response parser rejects incomplete model output", () => {
  assert.equal(parseScl90Analysis({ overallSummary: "只有总评" }), null);

  const result = scoreAll(2) as Scl90ScaleResult;
  const fallback = buildFallbackScl90Analysis(result);
  assert.deepEqual(parseScl90Analysis(fallback), fallback);
});
