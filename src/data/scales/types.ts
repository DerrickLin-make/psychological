export type ScaleOption = {
  label: string;
  detail: string;
  value: number;
};

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
};

export type ScaleDimension = {
  key: string;
  name: string;
  description: string;
  bands: DimensionBand[];
};

export type ScaleQuestion = {
  id: string;
  text: string;
  dimensionKey?: string;
  reverse?: boolean;
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
  kind: "sum" | "profile" | "mbti";
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
};
