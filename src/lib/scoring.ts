import type {
  DimensionBand,
  ScaleAnswer,
  ScaleBand,
  ScaleDefinition,
  ScaleDimension,
  ScaleQuestion,
} from "@/data/scales";
import { getScl90Conclusion, getScl90Level, SCL90_FACTORS } from "@/lib/scl90-report";

type ScoredDimension = {
  key: string;
  name: string;
  description: string;
  direction?: ScaleDimension["direction"];
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
  notices?: string[];
};

export type ProfileScaleResult = {
  kind: "profile";
  totalScore: number;
  maxScore: number;
  normalized: number;
  dimensions: ScoredDimension[];
  overview: string;
  notices?: string[];
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

export type Scl90Section = CustomSection & { level: string; rawScore: number; itemCount: number };

export type Scl90ScaleResult = Omit<CustomScaleResult, "sections"> & {
  instrument: "scl90";
  overallMean: number;
  positiveCount: number;
  negativeCount: number;
  positiveMean: number;
  sections: Scl90Section[];
};

export type ScaleResult = SumScaleResult | ProfileScaleResult | MbtiScaleResult | CustomScaleResult | Scl90ScaleResult;

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

  const notices = [
    ...(scale.slug === "epds" && scores[9] >= 1
      ? ["第 10 题自伤意念得分 ≥1：无论总分多少，都应尽快联系专业医务人员进一步评估。"]
      : []),
    ...(scale.slug === "phq-9" && scores[8] >= 1
      ? ["第 9 题出现自伤或死亡相关想法：无论总分多少，都应立即联系专业医疗或心理服务，并在存在紧迫危险时寻求急救。"]
      : []),
    ...(scale.slug === "bdi-ii" && scores[8] >= 1
      ? ["第 9 题出现自杀相关想法：无论总分多少，都应立即联系专业医疗或心理服务，并在存在紧迫危险时寻求急救。"]
      : []),
  ];

  return {
    kind: "sum",
    totalScore,
    ...(scale.standardize ? { rawScore } : {}),
    maxScore,
    normalized: maxScore > 0 ? totalScore / maxScore : 0,
    band: findBand(scale.bands, totalScore),
    ...(notices.length > 0 ? { notices } : {}),
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
    direction: dimension.direction,
    details: dimension.details,
    score,
    band: findBand(dimension.bands, score),
  };
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
  const notices = scale.slug === "dass-21" && getAdjustedScore(
    scale,
    scale.questions[20],
    numericAnswer(answers[20], "Answer 21"),
  ) >= 1
    ? ["DASS-21 第 21 题出现生命无意义感：无论其他维度得分如何，都建议尽快联系专业心理或医疗服务，评估当前安全和支持需要。"]
    : undefined;

  return {
    kind: "profile",
    totalScore,
    maxScore,
    normalized,
    dimensions,
    overview: temperament?.summary ?? "本次各维度已分别完成计分，请结合报告中的固定因子解释阅读。",
    ...(notices ? { notices } : {}),
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
    summary: `亲近依赖复合均分为 ${composite}，焦虑均分为 ${anxiety}。依恋类型根据 3 分界线判定。`,
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

function scoreScl90(scale: ScaleDefinition, answers: ScaleAnswer[]): Scl90ScaleResult {
  const responseScores = answers.map((answer, index) => numericAnswer(answer, `Answer ${index + 1}`));
  const totalScore = responseScores.reduce((sum, score) => sum + score, 0);
  const positiveScores = responseScores.filter((score) => score >= 2);
  const positiveCount = positiveScores.length;
  const negativeCount = responseScores.length - positiveCount;
  const positiveMean = positiveCount === 0
    ? 0
    : positiveScores.reduce((sum, score) => sum + score, 0) / positiveCount;
  const sections = SCL90_FACTORS.map((factor) => {
    const rawScore = factor.items.reduce((sum, item) => sum + responseScores[item - 1], 0);
    const score = Number((rawScore / factor.items.length).toFixed(2));
    return {
      key: factor.key,
      label: factor.name,
      score,
      rawScore,
      itemCount: factor.items.length,
      maxScore: 5,
      level: getScl90Level(score),
    };
  });
  const mean = totalScore / responseScores.length;
  const label = getScl90Conclusion(mean);
  const maxScore = responseScores.length * Math.max(...scale.options.map((option) => option.value));

  return {
    kind: "custom",
    totalScore,
    maxScore,
    normalized: maxScore > 0 ? totalScore / maxScore : 0,
    label,
    summary: `总分为 ${totalScore}，总症状指数（总均分）为 ${mean.toFixed(2)}，阳性项目数为 ${positiveCount}，阴性项目数为 ${negativeCount}，阳性症状均分为 ${positiveMean.toFixed(2)}。`,
    metrics: [
      { label: "总症状指数", value: mean.toFixed(2) },
      { label: "阳性项目数", value: positiveCount },
      { label: "阴性项目数", value: negativeCount },
      { label: "阳性症状均分", value: positiveMean.toFixed(2) },
    ],
    sections,
    instrument: "scl90",
    overallMean: Number(mean.toFixed(2)),
    positiveCount,
    negativeCount,
    positiveMean: Number(positiveMean.toFixed(2)),
  };
}

function scoreMosSocial(scale: ScaleDefinition, answers: ScaleAnswer[]): CustomScaleResult {
  const values = answers.map((answer, index) => numericAnswer(answer, `Answer ${index + 1}`));
  const closeNetwork = values[0];
  const functional = values.slice(1);
  const toPercent = (indexes: number[]) => {
    const mean = indexes.reduce((sum, index) => sum + functional[index], 0) / indexes.length;
    return Number((((mean - 1) / 4) * 100).toFixed(1));
  };
  const sections = [
    {
      key: "network",
      label: "亲密朋友与亲属网络",
      score: closeNetwork,
      maxScore: 6,
      summary: `选择的类别为“${scale.questions[0].options?.find((option) => option.value === closeNetwork)?.label ?? "未识别"}”。该项目只用于描述可联系的亲密关系数量，不计入总体社会支持分。`,
    },
    { key: "emotional-info", label: "情感与信息支持", score: toPercent([0, 1, 2, 6, 7, 11, 12, 16]), maxScore: 100, summary: "反映倾听、理解、建议和信息支持的可获得程度，分数越高表示感知到的支持越充足。" },
    { key: "tangible", label: "实际帮助支持", score: toPercent([3, 8, 9, 14]), maxScore: 100, summary: "反映照料、交通、做饭和家务等实际帮助的可获得程度。" },
    { key: "affectionate", label: "情感亲密支持", score: toPercent([4, 10, 13]), maxScore: 100, summary: "反映爱、关心、拥抱和被需要感等亲密支持的可获得程度。" },
    { key: "positive-interaction", label: "积极社交互动", score: toPercent([5, 17, 18]), maxScore: 100, summary: "反映一起放松、娱乐和转移注意力的积极互动机会。" },
    { key: "overall", label: "总体社会支持", score: toPercent(Array.from({ length: 19 }, (_, index) => index)), maxScore: 100, summary: "总体功能性社会支持的 0～100 分换算结果；分数越高表示感知到的支持越充足。" },
  ];
  const overall = sections.find((section) => section.key === "overall")?.score ?? 0;
  const networkLabel = scale.questions[0].options?.find((option) => option.value === closeNetwork)?.label ?? "未识别";

  return {
    kind: "custom",
    totalScore: overall,
    maxScore: 100,
    normalized: overall / 100,
    label: "社会支持感知画像",
    summary: `总体社会支持换算分为 ${overall} 分（0～100），亲密朋友与亲属数量类别为“${networkLabel}”。分数用于描述支持感知，不设统一临床诊断切点。`,
    metrics: [
      { label: "总体支持", value: `${overall} / 100` },
      { label: "亲密关系网络", value: networkLabel },
    ],
    sections,
  };
}

function scoreCustomScale(scale: ScaleDefinition, answers: ScaleAnswer[]): CustomScaleResult {
  switch (scale.customScoringKey) {
    case "aas": return scoreAas(scale, answers);
    case "psqi": return scorePsqi(scale, answers);
    case "scl90": return scoreScl90(scale, answers);
    case "mos-social": return scoreMosSocial(scale, answers);
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
