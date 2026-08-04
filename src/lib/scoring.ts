import type {
  DimensionBand,
  ScaleAnswer,
  ScaleBand,
  ScaleDefinition,
  ScaleDimension,
  ScaleQuestion,
} from "@/data/scales";

type ScoredDimension = {
  key: string;
  name: string;
  description: string;
  details?: ScaleDimension["details"];
  score: number;
  band: DimensionBand;
};

export type SumScaleResult = {
  kind: "sum";
  totalScore: number;
  rawScore?: number;
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
  columns: Record<string, number>;
  typeCode: string;
  typeProfile: {
    code: string;
    nickname: string;
    summary: string;
    detailedDescription?: string;
    suitableFields: string;
    suitableCareers: string;
  };
  pairs: Array<{
    left: string;
    right: string;
    leftScore: number;
    rightScore: number;
    winner: string;
  }>;
};

export type CustomSection = {
  key: string;
  label: string;
  score: number;
  maxScore?: number;
  summary?: string;
};

export type CustomScaleResult = {
  kind: "custom";
  totalScore: number;
  maxScore: number;
  normalized: number;
  label: string;
  summary: string;
  sections: CustomSection[];
  metrics?: Array<{ label: string; value: string | number }>;
};

export type ScaleResult = SumScaleResult | ProfileScaleResult | MbtiScaleResult | CustomScaleResult;

function optionsFor(scale: ScaleDefinition, question: ScaleQuestion) {
  return question.options ?? scale.options;
}

function numericAnswer(answer: ScaleAnswer | undefined, label: string) {
  if (typeof answer !== "number" || !Number.isFinite(answer)) {
    throw new Error(`${label} must be numeric.`);
  }
  return answer;
}

function getAdjustedScore(scale: ScaleDefinition, question: ScaleQuestion, raw: number) {
  if (!question.reverse) {
    return raw;
  }

  const values = optionsFor(scale, question).map((option) => option.value);
  return Math.min(...values) + Math.max(...values) - raw;
}

function findBand<T extends { min: number; max: number }>(bands: T[], value: number) {
  const band = bands.find((item) => value >= item.min && value <= item.max);

  if (!band) {
    throw new Error(`Score ${value} is outside configured band ranges.`);
  }

  return band;
}

function scoreSumScale(scale: ScaleDefinition, answers: ScaleAnswer[]): SumScaleResult {
  if (!scale.bands?.length) {
    throw new Error(`Scale "${scale.slug}" is missing sum bands.`);
  }

  const scores = answers.map((answer, index) =>
    getAdjustedScore(scale, scale.questions[index], numericAnswer(answer, `Answer ${index + 1}`)),
  );
  const rawScore = scores.reduce((sum, answer) => sum + answer, 0);
  const rawMaxScore = scale.questions.reduce(
    (sum, question) => sum + Math.max(...optionsFor(scale, question).map((option) => option.value)),
    0,
  );
  const totalScore = scale.standardize === "times-1.25-floor" ? Math.floor(rawScore * 1.25) : rawScore;
  const maxScore = scale.standardize === "times-1.25-floor" ? Math.floor(rawMaxScore * 1.25) : rawMaxScore;

  return {
    kind: "sum",
    totalScore,
    ...(scale.standardize ? { rawScore } : {}),
    maxScore,
    normalized: maxScore > 0 ? totalScore / maxScore : 0,
    band: findBand(scale.bands, totalScore),
  };
}

function scoreDimension(scale: ScaleDefinition, dimension: ScaleDimension, answers: ScaleAnswer[]) {
  const questionIndexes = scale.questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => question.dimensionKey === dimension.key);
  const total = questionIndexes.reduce((sum, item) => {
    const raw = numericAnswer(answers[item.index], `Answer ${item.index + 1}`);
    return sum + getAdjustedScore(scale, item.question, raw);
  }, 0);
  const minOptionValue = Math.min(...scale.options.map((option) => option.value));
  const score = dimension.scoreMode === "sum" || minOptionValue < 0
    ? total
    : Number((total / questionIndexes.length).toFixed(1));

  return {
    key: dimension.key,
    name: dimension.name,
    description: dimension.description,
    details: dimension.details,
    score,
    band: findBand(dimension.bands, score),
  };
}

function buildProfileOverview(dimensions: ScoredDimension[]) {
  const sorted = [...dimensions].sort((left, right) => right.score - left.score);
  const strongest = sorted.slice(0, 2).map((item) => item.name).join("、");
  const support = sorted[sorted.length - 1];
  return `当前画像中更突出的维度是${strongest}；相对需要进一步结合访谈理解的是${support.name}。`;
}

function buildTemperamentResult(scale: ScaleDefinition, dimensions: ScoredDimension[]) {
  const rules = scale.temperamentRules;
  if (!rules) return undefined;

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
      intensity: "unclear" as const,
      isMixed: false,
    };
  }

  const intensity: "typical" | "general" | "tendency" = highest.score > rules.typicalThreshold
    ? "typical"
    : highest.score >= 10
      ? "general"
      : "tendency";
  const intensityLabel = intensity === "typical" ? "典型型" : intensity === "general" ? "一般型" : "倾向型";
  const mixedDimensions = [highest, ...secondary];
  const names = mixedDimensions.map((dimension) => dimension.name).join(" + ");
  const label = isMixed ? `${intensityLabel}混合气质（${names}）` : `${intensityLabel}${highest.name}`;
  const summary = isMixed
    ? `${mixedDimensions.map((dimension) => `${dimension.name} ${dimension.score} 分`).join("、")}，最高维度差值不超过 ${rules.mixedDiffThreshold} 分，判定为混合气质。`
    : `${highest.name}得分最高（${highest.score} 分），与其他维度差距达到主要气质判定要求，判定为${label}。`;

  return { label, summary, primary: [highest], secondary, intensity, isMixed };
}

function scoreProfileScale(scale: ScaleDefinition, answers: ScaleAnswer[]): ProfileScaleResult {
  if (!scale.dimensions?.length) {
    throw new Error(`Scale "${scale.slug}" is missing profile dimensions.`);
  }

  const dimensions = scale.dimensions.map((dimension) => scoreDimension(scale, dimension, answers));
  const totalScore = answers.reduce<number>((sum, answer, index) => {
    const raw = numericAnswer(answer, `Answer ${index + 1}`);
    return sum + getAdjustedScore(scale, scale.questions[index], raw);
  }, 0);
  const values = scale.options.map((option) => option.value);
  const maxScore = scale.questions.length * Math.max(...values);
  const minScore = scale.questions.length * Math.min(...values);
  const normalized = maxScore === minScore ? 0 : (totalScore - minScore) / (maxScore - minScore);
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

function scoreMbtiScale(scale: ScaleDefinition, answers: ScaleAnswer[]): MbtiScaleResult {
  const mbtiQuestions = scale.mbtiQuestions;
  const mbtiTypes = scale.mbtiTypes;
  if (!mbtiQuestions?.length || !mbtiTypes?.length) {
    throw new Error(`Scale "${scale.slug}" is missing MBTI questions or type profiles.`);
  }

  const columns: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  mbtiQuestions.forEach((question, index) => {
    const answer = numericAnswer(answers[index], `Answer ${index + 1}`);
    columns[answer === 0 ? question.columnA : question.columnB]++;
  });

  const pairs: Array<[string, string, string]> = [
    ["E", "I", "I"],
    ["S", "N", "N"],
    ["T", "F", "F"],
    ["J", "P", "P"],
  ].map(([left, right, tieBreaker]) => [left, right, tieBreaker]);
  const scoredPairs = pairs.map(([left, right, tieBreaker]) => {
    const leftScore = columns[left];
    const rightScore = columns[right];
    const winner = leftScore > rightScore ? left : leftScore < rightScore ? right : tieBreaker;
    return { left, right, leftScore, rightScore, winner };
  });
  const typeCode = scoredPairs.map((pair) => pair.winner).join("");
  const typeProfile = mbtiTypes.find((profile) => profile.code === typeCode) ?? mbtiTypes[0];

  return {
    kind: "mbti",
    totalScore: mbtiQuestions.length,
    maxScore: mbtiQuestions.length,
    normalized: 1,
    columns,
    typeCode,
    typeProfile,
    pairs: scoredPairs,
  };
}

function parseClock(value: ScaleAnswer | undefined, label: string) {
  if (typeof value !== "string" || !/^\d{1,2}:\d{2}$/.test(value)) {
    throw new Error(`${label} must use HH:MM format.`);
  }
  const [hours, minutes] = value.split(":").map(Number);
  if (hours > 23 || minutes > 59) throw new Error(`${label} is invalid.`);
  return hours * 60 + minutes;
}

function parseDuration(value: ScaleAnswer | undefined, label: string) {
  if (typeof value !== "string" || !/^\d{1,2}:\d{2}$/.test(value)) {
    throw new Error(`${label} must use H:MM format.`);
  }
  const [hours, minutes] = value.split(":").map(Number);
  if (minutes > 59) throw new Error(`${label} is invalid.`);
  return hours + minutes / 60;
}

function scoreAas(scale: ScaleDefinition, answers: ScaleAnswer[]): CustomScaleResult {
  const adjusted = scale.questions.map((question, index) =>
    getAdjustedScore(scale, question, numericAnswer(answers[index], `Answer ${index + 1}`)),
  );
  const groups = [
    { key: "closeness", label: "亲近", indexes: [0, 5, 7, 11, 12, 16] },
    { key: "dependence", label: "依赖", indexes: [1, 4, 6, 13, 15, 17] },
    { key: "anxiety", label: "焦虑", indexes: [2, 3, 8, 9, 10, 14] },
  ].map((group) => ({ ...group, score: Number((group.indexes.reduce((sum, index) => sum + adjusted[index], 0) / 6).toFixed(2)) }));
  const composite = Number(((groups[0].score + groups[1].score) / 2).toFixed(2));
  const anxiety = groups[2].score;
  const label = composite === 3 || anxiety === 3
    ? "临界区间"
    : composite > 3
      ? anxiety < 3 ? "安全型" : "先占型"
      : anxiety < 3 ? "拒绝型" : "恐惧型";

  return {
    kind: "custom",
    totalScore: adjusted.reduce((sum, value) => sum + value, 0),
    maxScore: 90,
    normalized: adjusted.reduce((sum, value) => sum + value, 0) / 90,
    label,
    summary: `亲近依赖复合均分为 ${composite}，焦虑均分为 ${anxiety}。依恋类型按 Word 文档中的 3 分界线判定。`,
    sections: [
      ...groups.map((group) => ({ key: group.key, label: `${group.label}分量表均分`, score: group.score, maxScore: 5 })),
      { key: "composite", label: "亲近依赖复合均分", score: composite, maxScore: 5 },
    ],
  };
}

function scorePsqi(scale: ScaleDefinition, answers: ScaleAnswer[]): CustomScaleResult {
  const value = (index: number) => numericAnswer(answers[index], `Answer ${index + 1}`);
  const bed = parseClock(answers[0], "上床时间");
  const wake = parseClock(answers[2], "起床时间");
  const sleepHours = parseDuration(answers[3], "实际睡眠时间");
  const bedHours = (wake <= bed ? wake + 1440 - bed : wake - bed) / 60;
  const latency = value(1);
  const disturbance = [5, 6, 7, 8, 9, 10, 11, 12, 13].map(value).reduce((sum, score) => sum + score, 0);
  const bucket = (score: number, ranges: Array<[number, number]>) => ranges.find(([, max]) => score <= max)?.[0] ?? 3;
  const componentA = value(14);
  const componentB = bucket(latency + value(4), [[0, 0], [1, 2], [2, 4], [3, 6]]);
  const componentC = sleepHours > 7 ? 0 : sleepHours > 6 ? 1 : sleepHours >= 5 ? 2 : 3;
  const efficiency = bedHours > 0 ? (sleepHours / bedHours) * 100 : 0;
  const componentD = efficiency > 85 ? 0 : efficiency >= 75 ? 1 : efficiency >= 65 ? 2 : 3;
  const componentE = disturbance === 0 ? 0 : disturbance <= 9 ? 1 : disturbance <= 18 ? 2 : 3;
  const componentF = value(15);
  const daytime = value(16) + value(17);
  const componentG = daytime === 0 ? 0 : daytime <= 2 ? 1 : daytime <= 4 ? 2 : 3;
  const components = [componentA, componentB, componentC, componentD, componentE, componentF, componentG];
  const totalScore = components.reduce((sum, score) => sum + score, 0);
  const label = totalScore <= 5 ? "睡眠质量很好" : totalScore <= 10 ? "睡眠质量较好" : totalScore <= 15 ? "睡眠质量一般" : "睡眠质量差";

  return {
    kind: "custom",
    totalScore,
    maxScore: 21,
    normalized: totalScore / 21,
    label,
    summary: `睡眠效率约为 ${efficiency.toFixed(1)}%，床上时间约为 ${bedHours.toFixed(1)} 小时。`,
    metrics: [{ label: "睡眠效率", value: `${efficiency.toFixed(1)}%` }, { label: "床上时间", value: `${bedHours.toFixed(1)} 小时` }],
    sections: components.map((score, index) => ({ key: String.fromCharCode(65 + index), label: `因子 ${String.fromCharCode(65 + index)}`, score, maxScore: 3 })),
  };
}

function scoreScl90(scale: ScaleDefinition, answers: ScaleAnswer[]): CustomScaleResult {
  const scores = answers.map((answer, index) => numericAnswer(answer, `Answer ${index + 1}`));
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const positiveCount = scores.filter((score) => score > 1).length;
  const positiveMean = positiveCount === 0 ? 0 : totalScore / positiveCount;
  const factorDefinitions = [
    ["F1", "躯体化", [1, 4, 12, 27, 40, 42, 48, 49, 52, 53, 56, 58]],
    ["F2", "强迫症状", [3, 9, 10, 28, 38, 45, 46, 51, 55, 65]],
    ["F3", "人际关系敏感", [6, 21, 34, 36, 37, 41, 61, 69, 73]],
    ["F4", "抑郁", [5, 14, 15, 20, 22, 26, 29, 30, 31, 32, 54, 71, 79]],
    ["F5", "焦虑", [2, 17, 23, 33, 39, 57, 72, 78, 80, 86]],
    ["F6", "敌对", [11, 24, 63, 67, 74, 81]],
    ["F7", "恐怖", [13, 25, 47, 50, 70, 75, 82]],
    ["F8", "偏执", [8, 18, 43, 68, 76, 83]],
    ["F9", "精神病性", [7, 16, 35, 62, 77, 84, 85, 87, 88, 90]],
    ["F10", "睡眠及饮食", [19, 44, 59, 60, 64, 66, 89]],
  ] as const;
  const sections = factorDefinitions.map(([key, label, indexes]) => ({
    key,
    label,
    score: Number((indexes.reduce((sum, item) => sum + scores[item - 1], 0) / indexes.length).toFixed(2)),
    maxScore: 5,
  }));
  const mean = totalScore / 90;
  const label = mean <= 0.5 ? "症状感受不明显" : mean <= 1.5 ? "有轻微症状感受" : mean <= 2.5 ? "轻到中度症状" : mean <= 3.5 ? "中到重度症状" : "症状频度和强度较高";

  return {
    kind: "custom",
    totalScore,
    maxScore: 450,
    normalized: totalScore / 450,
    label,
    summary: `总症状指数（总均分）为 ${mean.toFixed(2)}，阳性项目数为 ${positiveCount}，阳性症状均分为 ${positiveMean.toFixed(2)}。`,
    metrics: [
      { label: "总症状指数", value: mean.toFixed(2) },
      { label: "阳性项目数", value: positiveCount },
      { label: "阳性症状均分", value: positiveMean.toFixed(2) },
    ],
    sections,
  };
}

function scoreCustomScale(scale: ScaleDefinition, answers: ScaleAnswer[]): CustomScaleResult {
  switch (scale.customScoringKey) {
    case "aas": return scoreAas(scale, answers);
    case "psqi": return scorePsqi(scale, answers);
    case "scl90": return scoreScl90(scale, answers);
    default: throw new Error(`Scale "${scale.slug}" is missing custom scoring configuration.`);
  }
}

export function scoreScale(scale: ScaleDefinition, answers: ScaleAnswer[]): ScaleResult {
  const expectedLength = scale.kind === "mbti" ? scale.mbtiQuestions?.length ?? 0 : scale.questions.length;
  if (answers.length !== expectedLength) {
    throw new Error("Answer count does not match question count.");
  }

  if (scale.kind === "mbti") return scoreMbtiScale(scale, answers);
  if (scale.kind === "custom") return scoreCustomScale(scale, answers);
  return scale.kind === "sum" ? scoreSumScale(scale, answers) : scoreProfileScale(scale, answers);
}
