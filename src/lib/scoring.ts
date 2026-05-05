import type { DimensionBand, ScaleBand, ScaleDefinition, ScaleDimension } from "@/data/scales";

type ScoredDimension = {
  key: string;
  name: string;
  description: string;
  details?: {
    neuralTraits?: string;
    psychologicalTraits?: string;
    typicalBehavior?: string;
    suitableCareers?: string;
  };
  score: number;
  band: DimensionBand;
};

export type SumScaleResult = {
  kind: "sum";
  totalScore: number;
  maxScore: number;
  normalized: number;
  band: ScaleBand;
};

export type ProfileScaleResult = {
  kind: "profile";
  totalScore: number;
  maxScore: number;
  normalized: number;
  dimensions: ScoredDimension[];
  overview: string;
  temperament?: {
    label: string;
    summary: string;
    primary: ScoredDimension[];
    secondary: ScoredDimension[];
    intensity: "typical" | "general" | "tendency" | "unclear";
    isMixed: boolean;
  };
};

export type MbtiScaleResult = {
  kind: "mbti";
  totalScore: number;
  maxScore: number;
  normalized: number;
  /** Raw counts for each dimension pole */
  columns: Record<string, number>;
  /** Final 4-letter type code, e.g. "INFJ" */
  typeCode: string;
  /** Matched type profile */
  typeProfile: {
    code: string;
    nickname: string;
    summary: string;
    detailedDescription?: string;
    suitableFields: string;
    suitableCareers: string;
  };
  /** Per-pair breakdown */
  pairs: Array<{
    left: string;
    right: string;
    leftScore: number;
    rightScore: number;
    winner: string;
  }>;
};

export type ScaleResult = SumScaleResult | ProfileScaleResult | MbtiScaleResult;

function getAdjustedScore(scale: ScaleDefinition, raw: number, reverse?: boolean) {
  if (!reverse) {
    return raw;
  }

  const values = scale.options.map((option) => option.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min + max - raw;
}

function findBand<T extends { min: number; max: number }>(bands: T[], value: number) {
  return bands.find((band) => value >= band.min && value <= band.max) ?? bands[bands.length - 1];
}

function scoreSumScale(scale: ScaleDefinition, answers: number[]): SumScaleResult {
  if (!scale.bands?.length) {
    throw new Error(`Scale "${scale.slug}" is missing sum bands.`);
  }

  const totalScore = answers.reduce((sum, answer, index) => {
    const question = scale.questions[index];
    return sum + getAdjustedScore(scale, answer, question.reverse);
  }, 0);

  const maxScore = scale.questions.length * Math.max(...scale.options.map((option) => option.value));
  const band = findBand(scale.bands, totalScore);

  return {
    kind: "sum",
    totalScore,
    maxScore,
    normalized: totalScore / maxScore,
    band,
  };
}

function scoreDimension(scale: ScaleDefinition, dimension: ScaleDimension, answers: number[]) {
  const questionIndexes = scale.questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => question.dimensionKey === dimension.key);

  const total = questionIndexes.reduce((sum, item) => {
    return sum + getAdjustedScore(scale, answers[item.index], item.question.reverse);
  }, 0);

  /* For profile scales with negative-capable options (e.g. temperament -2..+2),
     use raw total instead of averaged score so dimension bands can work with
     the full range (-30..+30). For standard profile scales (all positive values),
     keep the existing averaged approach. */
  const minOptionValue = Math.min(...scale.options.map((o) => o.value));
  const useRawTotal = minOptionValue < 0;

  const score = useRawTotal
    ? total
    : Number((total / questionIndexes.length).toFixed(1));

  const band = findBand(dimension.bands, score);

  return {
    key: dimension.key,
    name: dimension.name,
    description: dimension.description,
    details: dimension.details,
    score,
    band,
  };
}

function buildProfileOverview(dimensions: ScoredDimension[]) {
  const sorted = [...dimensions].sort((left, right) => right.score - left.score);
  const strongest = sorted.slice(0, 2).map((item) => item.name).join("、");
  const support = sorted[sorted.length - 1];

  return `当前画像中更突出的维度是${strongest}；相对需要进一步结合访谈理解的是${support.name}。`;
}

function buildTemperamentResult(scale: ScaleDefinition, dimensions: ScoredDimension[]): ProfileScaleResult["temperament"] {
  const rules = scale.temperamentRules;

  if (!rules) {
    return undefined;
  }

  const sorted = [...dimensions].sort((left, right) => right.score - left.score);
  const highest = sorted[0];
  const secondary = sorted.slice(1).filter((dimension) => highest.score - dimension.score <= rules.mixedDiffThreshold);
  const isMixed = secondary.length > 0;

  if (highest.score < rules.dominantThreshold) {
    return {
      label: "气质倾向不明显",
      summary: `最高维度为${highest.name}（${highest.score} 分），尚未达到主要气质判定阈值，建议结合访谈继续观察。`,
      primary: [highest],
      secondary: [],
      intensity: "unclear",
      isMixed: false,
    };
  }

  const intensity = highest.score > rules.typicalThreshold
    ? "typical"
    : highest.score >= 10
      ? "general"
      : "tendency";
  const intensityLabel = intensity === "typical" ? "典型型" : intensity === "general" ? "一般型" : "倾向型";
  const mixedDimensions = [highest, ...secondary];
  const names = mixedDimensions.map((dimension) => dimension.name).join(" + ");
  const label = isMixed ? `${intensityLabel}混合气质（${names}）` : `${intensityLabel}${highest.name}`;
  const summary = isMixed
    ? `${mixedDimensions.map((dimension) => `${dimension.name} ${dimension.score} 分`).join("，")}，最高维度差值不超过 ${rules.mixedDiffThreshold} 分，判定为混合气质。`
    : `${highest.name}得分最高（${highest.score} 分），与其他维度差距达到主要气质判定要求，判定为${label}。`;

  return {
    label,
    summary,
    primary: [highest],
    secondary,
    intensity,
    isMixed,
  };
}

function scoreProfileScale(scale: ScaleDefinition, answers: number[]): ProfileScaleResult {
  if (!scale.dimensions?.length) {
    throw new Error(`Scale "${scale.slug}" is missing profile dimensions.`);
  }

  const dimensions = scale.dimensions.map((dimension) => scoreDimension(scale, dimension, answers));
  const totalScore = answers.reduce((sum, answer, index) => {
    const question = scale.questions[index];
    return sum + getAdjustedScore(scale, answer, question.reverse);
  }, 0);

  const optionValues = scale.options.map((option) => option.value);
  const maxPerQuestion = Math.max(...optionValues);
  const minPerQuestion = Math.min(...optionValues);
  const maxScore = scale.questions.length * maxPerQuestion;
  const minScore = scale.questions.length * minPerQuestion;
  const range = maxScore - minScore;
  const normalized = range > 0 ? (totalScore - minScore) / range : 0;
  const temperament = buildTemperamentResult(scale, dimensions);

  return {
    kind: "profile",
    totalScore,
    maxScore,
    normalized,
    dimensions,
    overview: temperament?.summary ?? buildProfileOverview(dimensions),
    temperament,
  };
}

/** MBTI scoring: count A/B choices into 8 dimension columns, compare 4 pairs */
function scoreMbtiScale(scale: ScaleDefinition, answers: number[]): MbtiScaleResult {
  const mbtiQuestions = scale.mbtiQuestions;
  const mbtiTypes = scale.mbtiTypes;

  if (!mbtiQuestions?.length || !mbtiTypes?.length) {
    throw new Error(`Scale "${scale.slug}" is missing MBTI questions or type profiles.`);
  }

  // Initialize column counters
  const columns: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  // Count answers into columns (0 = A, 1 = B)
  for (let i = 0; i < mbtiQuestions.length; i++) {
    const question = mbtiQuestions[i];
    const answer = answers[i]; // 0 for A, 1 for B
    if (answer === 0) {
      columns[question.columnA]++;
    } else {
      columns[question.columnB]++;
    }
  }

  // Compare 4 pairs with tie-breaking rules from the document
  const PAIRS: Array<[string, string, string]> = [
    ["E", "I", "I"], // E=I → take I
    ["S", "N", "N"], // S=N → take N
    ["T", "F", "F"], // T=F → take F
    ["J", "P", "P"], // J=P → take P
  ];

  const pairs = PAIRS.map(([left, right, tieBreaker]) => {
    const leftScore = columns[left];
    const rightScore = columns[right];
    const winner = leftScore > rightScore ? left : leftScore < rightScore ? right : tieBreaker;
    return { left, right, leftScore, rightScore, winner };
  });

  const typeCode = pairs.map((pair) => pair.winner).join("");
  const typeProfile = mbtiTypes.find((t) => t.code === typeCode) ?? mbtiTypes[0];

  const totalScore = mbtiQuestions.length;
  const maxScore = mbtiQuestions.length;

  return {
    kind: "mbti",
    totalScore,
    maxScore,
    normalized: 1,
    columns,
    typeCode,
    typeProfile,
    pairs,
  };
}

export function scoreScale(scale: ScaleDefinition, answers: number[]): ScaleResult {
  if (scale.kind === "mbti") {
    const expectedLength = scale.mbtiQuestions?.length ?? 0;
    if (answers.length !== expectedLength) {
      throw new Error("Answer count does not match MBTI question count.");
    }
    return scoreMbtiScale(scale, answers);
  }

  if (answers.length !== scale.questions.length) {
    throw new Error("Answer count does not match question count.");
  }

  return scale.kind === "sum" ? scoreSumScale(scale, answers) : scoreProfileScale(scale, answers);
}
