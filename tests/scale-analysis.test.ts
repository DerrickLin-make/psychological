import assert from "node:assert/strict";
import test from "node:test";
import { anxietyCheckinScale } from "../src/data/scales/anxiety-checkin";
import { buildFallbackScaleAnalysis, parseScaleAnalysis } from "../src/lib/scale-analysis";
import { scoreScale } from "../src/lib/scoring";

test("generic scale fallback provides detailed report sections", () => {
  const result = scoreScale(anxietyCheckinScale, anxietyCheckinScale.questions.map(() => 1));
  const analysis = buildFallbackScaleAnalysis(anxietyCheckinScale, result);

  assert.ok(analysis.overallSummary.length > 20);
  assert.ok(analysis.dimensionAnalyses.length > 0);
  assert.ok(analysis.recommendations.length >= 3);
  assert.ok(analysis.watchPoints.length >= 2);
});

test("generic scale analysis parser rejects incomplete AI output", () => {
  assert.equal(parseScaleAnalysis({ overallSummary: "只有总体结论" }), null);
  assert.ok(parseScaleAnalysis({
    overallSummary: "总体解读",
    dimensionAnalyses: [{ key: "total", title: "总分", level: "低", explanation: "分项说明" }],
    strengths: ["优势"],
    recommendations: ["建议一", "建议二"],
    watchPoints: ["关注点"],
    riskNotice: "使用边界",
    closingMessage: "结语",
  }));
});
