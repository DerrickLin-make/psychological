import type { CustomScaleResult, ScaleResult, Scl90ScaleResult } from "@/lib/scoring";

export const SCL90_FACTORS = [
  { key: "F1", name: "躯体化", items: [1, 4, 12, 27, 40, 42, 48, 49, 52, 53, 56, 58] },
  { key: "F2", name: "强迫症状", items: [3, 9, 10, 28, 38, 45, 46, 51, 55, 65] },
  { key: "F3", name: "人际关系敏感", items: [6, 21, 34, 36, 37, 41, 61, 69, 73] },
  { key: "F4", name: "抑郁", items: [5, 14, 15, 20, 22, 26, 29, 30, 31, 32, 54, 71, 79] },
  { key: "F5", name: "焦虑", items: [2, 17, 23, 33, 39, 57, 72, 78, 80, 86] },
  { key: "F6", name: "敌对", items: [11, 24, 63, 67, 74, 81] },
  { key: "F7", name: "恐怖", items: [13, 25, 47, 50, 70, 75, 82] },
  { key: "F8", name: "偏执", items: [8, 18, 43, 68, 76, 83] },
  { key: "F9", name: "精神病性", items: [7, 16, 35, 62, 77, 84, 85, 87, 88, 90] },
  { key: "F10", name: "睡眠及饮食", items: [19, 44, 59, 60, 64, 66, 89] },
] as const;

export function getScl90Level(score: number) {
  if (score < 2) return "阴性";
  if (score < 3) return "轻度阳性";
  if (score < 4) return "中度阳性";
  if (score < 4.5) return "偏重阳性";
  return "重度阳性";
}

export function getScl90Conclusion(mean: number) {
  if (mean < 2) return "阴性";
  if (mean < 3) return "轻度阳性";
  if (mean < 4) return "中度阳性";
  if (mean < 4.5) return "偏重阳性";
  return "重度阳性";
}

export type Scl90Profile = {
  age?: string;
  gender?: string;
};

export type Scl90Analysis = {
  overallSummary: string;
  factorAnalyses: Array<{
    key: string;
    title: string;
    level: string;
    explanation: string;
  }>;
  recommendations: string[];
  riskNotice: string;
  closingMessage: string;
};

export function isScl90Result(result: ScaleResult): result is Scl90ScaleResult {
  return result.kind === "custom" && "instrument" in result && result.instrument === "scl90";
}

export function buildFallbackScl90Analysis(result: Scl90ScaleResult): Scl90Analysis {
  return {
    overallSummary: `本次测评总分为 ${result.totalScore}（满分 ${result.maxScore}），总症状指数为 ${result.overallMean.toFixed(2)}，阳性项目数为 ${result.positiveCount}，阴性项目数为 ${result.negativeCount}，阳性症状均分为 ${result.positiveMean.toFixed(2)}。结果显示为“${result.label}”，建议结合近期生活事件和实际困扰综合理解。`,
    factorAnalyses: result.sections.map((section) => ({
      key: section.key,
      title: section.label,
      level: section.level,
      explanation: `该维度原始得分为 ${section.rawScore}，均分为 ${section.score.toFixed(2)}，当前表现为${section.level}。这只代表近一周的自我感受，不能单独用于判断临床问题。`,
    })),
    recommendations: [
      "优先关注得分相对较高、并且已经影响睡眠、工作或人际关系的具体体验。",
      "连续记录一到两周的情绪、睡眠和身体感受，观察困扰是否持续或随情境变化。",
      "如果困扰持续加重、明显影响日常生活，建议预约专业心理咨询或医疗评估。",
    ],
    riskNotice: "本报告用于自我筛查和自我觉察参考，不构成医学诊断，也不能替代专业咨询或医疗建议。",
    closingMessage: "请把这份结果当作一次了解自己的线索，而不是给自己贴上的标签。",
  };
}

export function getScl90Result(result: CustomScaleResult): Scl90ScaleResult | null {
  return "instrument" in result && result.instrument === "scl90" ? result as Scl90ScaleResult : null;
}
