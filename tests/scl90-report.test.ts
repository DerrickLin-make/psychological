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
  assert.equal(result.totalScore, 90);
  assert.equal(result.overallMean, 1);
  assert.equal(result.positiveCount, 90);
  assert.equal(result.positiveMean, 1);
  assert.equal(result.sections.length, 10);
  assert.deepEqual(result.sections.map((section) => section.score), Array.from({ length: 10 }, () => 1));
  assert.deepEqual(result.sections.map((section) => section.level), Array.from({ length: 10 }, () => "轻度"));
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
