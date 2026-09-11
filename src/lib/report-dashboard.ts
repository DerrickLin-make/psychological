import type { ScaleDefinition } from "@/data/scales";
import type { ScaleResult } from "@/lib/scoring";

export type ReportDashboardMode = "sum" | "profile" | "mbti" | "custom" | "scl90";

export type DashboardMetric = {
  label: string;
  value: string | number;
  hint?: string;
};

export type DashboardGauge = {
  label: string;
  value: number;
  min: number;
  max: number;
  normalized: number;
  rangeLabel: string;
};

export type DashboardDimension = {
  key: string;
  name: string;
  description: string;
  value: number;
  min: number;
  max: number;
  normalized: number;
  level: string;
};

export type DashboardPreference = {
  left: string;
  right: string;
  leftScore: number;
  rightScore: number;
  winner: string;
};

export type DashboardScoreBand = {
  key: string;
  label: string;
  min: number;
  max: number;
  start: number;
  end: number;
  active: boolean;
  emphasis: string;
  summary: string;
  recommendation: string;
};

export type ReportDashboardModel = {
  mode: ReportDashboardMode;
  metrics: DashboardMetric[];
  gauge?: DashboardGauge;
  scoreBands: DashboardScoreBand[];
  dimensions: DashboardDimension[];
  preferences: DashboardPreference[];
  canUseRadar: boolean;
  midpoint?: number;
};

function rounded(value: number, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function normalized(value: number, min: number, max: number) {
  if (max <= min) return 0;
  return rounded(Math.min(1, Math.max(0, (value - min) / (max - min))));
}

function formatScore(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function dimensionLevel(scale: ScaleDefinition, min: number, max: number, value: number, configured: string) {
  if (scale.slug !== "ffmq-39" || min !== 1 || max !== 5) return configured;
  if (value <= 2.33) return "相对较低";
  if (value <= 3.66) return "中间区";
  return "相对较高";
}

function gauge(label: string, value: number, min: number, max: number): DashboardGauge {
  return {
    label,
    value,
    min,
    max,
    normalized: normalized(value, min, max),
    rangeLabel: `量表区间 ${formatScore(min)}–${formatScore(max)}`,
  };
}

function scoreBands(scale: ScaleDefinition, value: number, min: number, max: number): DashboardScoreBand[] {
  const bands = scale.bands ?? [];
  return bands.map((band, index) => ({
    key: band.bandKey ?? `${band.min}-${band.max}`,
    label: band.label,
    min: band.min,
    max: band.max,
    start: normalized(band.min, min, max),
    end: normalized(bands[index + 1]?.min ?? band.max, min, max),
    active: value >= band.min && value <= band.max,
    emphasis: band.emphasis,
    summary: band.summary,
    recommendation: band.recommendation,
  }));
}

function profileDimensions(scale: ScaleDefinition, result: Extract<ScaleResult, { kind: "profile" }>) {
  return result.dimensions.map((item) => {
    const definition = scale.dimensions?.find((dimension) => dimension.key === item.key);
    const bands = definition?.bands ?? [item.band];
    const min = Math.min(...bands.map((band) => band.min));
    const max = Math.max(...bands.map((band) => band.max));
    return {
      key: item.key,
      name: scale.slug === "ffmq-39" && item.key === "act-aware" ? "有意识地行动" : item.name,
      description: item.description,
      value: item.score,
      min,
      max,
      normalized: normalized(item.score, min, max),
      level: dimensionLevel(scale, min, max, item.score, item.band.label),
    };
  });
}

function customDimensions(scale: ScaleDefinition, result: Extract<ScaleResult, { kind: "custom" }>) {
  const scaleMinimum = Math.min(...scale.options.map((option) => option.value));
  const scaleMaximum = Math.max(...scale.options.map((option) => option.value));
  return result.sections
    .filter((section) => section.maxScore !== undefined)
    .map((section) => {
      const max = section.maxScore ?? 1;
      const min = max === scaleMaximum ? scaleMinimum : 0;
      return {
        key: section.key,
        name: section.label,
        description: section.summary ?? "依据本量表分项结果进行解释。",
        value: section.score,
        min,
        max,
        normalized: normalized(section.score, min, max),
        level: "分项结果",
      };
    });
}

function sharesRange(items: DashboardDimension[]) {
  if (items.length < 3 || items.length > 8) return false;
  return items.every((item) => item.min === items[0].min && item.max === items[0].max);
}

export function buildReportDashboard(scale: ScaleDefinition, result: ScaleResult): ReportDashboardModel {
  if (result.kind === "sum") {
    const min = Math.min(...(scale.bands ?? [result.band]).map((band) => band.min));
    const scoreGauge = gauge("测评总分", result.totalScore, min, result.maxScore);
    return {
      mode: "sum",
      metrics: [
        { label: "总分", value: formatScore(result.totalScore), hint: `满分 ${formatScore(result.maxScore)}` },
        { label: "结果等级", value: result.band.label, hint: "依据量表参考区间" },
        { label: "量尺位置", value: `${Math.round(scoreGauge.normalized * 100)}%`, hint: `最低计分 ${formatScore(min)}` },
      ],
      gauge: scoreGauge,
      scoreBands: scoreBands(scale, result.totalScore, min, result.maxScore),
      dimensions: [],
      preferences: [],
      canUseRadar: false,
    };
  }

  if (result.kind === "profile") {
    const dimensions = profileDimensions(scale, result);
    const optionMinimum = Math.min(...scale.questions.flatMap((question) => (question.options ?? scale.options).map((option) => option.value)));
    const totalMinimum = optionMinimum * scale.questions.length;
    return {
      mode: "profile",
      metrics: [
        { label: "作答计分合计", value: formatScore(result.totalScore), hint: "仅用于记录" },
        { label: "结果模式", value: "多因子", hint: "各维度分别解释" },
        { label: "测评维度", value: dimensions.length, hint: "已完成分析" },
      ],
      gauge: gauge("作答计分合计", result.totalScore, totalMinimum, result.maxScore),
      scoreBands: [],
      dimensions,
      preferences: [],
      canUseRadar: sharesRange(dimensions),
      midpoint: dimensions.length > 0 ? (dimensions[0].min + dimensions[0].max) / 2 : undefined,
    };
  }

  if (result.kind === "mbti") {
    return {
      mode: "mbti",
      metrics: [
        { label: "类型代码", value: result.typeCode, hint: result.typeProfile.nickname },
        { label: "偏好维度", value: result.pairs.filter((pair) => pair.leftScore !== pair.rightScore).length, hint: "存在明显偏好的维度" },
        { label: "有效作答", value: result.totalScore, hint: "题目数量" },
      ],
      scoreBands: [],
      dimensions: [],
      preferences: result.pairs,
      canUseRadar: false,
    };
  }

  const dimensions = customDimensions(scale, result);
  const isScl90 = "instrument" in result && result.instrument === "scl90";
  return {
    mode: isScl90 ? "scl90" : "custom",
    metrics: [
      { label: "核心结果", value: result.label, hint: "依据本量表规则" },
      { label: "总分", value: formatScore(result.totalScore), hint: `满分 ${formatScore(result.maxScore)}` },
      ...(result.metrics ?? []).slice(0, 2),
    ],
    gauge: result.maxScore > 0 ? gauge("测评总分", result.totalScore, 0, result.maxScore) : undefined,
    scoreBands: [],
    dimensions,
    preferences: [],
    canUseRadar: !isScl90 && sharesRange(dimensions),
    midpoint: dimensions.length > 0 ? (dimensions[0].min + dimensions[0].max) / 2 : undefined,
  };
}
