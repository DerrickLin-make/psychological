import type { DimensionBand, ScaleBand, ScaleDefinition, ScaleDimension } from "@/data/scales";

type ScoredDimension = {
  key: string;
  name: string;
  description: string;
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
};

export type ScaleResult = SumScaleResult | ProfileScaleResult;

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

  const score = Number((total / questionIndexes.length).toFixed(1));
  const band = findBand(dimension.bands, score);

  return {
    key: dimension.key,
    name: dimension.name,
    description: dimension.description,
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

function scoreProfileScale(scale: ScaleDefinition, answers: number[]): ProfileScaleResult {
  if (!scale.dimensions?.length) {
    throw new Error(`Scale "${scale.slug}" is missing profile dimensions.`);
  }

  const dimensions = scale.dimensions.map((dimension) => scoreDimension(scale, dimension, answers));
  const totalScore = answers.reduce((sum, answer, index) => {
    const question = scale.questions[index];
    return sum + getAdjustedScore(scale, answer, question.reverse);
  }, 0);
  const maxScore = scale.questions.length * Math.max(...scale.options.map((option) => option.value));

  return {
    kind: "profile",
    totalScore,
    maxScore,
    normalized: totalScore / maxScore,
    dimensions,
    overview: buildProfileOverview(dimensions),
  };
}

export function scoreScale(scale: ScaleDefinition, answers: number[]): ScaleResult {
  if (answers.length !== scale.questions.length) {
    throw new Error("Answer count does not match question count.");
  }

  return scale.kind === "sum" ? scoreSumScale(scale, answers) : scoreProfileScale(scale, answers);
}
