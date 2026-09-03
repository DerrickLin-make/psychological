import type { ScaleDefinition } from "@/data/scales";
import type { ScaleResult } from "@/lib/scoring";

export type ScaleAnalysisDimension = {
  key: string;
  title: string;
  level: string;
  explanation: string;
};

export type ScaleAnalysis = {
  overallSummary: string;
  dimensionAnalyses: ScaleAnalysisDimension[];
  strengths: string[];
  recommendations: string[];
  watchPoints: string[];
  notices: string[];
  riskNotice: string;
  closingMessage: string;
};

function formatScore(score: number) {
  return Number.isInteger(score) ? String(score) : score.toFixed(2);
}

function trimSentence(value: string) {
  return value.replace(/[。！？]$/, "");
}

function resultSummary(result: ScaleResult) {
  if (result.kind === "sum") return `${result.band.emphasis}：${result.band.summary}`;
  if (result.kind === "mbti") return `${result.typeCode}（${result.typeProfile.nickname}）：${result.typeProfile.summary}`;
  if (result.kind === "profile") return result.overview;
  return result.summary;
}

function dimensionAnalyses(result: ScaleResult): ScaleAnalysisDimension[] {
  if (result.kind === "sum") {
    return [{
      key: "total",
      title: "总分与结果等级",
      level: result.band.label,
      explanation: `${result.band.emphasis}。总分为 ${formatScore(result.totalScore)}，标准化比例为 ${Math.round(result.normalized * 100)}%。${result.band.summary}`,
    }];
  }

  if (result.kind === "mbti") {
    return result.pairs.map((pair) => ({
      key: `${pair.left}-${pair.right}`,
      title: `${pair.left} / ${pair.right}`,
      level: `倾向 ${pair.winner}`,
      explanation: `${pair.left} 得分 ${pair.leftScore}，${pair.right} 得分 ${pair.rightScore}。当前维度呈现“${pair.winner}”倾向，建议结合实际工作、人际和决策情境理解。`,
    }));
  }

  if (result.kind === "profile") {
    return result.dimensions.map((dimension) => ({
      key: dimension.key,
      title: dimension.name,
      level: dimension.band.label,
      explanation: `得分 ${formatScore(dimension.score)}。${dimension.description ? `${dimension.description} ` : ""}${dimension.band.summary}`,
    }));
  }

  return result.sections.map((section) => ({
    key: section.key,
    title: section.label,
    level: section.summary ? "分项结果" : "已完成分析",
    explanation: `${section.summary ?? "该分项已完成计分。"} 当前得分为 ${formatScore(section.score)}${section.maxScore ? `，满分为 ${formatScore(section.maxScore)}` : ""}。`,
  }));
}

function uniqueItems(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}

function profileStrengths(result: Extract<ScaleResult, { kind: "profile" }>) {
  const positive = result.dimensions
    .filter((dimension) => dimension.direction === "positive" || dimension.band.tone === "positive")
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((dimension) => `${dimension.name}：${dimension.band.label}。${dimension.band.summary}`);
  if (positive.length > 0) return positive;

  if (result.dimensions.some((dimension) => dimension.direction === "descriptive")) {
    return ["本量表用于描述多个倾向维度，分数高低不直接等同于好坏，建议结合具体情境理解。"];
  }

  return ["本次画像已完成多维计分，可将相对稳定的资源作为后续自我观察的起点。"];
}

function profileWatchPoints(result: Extract<ScaleResult, { kind: "profile" }>) {
  return result.dimensions
    .filter((dimension) => dimension.direction === "concern" || dimension.band.tone === "caution")
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((dimension) => `${dimension.name}当前得分相对更高：${dimension.band.summary}`);
}

export function buildFallbackScaleAnalysis(scale: ScaleDefinition, result: ScaleResult): ScaleAnalysis {
  const notices = result.kind === "sum" || result.kind === "profile" ? result.notices ?? [] : [];
  const defaultRecommendation = result.kind === "sum"
    ? result.band.recommendation
    : "建议结合具体生活情境、近期状态和专业访谈进一步理解本次结果。";
  const strengths = result.kind === "mbti"
    ? [result.typeProfile.summary, `可优先发挥与“${result.typeProfile.nickname}”相符的兴趣、优势和工作方式。`]
    : result.kind === "profile"
      ? profileStrengths(result)
      : ["本次问卷已完成有效计分，结果能够作为后续自我观察的起点。"];
  const profileRecommendations = result.kind === "profile"
    ? result.dimensions.map((dimension) => dimension.band.recommendation ?? "").filter(Boolean)
    : [];
  const profileWatch = result.kind === "profile" ? profileWatchPoints(result) : [];
  const watchPoints = uniqueItems([
    ...profileWatch,
    ...notices,
    "单次问卷结果容易受近期事件、疲劳和作答情境影响，建议结合实际经历复核。",
    "请重点关注结果是否已经影响睡眠、学习工作、人际关系或日常生活，而不要只看单一分数。",
  ]);

  return {
    overallSummary: `${scale.title}的本次结果显示：${trimSentence(resultSummary(result))}。本报告只反映当前作答和量表计分规则下的状态，不能替代临床诊断。`,
    dimensionAnalyses: dimensionAnalyses(result),
    strengths,
    recommendations: uniqueItems([
      defaultRecommendation,
      ...profileRecommendations,
      "记录一到两周内与结果相关的情绪、身体感受、睡眠、工作和人际变化，观察困扰是否持续或随情境变化。",
      "如果结果对应的困扰持续加重或明显影响日常功能，建议预约专业心理咨询或医疗评估。",
    ]),
    watchPoints,
    notices,
    riskNotice: "本报告用于自我筛查和自我觉察参考，不构成医学诊断，也不能替代专业咨询或医疗建议。",
    closingMessage: "请把这份结果当作进一步了解自己的线索，而不是给自己贴上的固定标签。",
  };
}
