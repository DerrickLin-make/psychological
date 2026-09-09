import assert from "node:assert/strict";
import test from "node:test";
import {
  clearAssessmentDraft,
  loadAssessmentDraft,
  saveAssessmentDraft,
  type AssessmentDraft,
  type AssessmentDraftStorage,
} from "../src/lib/assessment-draft";

function createStorage(): AssessmentDraftStorage {
  const values = new Map<string, string>();

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

const draft: AssessmentDraft = {
  scaleSlug: "scl-90",
  questionCount: 3,
  currentIndex: 2,
  answers: [1, 2, null],
  startedAt: 1_789_000_000_000,
  profile: { age: "18–25 岁", gender: "男" },
};

test("assessment draft round-trips within session storage", () => {
  const storage = createStorage();

  saveAssessmentDraft(storage, draft);

  assert.deepEqual(loadAssessmentDraft(storage, "scl-90", 3), draft);
});

test("assessment draft rejects stale or malformed progress", () => {
  const storage = createStorage();
  saveAssessmentDraft(storage, draft);

  assert.equal(loadAssessmentDraft(storage, "phq-9", 3), null);
  assert.equal(loadAssessmentDraft(storage, "scl-90", 90), null);

  storage.setItem("mindscope:assessment-draft:scl-90", "{not-json");
  assert.equal(loadAssessmentDraft(storage, "scl-90", 3), null);
});

test("assessment draft can be cleared after completion or reset", () => {
  const storage = createStorage();
  saveAssessmentDraft(storage, draft);

  clearAssessmentDraft(storage, "scl-90");

  assert.equal(loadAssessmentDraft(storage, "scl-90", 3), null);
});
