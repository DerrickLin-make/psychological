import type { ScaleExplanation } from "./types";
import { bandedFactor, screeningLimitations, source } from "./shared";

const gadSource = source(
  "original-study",
  "Spitzer, Kroenke, Williams & Löwe：A brief measure for assessing generalized anxiety disorder: the GAD-7",
  2006,
  "https://pubmed.ncbi.nlm.nih.gov/16717171/",
);

export const gad7Explanation: ScaleExplanation = {
  scaleSlug: "gad-7",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    total: bandedFactor({
      key: "total",
      name: "焦虑症状总分",
      construct: "描述过去 2 周紧张、无法停止担忧、过度担心、坐立不安、易怒和害怕等焦虑相关体验。",
      scoreUnit: "sum",
      direction: "concern",
      limitations: screeningLimitations,
      sources: [gadSource],
      manifestations: ["可能表现为持续担忧、难以放松、坐立不安、易烦躁或对不好的事情感到害怕。"],
      impact: "分数升高可能伴随注意力下降、睡眠受影响、回避活动或身体紧张感增加。",
      bands: [
        { key: "range-0-4", label: "极少", interpretation: "过去 2 周报告的焦虑相关症状较少，当前总分处于较低区间。", recommendations: ["保持规律生活，留意焦虑是否只在特定情境出现。"] },
        { key: "range-5-9", label: "轻度", interpretation: "报告了少量至轻度的焦虑相关症状，建议继续观察其持续时间和现实影响。", recommendations: ["记录担忧触发点、身体反应和应对方式；持续困扰时寻求支持。"] },
        { key: "range-10-14", label: "中度", interpretation: "焦虑相关症状达到中度参考区间，可能已经影响放松、睡眠或日常安排。", recommendations: ["建议安排专业评估，结合回避、身体症状和功能变化讨论。"] },
        { key: "range-15-21", label: "重度", interpretation: "焦虑相关症状处于较高参考区间，日常功能受到影响的可能性增加。", recommendations: ["建议尽快寻求专业心理或医疗评估，必要时同时排查身体原因。"], riskNotice: "GAD-7 不能单独确诊广泛性焦虑障碍；急性危险感或无法保证安全时应立即求助。" },
      ],
    }),
  },
  overall: {
    summary: "GAD-7 总分用于描述过去 2 周焦虑相关体验的频率，需结合持续时间、功能影响和其他身体或心理因素理解。",
    recommendations: ["持续担忧已经影响生活时，建议寻求专业评估和可操作的支持。"],
  },
  limitations: screeningLimitations,
  sources: [gadSource],
};
