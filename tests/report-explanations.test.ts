import assert from "node:assert/strict";
import test from "node:test";
import { scales } from "../src/data/scales";
import { reportExplanations } from "../src/data/report-explanations";
import { resolveReportExplanations } from "../src/lib/report-explanations";
import { scoreScale } from "../src/lib/scoring";

function sampleAnswers(scale: (typeof scales)[number]) {
  if (scale.kind === "mbti") {
    return scale.mbtiQuestions?.map(() => 0) ?? [];
  }

  return scale.questions.map((question) => {
    if (question.inputType === "time") return "23:00";
    if (question.inputType === "duration") return "7:00";
    if (question.inputType === "text") return "无";
    return question.options?.[0]?.value ?? scale.options[0]?.value ?? 0;
  });
}

test("every registered scale has a complete local explanation entry", () => {
  assert.equal(scales.length, 22);

  for (const scale of scales) {
    const explanation = reportExplanations[scale.slug];
    assert.ok(explanation, `${scale.slug} should have an explanation entry`);
    assert.equal(explanation.scaleSlug, scale.slug);
    assert.ok(explanation.version.length > 0);
    assert.ok(explanation.sources.length > 0);
    assert.ok(explanation.limitations.length > 0);
  }
});

test("resolver covers every actual factor and keeps complete text fields", () => {
  for (const scale of scales) {
    const result = scoreScale(scale, sampleAnswers(scale));
    const resolved = resolveReportExplanations(scale, result);

    assert.ok(resolved.factors.length > 0, `${scale.slug} should expose factors`);
    for (const factor of resolved.factors) {
      assert.ok(factor.title.length > 0);
      assert.ok(factor.level.length > 0);
      assert.ok(factor.construct.length > 10);
      assert.ok(factor.interpretation.length > 10);
      assert.ok(factor.manifestations.length > 0);
      assert.ok(factor.impact.length > 10);
      assert.ok(factor.recommendations.length > 0);
    }
    for (const profile of resolved.profiles) {
      assert.ok(profile.title.length > 0);
      assert.ok(profile.value.length > 0);
      assert.ok(profile.interpretation.length > 10);
      assert.ok(profile.manifestations.length > 0);
      assert.ok(profile.recommendations.length > 0);
    }
    assert.ok(resolved.overallSummary.length > 20);
    assert.ok(resolved.limitations.length > 0);
    assert.ok(resolved.sources.length > 0);
  }
});

test("special results are represented by fixed profiles", () => {
  const mbti = scales.find((scale) => scale.slug === "mbti");
  const aas = scales.find((scale) => scale.slug === "aas-r");
  assert.ok(mbti);
  assert.ok(aas);

  const mbtiResult = resolveReportExplanations(mbti, scoreScale(mbti, sampleAnswers(mbti)));
  const aasResult = resolveReportExplanations(aas, scoreScale(aas, sampleAnswers(aas)));

  assert.equal(mbtiResult.factors.length, 4);
  assert.equal(mbtiResult.profiles.length, 5);
  assert.equal(aasResult.profiles.length, 1);
  assert.equal(aasResult.factors.length, 4);
});

test("registered score bands and continuous factors resolve without drift", () => {
  for (const scale of scales) {
    const explanation = reportExplanations[scale.slug];
    const result = scoreScale(scale, sampleAnswers(scale));

    for (const band of scale.bands ?? []) assert.ok(band.bandKey, `${scale.slug} sum bands should have stable keys`);
    for (const dimension of scale.dimensions ?? []) {
      for (const band of dimension.bands) assert.ok(band.bandKey, `${scale.slug}/${dimension.key} bands should have stable keys`);
    }

    const expectedFactorKeys = result.kind === "sum"
      ? ["total"]
      : result.kind === "profile"
        ? result.dimensions.map((dimension) => dimension.key)
        : result.kind === "mbti"
          ? result.pairs.map((pair) => `${pair.left}${pair.right}`)
          : result.sections.filter((section) => section.key !== "network").map((section) => section.key);
    assert.deepEqual(Object.keys(explanation.factors).sort(), expectedFactorKeys.sort(), `${scale.slug} factor registry should match output`);
    for (const factor of Object.values(explanation.factors)) {
      assert.ok(factor.limitations.length > 0, `${scale.slug}/${factor.key} should have limitations`);
      assert.ok(factor.sources.length > 0, `${scale.slug}/${factor.key} should have sources`);
      assert.equal(new Set(Object.keys(factor.bands)).size, Object.keys(factor.bands).length);
    }

    if (result.kind === "sum") {
      const factor = explanation.factors.total;
      assert.ok(factor, `${scale.slug} should define total`);
      assert.ok(factor.bands[result.band.bandKey ?? `range-${result.band.min}-${result.band.max}`]);
      for (const band of scale.bands ?? []) {
        assert.ok(factor.bands[band.bandKey ?? `range-${band.min}-${band.max}`]);
      }
    }

    if (result.kind === "profile") {
      for (const dimension of result.dimensions) {
        const factor = explanation.factors[dimension.key];
        assert.ok(factor, `${scale.slug} should define ${dimension.key}`);
        if (factor.bands.continuous) {
          assert.equal(factor.bands.continuous.mode, "continuous");
        } else {
          const configuredDimension = scale.dimensions?.find((item) => item.key === dimension.key);
          for (const band of configuredDimension?.bands ?? []) {
            assert.ok(factor.bands[band.bandKey ?? `range-${band.min}-${band.max}`]);
          }
        }
      }
    }

    if (result.kind === "mbti") {
      for (const pair of result.pairs) {
        const factor = explanation.factors[`${pair.left}${pair.right}`];
        assert.ok(factor.bands[`winner-${pair.left}`]);
        assert.ok(factor.bands[`winner-${pair.right}`]);
      }
    }

    if (result.kind === "custom" && !("instrument" in result)) {
      for (const section of result.sections) {
        if (section.key === "network") continue;
        const factor = explanation.factors[section.key];
        assert.ok(factor, `${scale.slug} should define ${section.key}`);
        if (factor.bands.continuous) {
          assert.equal(factor.bands.continuous.mode, "continuous");
        } else {
          assert.deepEqual(Object.keys(factor.bands).sort(), ["score-0", "score-1", "score-2", "score-3"]);
        }
      }
    }
  }

  const mbti = reportExplanations.mbti;
  assert.equal(Object.keys(mbti.profiles?.axes.values ?? {}).length, 8);
  assert.equal(Object.keys(mbti.profiles?.type.values ?? {}).length, 16);
  const aas = reportExplanations["aas-r"];
  assert.deepEqual(Object.keys(aas.profiles?.["attachment-type"].values ?? {}).sort(), ["boundary", "dismissing", "fearful", "preoccupied", "secure"]);
});

test("band boundaries and continuous scores use the fixed library", () => {
  const phq = scales.find((scale) => scale.slug === "phq-9");
  const cbi = scales.find((scale) => scale.slug === "cbi");
  assert.ok(phq);
  assert.ok(cbi);

  const lower = resolveReportExplanations(phq, scoreScale(phq, [1, 1, 1, 1, 0, 0, 0, 0, 0]));
  const upper = resolveReportExplanations(phq, scoreScale(phq, [2, 1, 1, 1, 0, 0, 0, 0, 0]));
  assert.equal(lower.factors[0].level, "极少");
  assert.equal(upper.factors[0].level, "轻度");

  const lowCbi = resolveReportExplanations(cbi, scoreScale(cbi, Array.from({ length: 19 }, () => 0)));
  const highCbi = resolveReportExplanations(cbi, scoreScale(cbi, Array.from({ length: 19 }, () => 100)));
  assert.ok(lowCbi.factors.every((factor) => factor.mode === "continuous"));
  assert.ok(highCbi.factors.every((factor) => factor.mode === "continuous"));
  assert.notEqual(lowCbi.factors[0].score, highCbi.factors[0].score);
});
