import assert from "node:assert/strict";
import test from "node:test";
import { scales, type ScaleAnswer, type ScaleDefinition } from "../src/data/scales";
import { buildReportDashboard } from "../src/lib/report-dashboard";
import { scoreScale } from "../src/lib/scoring";

function scaleBySlug(slug: string) {
  const scale = scales.find((item) => item.slug === slug);
  assert.ok(scale, `${slug} should be registered`);
  return scale;
}

function sampleAnswers(scale: ScaleDefinition): ScaleAnswer[] {
  if (scale.kind === "mbti") return scale.mbtiQuestions?.map(() => 0) ?? [];
  return scale.questions.map((question) => {
    if (question.inputType === "time") return "23:00";
    if (question.inputType === "duration") return "7:00";
    if (question.inputType === "text") return "无";
    return question.options?.[0]?.value ?? scale.options[0]?.value ?? 0;
  });
}

function ffmqDemoAnswers(scale: ScaleDefinition): ScaleAnswer[] {
  const adjustedByDimension: Record<string, number[]> = {
    observe: [2, 2, 2, 2, 2, 1, 1, 1],
    describe: [3, 3, 3, 3, 3, 3, 2, 2],
    "act-aware": [5, 4, 4, 4, 4, 4, 4, 4],
    nonjudge: [5, 5, 4, 4, 4, 4, 4, 4],
    nonreact: [2, 2, 2, 2, 2, 1, 1],
  };
  const positions: Record<string, number> = {};

  return scale.questions.map((question) => {
    const key = question.dimensionKey ?? "";
    const index = positions[key] ?? 0;
    positions[key] = index + 1;
    const adjusted = adjustedByDimension[key][index];
    return question.reverse ? 6 - adjusted : adjusted;
  });
}

test("dashboard adapter preserves the distinct report modes", () => {
  const cases = [
    ["phq-9", "sum"],
    ["ffmq-39", "profile"],
    ["mbti", "mbti"],
    ["psqi", "custom"],
    ["scl-90", "scl90"],
  ] as const;

  for (const [slug, expectedMode] of cases) {
    const scale = scaleBySlug(slug);
    const result = scoreScale(scale, sampleAnswers(scale));
    assert.equal(buildReportDashboard(scale, result).mode, expectedMode);
  }

  const sum = scaleBySlug("phq-9");
  const sumModel = buildReportDashboard(sum, scoreScale(sum, sampleAnswers(sum)));
  assert.ok(sumModel.gauge);
  assert.equal(sumModel.dimensions.length, 0);

  const mbti = scaleBySlug("mbti");
  const mbtiModel = buildReportDashboard(mbti, scoreScale(mbti, sampleAnswers(mbti)));
  assert.equal(mbtiModel.gauge, undefined);
  assert.equal(mbtiModel.preferences.length, 4);
});

test("every registered scale produces a populated primary data portrait", () => {
  for (const scale of scales) {
    const result = scoreScale(scale, sampleAnswers(scale));
    const model = buildReportDashboard(scale, result);

    if (model.mode === "sum") {
      assert.ok(
        "scoreBands" in model && Array.isArray(model.scoreBands) && model.scoreBands.length > 0,
        `${scale.slug} should expose its configured score bands`,
      );
      assert.equal(model.scoreBands.filter((band) => band.active).length, 1, `${scale.slug} should mark its current band`);
      continue;
    }

    if (model.mode === "mbti") {
      assert.equal(model.preferences.length, 4, `${scale.slug} should expose four preference axes`);
      continue;
    }

    assert.ok(model.dimensions.length > 0, `${scale.slug} should expose dimensions or scored sections`);
  }
});

test("FFMQ demo maps total 114 and five real dimension averages", () => {
  const scale = scaleBySlug("ffmq-39");
  const result = scoreScale(scale, ffmqDemoAnswers(scale));
  assert.equal(result.kind, "profile");
  assert.equal(result.totalScore, 114);
  assert.deepEqual(result.dimensions.map((item) => item.score), [1.6, 2.8, 4.1, 4.3, 1.7]);

  const model = buildReportDashboard(scale, result);
  assert.equal(model.gauge?.normalized, 0.481);
  assert.equal(model.canUseRadar, true);
  assert.deepEqual(model.dimensions.map((item) => item.name), ["观察", "描述", "有意识地行动", "不评判", "不反应"]);
  assert.deepEqual(model.dimensions.map((item) => item.level), ["相对较低", "中间区", "相对较高", "相对较高", "相对较低"]);
});

test("sum portrait uses the configured scale range instead of a percentile claim", () => {
  const scale = scaleBySlug("pcl-5");
  const result = scoreScale(scale, Array.from({ length: 17 }, () => 3));
  const model = buildReportDashboard(scale, result);

  assert.equal(result.kind, "sum");
  assert.equal(result.totalScore, 51);
  assert.equal(model.gauge?.normalized, 0.5);
  assert.deepEqual(model.metrics[2], { label: "量尺位置", value: "50%", hint: "最低计分 17" });
  assert.equal(model.scoreBands.find((band) => band.active)?.label, "较高");
  assert.equal(model.scoreBands[0].end, model.scoreBands[1].start);
  assert.equal(model.scoreBands[1].end, model.scoreBands[2].start);
});
