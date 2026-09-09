import type {
  ExplanationBand,
  ExplanationSource,
  FactorExplanation,
  ProfileExplanation,
  ProfileValueExplanation,
} from "./types";

export const screeningLimitations = [
  "这是基于自我报告的筛查或自我观察结果，不等同于医学诊断。",
  "结果会受到近期状态、生活事件、理解方式和作答情境影响。",
  "如困扰持续、加重或影响睡眠、学习、工作和关系，建议寻求专业评估。",
];

export const descriptiveLimitations = [
  "该结果用于描述本次作答中的倾向，不代表人格优劣或固定能力。",
  "没有经过本地样本常模校准时，不应把分数当作人群排名或临床等级。",
  "建议结合具体生活情境和一段时间内的重复观察理解结果。",
];

export function source(
  kind: ExplanationSource["kind"],
  citation: string,
  year?: number,
  url?: string,
): ExplanationSource {
  return { kind, citation, ...(year ? { year } : {}), ...(url ? { url } : {}) };
}

type ContinuousFactorInput = Omit<FactorExplanation, "bands"> & {
  interpretation: string;
  manifestations: string[];
  impact: string;
  recommendations: string[];
  riskNotice?: string;
};

export function continuousFactor({
  interpretation,
  manifestations,
  impact,
  recommendations,
  riskNotice,
  ...factor
}: ContinuousFactorInput): FactorExplanation {
  const band: ExplanationBand = {
    key: "continuous",
    mode: "continuous",
    label: "连续性得分",
    interpretation,
    manifestations,
    impact,
    recommendations,
    ...(riskNotice ? { riskNotice } : {}),
  };
  return { ...factor, bands: { continuous: band } };
}

type BandedFactorInput = Omit<FactorExplanation, "bands"> & {
  manifestations: string[];
  impact: string;
  bands: Array<{
    key: string;
    label: string;
    interpretation: string;
    recommendations: string[];
    riskNotice?: string;
  }>;
};

export function bandedFactor({ manifestations, impact, bands, ...factor }: BandedFactorInput): FactorExplanation {
  return {
    ...factor,
    bands: Object.fromEntries(
      bands.map(({ key, ...band }) => [key, {
        key,
        mode: "banded" as const,
        ...band,
        manifestations,
        impact,
      }]),
    ),
  };
}

export function profileExplanation(input: ProfileExplanation): ProfileExplanation {
  return input;
}

export function profileValue(input: ProfileValueExplanation): ProfileValueExplanation {
  return input;
}
