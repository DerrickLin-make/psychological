import assert from "node:assert/strict";
import test from "node:test";
import { scales } from "../src/data/scales";
import { scoreScale } from "../src/lib/scoring";

test("Word scale registry contains the expected 12 instruments", () => {
  assert.deepEqual(scales.map((scale) => scale.slug), [
    "aas-r",
    "pcl-5",
    "psqi",
    "mbti",
    "neo-ffi",
    "marital-adjustment",
    "fad",
    "sds",
    "sas",
    "epds",
    "scl-90",
    "bdi-ii",
  ]);
});

test("all Word scale question counts match the source scope", () => {
  const counts = Object.fromEntries(scales.map((scale) => [
    scale.slug,
    scale.kind === "mbti" ? scale.mbtiQuestions?.length : scale.questions.length,
  ]));

  assert.deepEqual(counts, {
    "aas-r": 18,
    "pcl-5": 17,
    psqi: 18,
    mbti: 93,
    "neo-ffi": 60,
    "marital-adjustment": 5,
    fad: 30,
    sds: 20,
    sas: 20,
    epds: 10,
    "scl-90": 90,
    "bdi-ii": 21,
  });
});

test("AAS-R and PSQI custom scoring follow the Word component rules", () => {
  const aas = scales.find((scale) => scale.slug === "aas-r");
  const psqi = scales.find((scale) => scale.slug === "psqi");
  assert.ok(aas);
  assert.ok(psqi);

  const aasResult = scoreScale(aas, Array.from({ length: 18 }, () => 3));
  assert.equal(aasResult.kind, "custom");
  assert.equal(aasResult.label, "临界区间");
  assert.equal(aasResult.totalScore, 54);

  const psqiAnswers = ["23:00", 0, "07:00", "7:00", ...Array.from({ length: 10 }, () => 0), 0, 0, 0, 0];
  const psqiResult = scoreScale(psqi, psqiAnswers);
  assert.equal(psqiResult.kind, "custom");
  assert.equal(psqiResult.totalScore, 1);
  assert.equal(psqiResult.metrics?.[0].value, "87.5%");
});

test("standardized self-rating scales use raw score times 1.25", () => {
  const sds = scales.find((scale) => scale.slug === "sds");
  const sas = scales.find((scale) => scale.slug === "sas");
  assert.ok(sds);
  assert.ok(sas);

  const sdsResult = scoreScale(sds, Array.from({ length: 20 }, () => 1));
  assert.equal(sdsResult.kind, "sum");
  assert.equal(sdsResult.rawScore, 50);
  assert.equal(sdsResult.totalScore, 62);
  assert.equal(sdsResult.band.label, "mild");

  const sasResult = scoreScale(sas, Array.from({ length: 20 }, () => 4));
  assert.equal(sasResult.kind, "sum");
  assert.equal(sasResult.rawScore, 65);
  assert.equal(sasResult.totalScore, 81);
  assert.equal(sasResult.band.label, "severe");
});

test("EPDS, SCL-90, BDI-II, MBTI and profile scales score without invented answers", () => {
  const epds = scales.find((scale) => scale.slug === "epds");
  const scl90 = scales.find((scale) => scale.slug === "scl-90");
  const bdi = scales.find((scale) => scale.slug === "bdi-ii");
  const mbti = scales.find((scale) => scale.slug === "mbti");
  const neo = scales.find((scale) => scale.slug === "neo-ffi");
  const marital = scales.find((scale) => scale.slug === "marital-adjustment");
  const fad = scales.find((scale) => scale.slug === "fad");
  assert.ok(epds);
  assert.ok(scl90);
  assert.ok(bdi);
  assert.ok(mbti);
  assert.ok(neo);
  assert.ok(marital);
  assert.ok(fad);

  assert.equal(scoreScale(epds, Array.from({ length: 10 }, () => 0)).kind, "sum");
  assert.equal(scoreScale(scl90, Array.from({ length: 90 }, () => 1)).kind, "custom");
  assert.equal(scoreScale(bdi, Array.from({ length: 21 }, () => 0)).kind, "sum");
  assert.equal(scoreScale(mbti, Array.from({ length: 93 }, () => 0)).kind, "mbti");
  assert.equal(scoreScale(neo, Array.from({ length: 60 }, () => 3)).kind, "profile");
  assert.equal(scoreScale(marital, Array.from({ length: 5 }, () => 5)).kind, "profile");
  assert.equal(scoreScale(fad, Array.from({ length: 30 }, () => 2)).kind, "profile");
});
