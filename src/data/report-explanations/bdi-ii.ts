import type { ScaleExplanation } from "./types";
import { bandedFactor, screeningLimitations, source } from "./shared";

const bdiSource = source(
  "official",
  "Beck, Steer & Brown：Beck Depression Inventory-II；Pearson Assessments 资料",
  1996,
  "https://www.pearsonassessments.com/en-us/Store/Professional-Assessments/Personality-%26-Biopsychosocial/Beck-Depression-Inventory-II/p/100000159",
);

export const bdiIiExplanation: ScaleExplanation = {
  scaleSlug: "bdi-ii",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    total: bandedFactor({
      key: "total",
      name: "抑郁症状总分",
      construct: "综合描述最近 2 周的悲伤、悲观、自我评价、兴趣、睡眠、食欲、精力和自杀相关体验。",
      scoreUnit: "sum",
      direction: "concern",
      limitations: screeningLimitations,
      sources: [bdiSource],
      manifestations: ["可能覆盖情绪、认知、行为和身体层面的抑郁相关体验。"],
      impact: "分数升高可能意味着情绪和日常功能受到更多影响，但具体意义仍需结合个人背景和临床访谈。",
      bands: [
        { key: "range-0-13", label: "较低", interpretation: "当前总分处于较低参考区间，未显示出明显升高的抑郁自评体验。", recommendations: ["继续观察情绪、兴趣和精力变化，保持规律生活。"] },
        { key: "range-14-19", label: "轻度", interpretation: "当前总分提示抑郁相关体验有所升高，可能在部分生活领域出现影响。", recommendations: ["记录近期情绪和功能变化；如果持续或影响生活，建议寻求专业支持。"] },
        { key: "range-20-28", label: "中度", interpretation: "当前总分提示抑郁相关体验较为明显，建议进行进一步专业评估。", recommendations: ["建议与心理咨询师或医疗专业人员讨论近期状态、睡眠、功能和支持需要。"] },
        { key: "range-29-63", label: "较高", interpretation: "当前总分处于较高参考区间，抑郁相关体验可能已经明显影响日常功能。", recommendations: ["建议尽快寻求专业评估；第 9 题任何非零回答都应优先进行安全评估。"], riskNotice: "高分不等于临床诊断；如出现自杀计划、无法保证安全或危险冲动，应立即寻求紧急帮助。" },
      ],
    }),
  },
  overall: {
    summary: "BDI-II 总分反映最近 2 周抑郁相关自评体验的程度，不能替代专业诊断或风险评估。",
    recommendations: ["尤其关注自杀相关题目和日常功能变化，不要只依据总分判断严重程度。"],
  },
  limitations: screeningLimitations,
  sources: [bdiSource],
};
