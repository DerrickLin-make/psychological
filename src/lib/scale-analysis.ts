import type { ScaleAnswer, ScaleDefinition } from "@/data/scales";
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
  riskNotice: string;
  closingMessage: string;
};

type QuestionSnapshot = {
  number: number;
  id: string;
  text: string;
  answer: ScaleAnswer | null;
  answerLabel: string;
};

export type ScaleAnalysisRequest = {
  scale: "generic";
  scaleDefinition: {
    slug: string;
    title: string;
    category: string;
    kind: ScaleDefinition["kind"];
    questionCount: number;
    summary: string;
    scoringNote: string;
  };
  questionnaire: QuestionSnapshot[];
  result: ScaleResult;
};

function text(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function stringList(value: unknown, limit: number) {
  return Array.isArray(value)
    ? value.map(text).filter((item): item is string => Boolean(item)).slice(0, limit)
    : [];
}

export function parseScaleAnalysis(value: unknown): ScaleAnalysis | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const overallSummary = text(candidate.overallSummary);
  const riskNotice = text(candidate.riskNotice);
  const closingMessage = text(candidate.closingMessage);
  const dimensionAnalyses = Array.isArray(candidate.dimensionAnalyses)
    ? candidate.dimensionAnalyses.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const dimension = item as Record<string, unknown>;
      const key = text(dimension.key);
      const title = text(dimension.title);
      const level = text(dimension.level);
      const explanation = text(dimension.explanation);
      return key && title && level && explanation ? [{ key, title, level, explanation }] : [];
    }).slice(0, 20)
    : [];
  const strengths = stringList(candidate.strengths, 6);
  const recommendations = stringList(candidate.recommendations, 6);
  const watchPoints = stringList(candidate.watchPoints, 6);

  if (!overallSummary || !riskNotice || !closingMessage || dimensionAnalyses.length === 0 || recommendations.length === 0) {
    return null;
  }

  return { overallSummary, dimensionAnalyses, strengths, recommendations, watchPoints, riskNotice, closingMessage };
}

function formatScore(score: number) {
  return Number.isInteger(score) ? String(score) : score.toFixed(2);
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
      explanation: `得分 ${formatScore(dimension.score)}。${dimension.band.summary}`,
    }));
  }

  return result.sections.map((section) => ({
    key: section.key,
    title: section.label,
    level: section.summary ? "分项结果" : "已完成分析",
    explanation: `${section.summary ?? "该分项已完成计分。"} 当前得分为 ${formatScore(section.score)}${section.maxScore ? `，满分为 ${formatScore(section.maxScore)}` : ""}。`,
  }));
}

export function buildFallbackScaleAnalysis(scale: ScaleDefinition, result: ScaleResult): ScaleAnalysis {
  const defaultRecommendation = result.kind === "sum"
    ? result.band.recommendation
    : "建议结合具体生活情境、近期状态和专业访谈进一步理解本次结果。";
  const strengths = result.kind === "mbti"
    ? [result.typeProfile.summary, `可优先发挥与“${result.typeProfile.nickname}”相符的兴趣、优势和工作方式。`]
    : result.kind === "profile"
      ? result.dimensions.filter((dimension) => dimension.score >= dimension.band.min).slice(0, 3).map((dimension) => `${dimension.name}：${dimension.band.label}`)
      : ["本次问卷已完成有效计分，结果能够作为后续自我观察的起点。"];

  return {
    overallSummary: `${scale.title}的本次结果显示：${resultSummary(result)}。本报告只反映当前作答和量表计分规则下的状态，不能替代临床诊断。`,
    dimensionAnalyses: dimensionAnalyses(result),
    strengths,
    recommendations: [
      defaultRecommendation,
      "记录一到两周内与结果相关的情绪、身体感受、睡眠、工作和人际变化，观察困扰是否持续或随情境变化。",
      "如果结果对应的困扰持续加重或明显影响日常功能，建议预约专业心理咨询或医疗评估。",
    ],
    watchPoints: [
      "单次问卷结果容易受近期事件、疲劳和作答情境影响，建议结合实际经历复核。",
      "请重点关注结果是否已经影响睡眠、学习工作、人际关系或日常生活，而不要只看单一分数。",
    ],
    riskNotice: "本报告用于自我筛查和自我觉察参考，不构成医学诊断，也不能替代专业咨询或医疗建议。",
    closingMessage: "请把这份结果当作进一步了解自己的线索，而不是给自己贴上的固定标签。",
  };
}

function questionSnapshots(scale: ScaleDefinition, answers: ScaleAnswer[]) {
  if (scale.kind === "mbti") {
    return (scale.mbtiQuestions ?? []).map((question, index) => {
      const answer = answers[index] ?? null;
      const answerLabel = answer === 0 ? `A：${question.optionA}` : answer === 1 ? `B：${question.optionB}` : "未作答";
      return { number: index + 1, id: question.id, text: question.text, answer, answerLabel };
    });
  }

  return scale.questions.map((question, index) => {
    const answer = answers[index] ?? null;
    const option = question.options?.find((item) => item.value === answer) ?? scale.options.find((item) => item.value === answer);
    const answerLabel = option ? `${option.label}：${option.detail}` : answer === null ? "未作答" : String(answer);
    return { number: index + 1, id: question.id, text: question.text, answer, answerLabel };
  });
}

export function buildScaleAnalysisRequest(scale: ScaleDefinition, result: ScaleResult, answers: ScaleAnswer[]): ScaleAnalysisRequest {
  return {
    scale: "generic",
    scaleDefinition: {
      slug: scale.slug,
      title: scale.title,
      category: scale.category,
      kind: scale.kind,
      questionCount: scale.kind === "mbti" ? scale.mbtiQuestions?.length ?? 0 : scale.questions.length,
      summary: scale.summary.slice(0, 1000),
      scoringNote: scale.scoringNote.slice(0, 1500),
    },
    questionnaire: questionSnapshots(scale, answers),
    result,
  };
}

export async function requestScaleAnalysis(request: ScaleAnalysisRequest): Promise<ScaleAnalysis> {
  const endpoint = process.env.NEXT_PUBLIC_SCALE_ANALYSIS_URL
    || process.env.NEXT_PUBLIC_SCL90_ANALYSIS_URL
    || "https://test-6glfp5fs533622b5-1328853010.ap-shanghai.app.tcloudbase.com/api/scl90-analysis";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
      ? payload.error
      : `AI 分析请求失败（${response.status}）。`;
    throw new Error(message);
  }
  const analysis = parseScaleAnalysis(payload);
  if (!analysis) throw new Error("AI 返回的详细报告格式不完整，请稍后重试。");
  return analysis;
}
