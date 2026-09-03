import assert from "node:assert/strict";
import test from "node:test";
import { scales } from "../src/data/scales";
import { scoreScale } from "../src/lib/scoring";

test("scale registry contains the expected instruments", () => {
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
    "dass-21",
    "phq-9",
    "gad-7",
    "gse",
    "cbi",
    "bat-23",
    "ipip-big5-50",
    "ffmq-39",
    "erq",
    "mos-social",
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
    "dass-21": 21,
    "phq-9": 9,
    "gad-7": 7,
    gse: 10,
    cbi: 19,
    "bat-23": 33,
    "ipip-big5-50": 50,
    "ffmq-39": 39,
    erq: 10,
    "mos-social": 20,
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

test("Word response options stay instrument-specific", () => {
  const fad = scales.find((scale) => scale.slug === "fad");
  const neo = scales.find((scale) => scale.slug === "neo-ffi");
  assert.ok(fad);
  assert.ok(neo);

  assert.deepEqual(fad.options.map((option) => option.detail), ["完全不像我家", "不太像我家", "比较像我家", "完全像我家"]);
  assert.deepEqual(neo.options.map((option) => option.detail), ["非常不符", "不太符合", "有些符合", "比较符合", "非常符合"]);
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
  assert.equal(sdsResult.band.label, "轻度");

  const sasResult = scoreScale(sas, Array.from({ length: 20 }, () => 4));
  assert.equal(sasResult.kind, "sum");
  assert.equal(sasResult.rawScore, 65);
  assert.equal(sasResult.totalScore, 81);
  assert.equal(sasResult.band.label, "重度");
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
  const epdsRiskResult = scoreScale(epds, [0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
  assert.equal(epdsRiskResult.kind, "sum");
  assert.equal(epdsRiskResult.notices?.length, 1);
  const sclResult = scoreScale(scl90, Array.from({ length: 90 }, () => 1));
  assert.equal(sclResult.kind, "custom");
  assert.equal(sclResult.totalScore, 90);
  assert.equal(sclResult.maxScore, 450);
  assert.equal(scoreScale(bdi, Array.from({ length: 21 }, () => 0)).kind, "sum");
  assert.equal(scoreScale(mbti, Array.from({ length: 93 }, () => 0)).kind, "mbti");
  assert.equal(scoreScale(neo, Array.from({ length: 60 }, () => 3)).kind, "profile");
  assert.equal(scoreScale(marital, Array.from({ length: 5 }, () => 5)).kind, "profile");
  assert.equal(scoreScale(fad, Array.from({ length: 30 }, () => 2)).kind, "profile");
});

test("new evidence-based scales keep their published scoring shapes", () => {
  const dass = scales.find((scale) => scale.slug === "dass-21");
  const phq = scales.find((scale) => scale.slug === "phq-9");
  const gad = scales.find((scale) => scale.slug === "gad-7");
  const gse = scales.find((scale) => scale.slug === "gse");
  const cbi = scales.find((scale) => scale.slug === "cbi");
  const bat = scales.find((scale) => scale.slug === "bat-23");
  const ipip = scales.find((scale) => scale.slug === "ipip-big5-50");
  const ffmq = scales.find((scale) => scale.slug === "ffmq-39");
  const erq = scales.find((scale) => scale.slug === "erq");
  const mos = scales.find((scale) => scale.slug === "mos-social");
  assert.ok(dass);
  assert.ok(phq);
  assert.ok(gad);
  assert.ok(gse);
  assert.ok(cbi);
  assert.ok(bat);
  assert.ok(ipip);
  assert.ok(ffmq);
  assert.ok(erq);
  assert.ok(mos);

  const dassResult = scoreScale(dass, Array.from({ length: 21 }, () => 1));
  assert.equal(dassResult.kind, "profile");
  assert.deepEqual(dassResult.dimensions.map((dimension) => dimension.score), [7, 7, 7]);
  assert.deepEqual(dassResult.dimensions.map((dimension) => dimension.band.label), ["中度", "中度", "正常范围"]);
  const dassRiskResult = scoreScale(dass, [...Array.from({ length: 20 }, () => 0), 1]);
  assert.equal(dassRiskResult.kind, "profile");
  assert.equal(dassRiskResult.notices?.length, 1);

  const phqResult = scoreScale(phq, Array.from({ length: 9 }, () => 0));
  assert.equal(phqResult.kind, "sum");
  assert.equal(phqResult.totalScore, 0);
  const phqRiskResult = scoreScale(phq, [0, 0, 0, 0, 0, 0, 0, 0, 1]);
  assert.equal(phqRiskResult.kind, "sum");
  assert.equal(phqRiskResult.notices?.length, 1);
  assert.equal(scoreScale(gad, Array.from({ length: 7 }, () => 0)).kind, "sum");

  const gseResult = scoreScale(gse, Array.from({ length: 10 }, () => 1));
  assert.equal(gseResult.kind, "profile");
  assert.equal(gseResult.dimensions[0].score, 10);

  const cbiResult = scoreScale(cbi, [
    ...Array.from({ length: 12 }, () => 100),
    0,
    ...Array.from({ length: 6 }, () => 100),
  ]);
  assert.equal(cbiResult.kind, "profile");
  assert.deepEqual(cbiResult.dimensions.map((dimension) => dimension.score), [100, 85.7, 100]);

  const batResult = scoreScale(bat, Array.from({ length: 33 }, () => 1));
  assert.equal(batResult.kind, "profile");
  assert.equal(batResult.dimensions.length, 6);
  assert.equal(batResult.dimensions[0].score, 1);

  const ipipResult = scoreScale(ipip, Array.from({ length: 50 }, () => 3));
  assert.equal(ipipResult.kind, "profile");
  assert.deepEqual(ipipResult.dimensions.map((dimension) => dimension.score), [30, 30, 30, 30, 30]);

  const ffmqResult = scoreScale(ffmq, Array.from({ length: 39 }, () => 3));
  assert.equal(ffmqResult.kind, "profile");
  assert.deepEqual(ffmqResult.dimensions.map((dimension) => dimension.score), [3, 3, 3, 3, 3]);

  const erqResult = scoreScale(erq, Array.from({ length: 10 }, () => 4));
  assert.equal(erqResult.kind, "profile");
  assert.deepEqual(erqResult.dimensions.map((dimension) => dimension.score), [4, 4]);

  const mosResult = scoreScale(mos, [1, ...Array.from({ length: 19 }, () => 3)]);
  assert.equal(mosResult.kind, "custom");
  assert.equal(mosResult.totalScore, 50);
  assert.equal(mosResult.sections.find((section) => section.key === "overall")?.score, 50);
});
