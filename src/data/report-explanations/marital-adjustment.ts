import type { ScaleExplanation } from "./types";
import { continuousFactor, descriptiveLimitations, source } from "./shared";

const maritalSource = source(
  "original-study",
  "Spanier：Measuring Dyadic Adjustment: New Scales for Assessing the Quality of Marriage and Similar Dyads",
  1976,
  "https://doi.org/10.2307/350547",
);
function maritalFactor(key: string, name: string, construct: string, focus: string) {
  return continuousFactor({
    key,
    name,
    construct,
    scoreUnit: "average",
    direction: "positive",
    limitations: [
      ...descriptiveLimitations,
      "当前项目是五题关系自评工作版本，不等同于完整的 Dyadic Adjustment Scale（DAS）。",
    ],
    sources: [maritalSource],
    manifestations: [`该维度主要涉及${focus}。`, "一个人的单次回答不能替代双方共同参与的关系评估。"],
    impact: "关系中的这一环节可能影响安全感、满意度、合作和冲突后的修复；需结合具体互动观察。",
    interpretation: `分数越高，通常表示${name}相关的关系体验更充分；分数越低，可能提示需要进一步讨论的互动环节。本项目不使用统一的临床阈值。`,
    recommendations: ["围绕一个具体事件描述事实、感受和需要，避免把分数变成对伴侣的结论。"],
  });
}

export const maritalAdjustmentExplanation: ScaleExplanation = {
  scaleSlug: "marital-adjustment",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    dimension1: maritalFactor("dimension1", "婚姻满意度维度", "描述对当前婚姻生活整体满足程度的主观感受。", "总体满意、失望和关系持续性的感受"),
    dimension2: maritalFactor("dimension2", "夫妻意见一致性维度", "描述双方在计划、目标和家庭安排上的一致程度。", "重要决定、计划和家庭事务上的协商"),
    dimension3: maritalFactor("dimension3", "冲突处理方式维度", "描述发生冲突后双方沟通、冷静、修复或升级的倾向。", "争吵后的沟通、修复和安全边界"),
    dimension4: maritalFactor("dimension4", "共同活动与兴趣维度", "描述双方共同参与活动、放松和维持连接的程度。", "共同活动、兴趣和相处时间"),
    dimension5: maritalFactor("dimension5", "信任与忠诚度维度", "描述关系中的信任、安全感和对伴侣边界的尊重。", "信任、担忧、控制和关系边界"),
  },
  overall: {
    summary: "本量表用于描述关系中的几个主题，不能替代双方访谈、伴侣治疗或对关系安全的专业评估。",
    recommendations: ["如果存在持续冷战、控制、威胁或肢体冲突，应优先处理安全和专业支持，而不是只比较分数。"],
  },
  limitations: [
    ...descriptiveLimitations,
    "当前五题版本与原始 DAS 的四个分量表和完整条目不同，现有区间仅作为项目内的描述性参考。",
  ],
  sources: [maritalSource],
};
