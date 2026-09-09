import type { ScaleDefinition } from "@/data/scales";
import type {
  ExplanationSource,
  ReportExplanation,
  ResolvedFactorExplanation,
  ResolvedProfileExplanation,
} from "@/data/report-explanations";
import { resolveReportExplanations } from "@/lib/report-explanations";
import type { ScaleResult } from "@/lib/scoring";

export type ScaleAnalysisDimension = ResolvedFactorExplanation;

export type ScaleAnalysis = {
  overallSummary: string;
  dimensionAnalyses: ScaleAnalysisDimension[];
  profiles: ResolvedProfileExplanation[];
  strengths: string[];
  recommendations: string[];
  watchPoints: string[];
  notices: string[];
  riskNotice: string;
  closingMessage: string;
  limitations: string[];
  sources: ExplanationSource[];
  version: string;
  translationStatus: ReportExplanation["translationStatus"];
};

const commonRiskNotice = "本报告用于自我筛查和自我觉察参考，不构成医学诊断，也不能替代专业咨询或医疗建议。";

function uniqueItems(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}

function resultNotices(result: ScaleResult) {
  return "notices" in result && result.notices ? result.notices : [];
}

export function buildFallbackScaleAnalysis(scale: ScaleDefinition, result: ScaleResult): ScaleAnalysis {
  const resolved = resolveReportExplanations(scale, result);
  const notices = resultNotices(result);
  const watchPoints = uniqueItems([
    ...resolved.riskNotices,
    ...notices,
  ]);
  const strengths = resolved.profiles.length > 0
    ? ["类型和偏好结果用于描述当前倾向，具体表现请结合下方固定画像与实际情境核对。"]
    : ["本报告按量表因子逐项呈现固定解释，分数本身不代表个人价值或能力。"];

  return {
    overallSummary: resolved.overallSummary,
    dimensionAnalyses: resolved.factors,
    profiles: resolved.profiles,
    strengths,
    recommendations: resolved.recommendations,
    watchPoints,
    notices,
    riskNotice: commonRiskNotice,
    closingMessage: "请把这份结果当作进一步了解自己的线索，而不是给自己贴上的固定标签。",
    limitations: resolved.limitations,
    sources: resolved.sources,
    version: resolved.version,
    translationStatus: resolved.translationStatus,
  };
}
