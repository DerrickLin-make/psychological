import type { ScaleAnswer } from "@/data/scales";
import type { Scl90Profile } from "@/lib/scl90-report";

const DRAFT_VERSION = 1;
const DRAFT_KEY_PREFIX = "mindscope:assessment-draft:";

export type AssessmentDraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type AssessmentDraft = {
  scaleSlug: string;
  questionCount: number;
  currentIndex: number;
  answers: Array<ScaleAnswer | null>;
  startedAt: number;
  profile: Scl90Profile;
};

type StoredAssessmentDraft = AssessmentDraft & {
  version: typeof DRAFT_VERSION;
};

function draftKey(scaleSlug: string) {
  return `${DRAFT_KEY_PREFIX}${scaleSlug}`;
}

function isProfile(value: unknown): value is Scl90Profile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Record<string, unknown>;
  return (profile.age === undefined || typeof profile.age === "string")
    && (profile.gender === undefined || typeof profile.gender === "string");
}

function isAnswer(value: unknown): value is ScaleAnswer | null {
  return value === null || typeof value === "string" || (typeof value === "number" && Number.isFinite(value));
}

export function loadAssessmentDraft(
  storage: AssessmentDraftStorage,
  scaleSlug: string,
  questionCount: number,
): AssessmentDraft | null {
  try {
    const raw = storage.getItem(draftKey(scaleSlug));
    if (!raw) return null;

    const draft = JSON.parse(raw) as Partial<StoredAssessmentDraft>;
    if (
      draft.version !== DRAFT_VERSION
      || draft.scaleSlug !== scaleSlug
      || draft.questionCount !== questionCount
      || typeof draft.currentIndex !== "number"
      || !Number.isInteger(draft.currentIndex)
      || draft.currentIndex < 0
      || draft.currentIndex >= questionCount
      || !Array.isArray(draft.answers)
      || draft.answers.length !== questionCount
      || !draft.answers.every(isAnswer)
      || typeof draft.startedAt !== "number"
      || !Number.isFinite(draft.startedAt)
      || !isProfile(draft.profile)
    ) {
      return null;
    }

    return {
      scaleSlug: draft.scaleSlug,
      questionCount: draft.questionCount,
      currentIndex: draft.currentIndex,
      answers: draft.answers,
      startedAt: draft.startedAt,
      profile: draft.profile,
    };
  } catch {
    return null;
  }
}

export function saveAssessmentDraft(storage: AssessmentDraftStorage, draft: AssessmentDraft) {
  const storedDraft: StoredAssessmentDraft = { version: DRAFT_VERSION, ...draft };
  storage.setItem(draftKey(draft.scaleSlug), JSON.stringify(storedDraft));
}

export function clearAssessmentDraft(storage: AssessmentDraftStorage, scaleSlug: string) {
  storage.removeItem(draftKey(scaleSlug));
}
