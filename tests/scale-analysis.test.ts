import assert from "node:assert/strict";
import test from "node:test";
import { scales } from "../src/data/scales";
import { buildFallbackScaleAnalysis } from "../src/lib/scale-analysis";
import { scoreScale } from "../src/lib/scoring";

test("registered scale local analysis provides detailed report sections", () => {
  const scale = scales.find((item) => item.slug === "gad-7");
  assert.ok(scale);
  const result = scoreScale(scale, scale.questions.map(() => 1));
  const analysis = buildFallbackScaleAnalysis(scale, result);

  assert.ok(analysis.overallSummary.length > 20);
  assert.doesNotMatch(analysis.overallSummary, /最高|最低/);
  assert.ok(analysis.dimensionAnalyses.length > 0);
  assert.ok(analysis.dimensionAnalyses.every((item) => item.interpretation.length > 10));
  assert.ok(analysis.recommendations.length >= 2);
  assert.ok(analysis.riskNotice.length > 0);
  assert.ok(analysis.closingMessage.length > 0);
});

test("local analysis preserves scale-specific safety notices and directions", () => {
  const phq = scales.find((scale) => scale.slug === "phq-9");
  const cbi = scales.find((scale) => scale.slug === "cbi");
  assert.ok(phq);
  assert.ok(cbi);

  const phqAnalysis = buildFallbackScaleAnalysis(phq, scoreScale(phq, [0, 0, 0, 0, 0, 0, 0, 0, 1]));
  assert.equal(phqAnalysis.notices.length, 1);
  assert.ok(phqAnalysis.watchPoints.some((point) => point.includes("自伤")));

  const cbiAnalysis = buildFallbackScaleAnalysis(cbi, scoreScale(cbi, Array.from({ length: 19 }, () => 100)));
  assert.ok(cbiAnalysis.dimensionAnalyses.some((item) => item.title === "个人倦怠"));
  assert.equal(cbiAnalysis.strengths.length, 1);
});
