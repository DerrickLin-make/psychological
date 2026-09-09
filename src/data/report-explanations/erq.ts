import type { ScaleExplanation } from "./types";
import { continuousFactor, descriptiveLimitations, source } from "./shared";

const erqSource = source(
  "original-study",
  "Gross & John：Individual differences in two emotion regulation processes",
  2003,
  "https://pubmed.ncbi.nlm.nih.gov/12916575/",
);

export const erqExplanation: ScaleExplanation = {
  scaleSlug: "erq",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    reappraisal: continuousFactor({
      key: "reappraisal",
      name: "认知重评",
      construct: "描述通过改变对情境的理解和想法来改变情绪影响的倾向。",
      scoreUnit: "average",
      direction: "descriptive",
      limitations: descriptiveLimitations,
      sources: [erqSource],
      interpretation: "分数越高，表示更常使用重新理解情境、寻找不同视角等方式调节情绪。",
      manifestations: ["可能在情绪升级前尝试换一种解释，或从更长远的角度看待事件。"],
      impact: "在部分情境中有助于减轻情绪强度，但重新理解不能替代解决现实问题或表达需要。",
      recommendations: ["观察重评是否基于事实和目标，避免用“想开点”跳过真实感受与现实行动。"],
    }),
    suppression: continuousFactor({
      key: "suppression",
      name: "表达抑制",
      construct: "描述通过不表达正在发生的情绪来控制外在表现的倾向。",
      scoreUnit: "average",
      direction: "descriptive",
      limitations: descriptiveLimitations,
      sources: [erqSource],
      interpretation: "分数越高，表示更常隐藏或抑制情绪表达；这不等于情绪本身较少。",
      manifestations: ["可能在他人面前保持表面平静，减少表达悲伤、愤怒或兴奋。"],
      impact: "短期可能帮助维持场合需要，长期也可能增加内在负荷或减少关系中的真实沟通。",
      recommendations: ["在安全关系中练习适度、具体地表达感受和需要，同时保留必要的边界。"],
    }),
  },
  overall: {
    summary: "ERQ 区分认知重评和表达抑制两种情绪调节策略；两者都是倾向，不应简单判定为绝对好或坏。",
    recommendations: ["结合具体情境观察策略的短期帮助和长期代价，逐步增加可选择的调节方式。"],
  },
  limitations: descriptiveLimitations,
  sources: [erqSource],
};
