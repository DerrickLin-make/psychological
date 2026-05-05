import assert from "node:assert/strict";
import test from "node:test";
import { anxietyCheckinScale } from "../src/data/scales/anxiety-checkin";
import { mbtiScale } from "../src/data/scales/mbti";
import { personalityProfileScale } from "../src/data/scales/personality-profile";
import { temperamentScale } from "../src/data/scales/temperament";
import type { ScaleDefinition } from "../src/data/scales/types";
import { scoreScale } from "../src/lib/scoring";

function temperamentAnswers(scores: Record<string, number>) {
  return temperamentScale.questions.map((question) => scores[question.dimensionKey ?? ""] ?? 0);
}

test("temperament scoring returns a typical primary type", () => {
  const result = scoreScale(temperamentScale, temperamentAnswers({ choleric: 2, sanguine: -2, phlegmatic: -2, melancholic: -2 }));

  assert.equal(result.kind, "profile");
  assert.equal(result.temperament?.label, "典型型胆汁质");
  assert.equal(result.temperament?.primary[0].key, "choleric");
  assert.equal(result.temperament?.isMixed, false);
});

test("temperament scoring marks close high dimensions as mixed", () => {
  const answers = temperamentAnswers({ choleric: 2, sanguine: 2, phlegmatic: -2, melancholic: -2 });
  const sanguineIndexes = temperamentScale.questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => question.dimensionKey === "sanguine");
  answers[sanguineIndexes[0].index] = 0;

  const result = scoreScale(temperamentScale, answers);

  assert.equal(result.kind, "profile");
  assert.equal(result.temperament?.label, "典型型混合气质（胆汁质 + 多血质）");
  assert.equal(result.temperament?.primary[0].key, "choleric");
  assert.equal(result.temperament?.secondary[0].key, "sanguine");
  assert.equal(result.temperament?.isMixed, true);
});

test("temperament scoring reports unclear when no dimension reaches threshold", () => {
  const result = scoreScale(temperamentScale, temperamentAnswers({}));

  assert.equal(result.kind, "profile");
  assert.equal(result.temperament?.label, "气质倾向不明显");
  assert.equal(result.temperament?.intensity, "unclear");
});

test("sum scoring applies reverse scoring before band lookup", () => {
  const scale: ScaleDefinition = {
    ...anxietyCheckinScale,
    questions: [
      { id: "forward", text: "forward" },
      { id: "reverse", text: "reverse", reverse: true },
    ],
    bands: [
      { min: 0, max: 1, label: "low", emphasis: "", summary: "", recommendation: "" },
      { min: 2, max: 3, label: "middle", emphasis: "", summary: "", recommendation: "" },
      { min: 4, max: 6, label: "high", emphasis: "", summary: "", recommendation: "" },
    ],
  };

  const result = scoreScale(scale, [2, 3]);

  assert.equal(result.kind, "sum");
  assert.equal(result.totalScore, 2);
  assert.equal(result.band.label, "middle");
});

test("sum scoring fails when score falls outside configured bands", () => {
  const scale: ScaleDefinition = {
    ...anxietyCheckinScale,
    questions: [{ id: "outside", text: "outside" }],
    bands: [{ min: 0, max: 1, label: "low", emphasis: "", summary: "", recommendation: "" }],
  };

  assert.throws(() => scoreScale(scale, [3]), /outside configured band ranges/);
});

test("profile scoring averages dimension scores and reverse items", () => {
  const result = scoreScale(personalityProfileScale, [7, 4, 4, 7, 4, 7, 4, 4, 4, 4]);

  assert.equal(result.kind, "profile");
  const extraversion = result.dimensions.find((dimension) => dimension.key === "extraversion");
  assert.equal(extraversion?.score, 4);
  assert.equal(extraversion?.band.label, "均衡");
});

test("mbti scoring counts columns and applies tie breakers", () => {
  const scale: ScaleDefinition = {
    ...mbtiScale,
    mbtiQuestions: [
      { id: "e", text: "", optionA: "E", optionB: "I", columnA: "E", columnB: "I" },
      { id: "i", text: "", optionA: "I", optionB: "E", columnA: "I", columnB: "E" },
      { id: "s", text: "", optionA: "S", optionB: "N", columnA: "S", columnB: "N" },
      { id: "n", text: "", optionA: "N", optionB: "S", columnA: "N", columnB: "S" },
      { id: "t", text: "", optionA: "T", optionB: "F", columnA: "T", columnB: "F" },
      { id: "f", text: "", optionA: "F", optionB: "T", columnA: "F", columnB: "T" },
      { id: "j", text: "", optionA: "J", optionB: "P", columnA: "J", columnB: "P" },
      { id: "p", text: "", optionA: "P", optionB: "J", columnA: "P", columnB: "J" },
    ],
  };

  const result = scoreScale(scale, [0, 0, 0, 0, 0, 0, 0, 0]);

  assert.equal(result.kind, "mbti");
  assert.equal(result.typeCode, "INFP");
  assert.deepEqual(result.pairs.map((pair) => pair.winner), ["I", "N", "F", "P"]);
});
