export type ScaleOption = {
  label: string;
  detail: string;
  value: number;
};

export type ScaleAnswer = number | string;

export type ScaleInputType = "choice" | "time" | "duration" | "text";

export type ScaleBand = {
  min: number;
  max: number;
  label: string;
  emphasis: string;
  summary: string;
  recommendation: string;
};

export type DimensionBand = {
  min: number;
  max: number;
  label: string;
  summary: string;
  recommendation?: string;
  tone?: "positive" | "caution" | "neutral";
};

export type ScaleDimension = {
  key: string;
  name: string;
  description: string;
  direction?: "positive" | "concern" | "descriptive";
  scoreMode?: "average" | "sum";
  details?: {
    neuralTraits?: string;
    psychologicalTraits?: string;
    typicalBehavior?: string;
    suitableCareers?: string;
  };
  bands: DimensionBand[];
};

export type ScaleQuestion = {
  id: string;
  text: string;
  dimensionKey?: string;
  reverse?: boolean;
  options?: ScaleOption[];
  inputType?: ScaleInputType;
  placeholder?: string;
};

/** MBTI binary question: each option maps to a dimension pole */
export type MbtiQuestion = {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  /** Which dimension column A scores into (E/I/S/N/T/F/J/P) */
  columnA: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
  /** Which dimension column B scores into */
  columnB: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
};

/** Full MBTI type description with career advice */
export type MbtiTypeProfile = {
  code: string;
  nickname: string;
  summary: string;
  detailedDescription?: string;
  suitableFields: string;
  suitableCareers: string;
};

/** Temperament evaluation rule metadata */
export type TemperamentEvalRule = {
  dominantThreshold: number;
  mixedDiffThreshold: number;
  typicalThreshold: number;
};

export type ScaleDefinition = {
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  category: string;
  summary: string;
  intro: string;
  estimatedMinutes: number;
  scoringNote: string;
  translationNote?: string;
  sourceNote?: string;
  kind: "sum" | "profile" | "mbti" | "custom";
  options: ScaleOption[];
  questions: ScaleQuestion[];
  bands?: ScaleBand[];
  dimensions?: ScaleDimension[];
  /** MBTI-specific: binary questions with A/B dimension mapping */
  mbtiQuestions?: MbtiQuestion[];
  /** MBTI-specific: 16 type profiles */
  mbtiTypes?: MbtiTypeProfile[];
  /** Temperament-specific: evaluation thresholds */
  temperamentRules?: TemperamentEvalRule;
  customScoringKey?: "aas" | "psqi" | "scl90" | "mos-social";
  standardize?: "times-1.25-floor";
};
