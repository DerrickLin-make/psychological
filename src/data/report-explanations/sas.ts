import type { ScaleExplanation } from "./types";
import { bandedFactor, screeningLimitations, source } from "./shared";

const sasSource = source(
  "original-study",
  "Zung, W. W.：A rating instrument for anxiety disorders",
  1971,
  "https://doi.org/10.1016/S0033-3182(71)71479-0",
);

export const sasExplanation: ScaleExplanation = {
  scaleSlug: "sas",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    total: bandedFactor({
      key: "total",
      name: "焦虑症状总分",
      construct: "综合描述近一周的紧张、担忧、惊恐感以及心跳、呼吸、胃肠和睡眠等身体体验。",
      scoreUnit: "sum",
      direction: "concern",
      limitations: screeningLimitations,
      sources: [sasSource],
      manifestations: ["可能同时包含主观焦虑感和自主神经唤醒相关的身体感受。"],
      impact: "较高的焦虑体验可能让人难以放松、集中注意力或完成日常任务，也可能增加对身体信号的担忧。",
      bands: [
        { key: "range-25-49", label: "正常范围", interpretation: "当前标准分处于本项目设置的较低参考区间，未显示出明显升高的焦虑相关自评体验。", recommendations: ["维持规律睡眠、活动和休息节奏，留意状态变化。"] },
        { key: "range-50-59", label: "轻度", interpretation: "焦虑相关体验有所升高，可能在特定压力情境下更容易紧张或担忧。", recommendations: ["记录触发情境和身体反应，尝试规律呼吸、放松和减少过度刺激；持续困扰时寻求支持。"] },
        { key: "range-60-69", label: "中度", interpretation: "焦虑相关体验较为明显，可能已影响放松、睡眠、注意力或回避行为。", recommendations: ["建议进行专业评估，并同时排查持续身体不适的医学原因。"] },
        { key: "range-70-100", label: "重度", interpretation: "焦虑相关体验处于很高区间，可能已经明显影响日常功能或带来强烈的身体不适。", recommendations: ["建议尽快寻求专业评估；如出现无法控制的急性危险感或无法保证安全，应立即求助。"], riskNotice: "高分不等于焦虑障碍诊断，尤其需要结合持续时间、诱因和医学检查理解。" },
      ],
    }),
  },
  overall: {
    summary: "SAS 总分用于描述近一周焦虑相关主观和身体体验的综合程度，不能单独确定疾病或病因。",
    recommendations: ["同时观察睡眠、压力、身体症状和回避行为，必要时寻求心理或医疗评估。"],
  },
  limitations: screeningLimitations,
  sources: [sasSource],
};
