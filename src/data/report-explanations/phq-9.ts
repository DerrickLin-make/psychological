import type { ScaleExplanation } from "./types";
import { bandedFactor, screeningLimitations, source } from "./shared";

const phqSource = source(
  "original-study",
  "Kroenke, Spitzer & Williams：The PHQ-9: validity of a brief depression severity measure",
  2001,
  "https://pubmed.ncbi.nlm.nih.gov/11556941/",
);

export const phq9Explanation: ScaleExplanation = {
  scaleSlug: "phq-9",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    total: bandedFactor({
      key: "total",
      name: "抑郁症状总分",
      construct: "描述过去 2 周抑郁核心症状及其对情绪、兴趣、睡眠、精力、食欲、注意力和自我评价的影响。",
      scoreUnit: "sum",
      direction: "concern",
      limitations: screeningLimitations,
      sources: [phqSource],
      manifestations: ["可能表现为情绪低落、兴趣减少、睡眠或食欲变化、疲劳、注意力困难和负性自我评价。"],
      impact: "症状越集中或越频繁，越可能影响学习工作、人际互动、自我照顾和日常动力。",
      bands: [
        { key: "range-0-4", label: "极少", interpretation: "过去 2 周报告的抑郁相关症状较少，当前总分处于较低区间。", recommendations: ["继续关注情绪和生活节奏；如果单项症状仍明显影响生活，也可以寻求支持。"] },
        { key: "range-5-9", label: "轻度", interpretation: "报告了少量至轻度的抑郁相关症状，建议观察其持续时间和功能影响。", recommendations: ["记录情绪、睡眠、活动和压力变化；持续或加重时建议咨询专业人员。"] },
        { key: "range-10-14", label: "中度", interpretation: "抑郁相关症状达到中度参考区间，可能已经在部分生活领域产生影响。", recommendations: ["建议安排专业评估，讨论症状持续时间、功能变化和可获得的支持。"] },
        { key: "range-15-19", label: "中重度", interpretation: "抑郁相关症状较为集中或频繁，日常功能受到影响的可能性增加。", recommendations: ["建议尽快寻求专业心理或医疗评估，不要仅凭自测结果自行处理。"] },
        { key: "range-20-27", label: "重度", interpretation: "抑郁相关症状处于很高参考区间，可能已经明显影响日常功能和安全感。", recommendations: ["建议尽快获得专业评估；第 9 题非零时应立即进行安全评估。"], riskNotice: "PHQ-9 不能单独确诊抑郁症；如存在自伤或自杀想法，请立即联系当地急救、危机热线或可信任的身边人。" },
      ],
    }),
  },
  overall: {
    summary: "PHQ-9 总分用于描述过去 2 周抑郁症状的频率和程度，分数需要结合功能受损与第 9 题安全信息理解。",
    recommendations: ["结果升高或持续影响生活时，建议通过专业面谈进一步确认，而不是自行诊断或停药。"],
  },
  limitations: screeningLimitations,
  sources: [phqSource],
};
