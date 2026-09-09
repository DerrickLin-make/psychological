import type { ScaleDimension } from "@/data/scales";

export type ExplanationMode = "banded" | "continuous";

export type ExplanationScoreUnit = "sum" | "average" | "percent" | "component" | "count";

export type ExplanationSourceKind =
  | "official"
  | "original-study"
  | "validation-study"
  | "authoritative-reference";

export type ExplanationSource = {
  kind: ExplanationSourceKind;
  citation: string;
  year?: number;
  url?: string;
};

export type ExplanationBand = {
  key: string;
  mode: ExplanationMode;
  label: string;
  interpretation: string;
  manifestations: string[];
  impact: string;
  recommendations: string[];
  riskNotice?: string;
};

export type FactorExplanation = {
  key: string;
  name: string;
  construct: string;
  scoreUnit: ExplanationScoreUnit;
  direction?: ScaleDimension["direction"];
  bands: Record<string, ExplanationBand>;
  limitations: string[];
  sources: ExplanationSource[];
};

export type ProfileValueExplanation = {
  key: string;
  label: string;
  interpretation: string;
  manifestations: string[];
  impact: string;
  recommendations: string[];
  riskNotice?: string;
};

export type ProfileExplanation = {
  key: string;
  name: string;
  construct: string;
  values: Record<string, ProfileValueExplanation>;
  limitations: string[];
  sources: ExplanationSource[];
};

export type OverallExplanation = {
  summary: string;
  recommendations: string[];
  riskNotice?: string;
};

export type ScaleExplanation = {
  scaleSlug: string;
  version: string;
  translationStatus: "authorized" | "working-adaptation";
  factors: Record<string, FactorExplanation>;
  profiles?: Record<string, ProfileExplanation>;
  overall: OverallExplanation;
  limitations: string[];
  sources: ExplanationSource[];
};

export type ResolvedFactorExplanation = {
  key: string;
  title: string;
  score?: number;
  maxScore?: number;
  level: string;
  mode: ExplanationMode;
  construct: string;
  interpretation: string;
  manifestations: string[];
  impact: string;
  recommendations: string[];
  riskNotice?: string;
};

export type ResolvedProfileExplanation = {
  key: string;
  title: string;
  value: string;
  construct: string;
  interpretation: string;
  manifestations: string[];
  impact: string;
  recommendations: string[];
  riskNotice?: string;
};

export type ReportExplanation = {
  overallSummary: string;
  factors: ResolvedFactorExplanation[];
  profiles: ResolvedProfileExplanation[];
  recommendations: string[];
  riskNotices: string[];
  limitations: string[];
  sources: ExplanationSource[];
  version: string;
  translationStatus: ScaleExplanation["translationStatus"];
};
