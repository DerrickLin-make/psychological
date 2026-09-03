import assert from "node:assert/strict";
import test from "node:test";
import { scales } from "../src/data/scales";
import { anxietyCheckinScale } from "../src/data/scales/anxiety-checkin";
import { buildFallbackScaleAnalysis } from "../src/lib/scale-analysis";
import { scoreScale } from "../src/lib/scoring";

test("generic scale local analysis provides detailed report sections", () => {
  const result = scoreScale(anxietyCheckinScale, anxietyCheckinScale.questions.map(() => 1));
  const analysis = buildFallbackScaleAnalysis(anxietyCheckinScale, result);

  assert.ok(analysis.overallSummary.length > 20);
  assert.ok(analysis.dimensionAnalyses.length > 0);
  assert.ok(analysis.recommendations.length >= 3);
  assert.ok(analysis.watchPoints.length >= 2);
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
  assert.ok(cbiAnalysis.watchPoints.some((point) => point.includes("个人倦怠")));
  assert.equal(cbiAnalysis.strengths.length, 1);
});
