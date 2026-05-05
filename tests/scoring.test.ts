import assert from "node:assert/strict";
import test from "node:test";
import { temperamentScale } from "../src/data/scales/temperament";
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
