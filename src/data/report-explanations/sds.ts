import type { ScaleExplanation } from "./types";
import { bandedFactor, screeningLimitations, source } from "./shared";

const sdsSource = source(
  "original-study",
  "Zung, W. W. K.：A Self-Rating Depression Scale",
  1965,
  "https://doi.org/10.1001/archpsyc.1965.01720310065008",
);

export const sdsExplanation: ScaleExplanation = {
  scaleSlug: "sds",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    total: bandedFactor({
      key: "total",
      name: "抑郁症状总分",
      construct: "综合描述近一周的情绪低落、身体不适、动力、认知和日常活动相关体验。",
      scoreUnit: "sum",
      direction: "concern",
      limitations: screeningLimitations,
      sources: [sdsSource],
      manifestations: ["可能涉及情绪、睡眠、食欲、精力、注意力和对日常活动的兴趣变化。"],
      impact: "当这些体验持续或同时出现时，可能影响日常功能、人际互动和自我照顾。",
      bands: [
        { key: "range-25-52", label: "正常范围", interpretation: "当前总分处于本项目设置的较低参考区间，未显示出明显升高的抑郁相关自评体验。", recommendations: ["继续保持规律作息，并留意情绪和精力是否随生活事件变化。"] },
        { key: "range-53-62", label: "轻度", interpretation: "抑郁相关自评体验较低分段有所升高，可能存在需要留意的情绪或身体变化。", recommendations: ["记录睡眠、精力、兴趣和情绪变化；若持续两周以上或影响生活，建议寻求专业支持。"] },
        { key: "range-63-72", label: "中度", interpretation: "抑郁相关体验已经较明显，建议结合近期压力、功能变化和持续时间进行进一步评估。", recommendations: ["建议与心理咨询师或医疗专业人员讨论当前状态，不要只依赖线上量表自行判断。"] },
        { key: "range-73-100", label: "重度", interpretation: "抑郁相关自评体验处于很高区间，可能已经对日常功能造成较明显影响。", recommendations: ["建议尽快进行专业评估；如果出现自伤或无法保证安全的想法，应立即寻求紧急帮助。"], riskNotice: "高分不等于临床诊断，但高强度、持续的抑郁体验需要优先获得专业帮助。" },
      ],
    }),
  },
  overall: {
    summary: "SDS 总分反映近一周抑郁相关自评体验的综合程度，不能替代面谈、病史和功能评估。",
    recommendations: ["结合持续时间、生活功能和安全状况理解结果，必要时寻求专业评估。"],
  },
  limitations: screeningLimitations,
  sources: [sdsSource],
};
