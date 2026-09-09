import type { ScaleExplanation } from "./types";
import { continuousFactor, descriptiveLimitations, source } from "./shared";

const gseSource = source(
  "original-study",
  "Schwarzer & Jerusalem：Generalized Self-Efficacy Scale",
  1995,
  "https://userpage.fu-berlin.de/health/selfscal.htm",
);

export const gseExplanation: ScaleExplanation = {
  scaleSlug: "gse",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    "self-efficacy": continuousFactor({
      key: "self-efficacy",
      name: "一般自我效能感",
      construct: "描述一个人面对困难、变化和任务时，对自己能够找到办法并完成应对的总体信念。",
      scoreUnit: "sum",
      direction: "positive",
      limitations: descriptiveLimitations,
      sources: [gseSource],
      interpretation: "分数越高，表示本次作答中对自身应对和解决问题能力的信念越强；这不是实际能力或成功保证。",
      manifestations: ["可能表现为面对难题时更愿意启动行动、寻找替代方案和坚持尝试。", "低分也可能反映近期挫折、资源不足或特定任务经验，而非固定缺陷。"],
      impact: "自我效能感可能影响目标设定、行动启动、坚持和从失败中恢复的方式。",
      recommendations: ["把过去成功应对的具体步骤记录下来，将大目标拆成可完成的小行动，并用真实反馈更新判断。"],
    }),
  },
  overall: {
    summary: "GSE 结果描述一般自我效能信念，不等同于客观能力、人格价值或对未来结果的保证。",
    recommendations: ["优先从具体、可完成的行动中积累掌控感，而不是只追求更高的自我评价。"],
  },
  limitations: descriptiveLimitations,
  sources: [gseSource],
};
