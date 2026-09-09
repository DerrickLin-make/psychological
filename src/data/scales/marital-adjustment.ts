import type { ScaleDefinition } from "./types";
import { q } from "./common";

const maritalOptions = (items: string[]) => items.map((detail, index) => ({ label: String(5 - index), detail, value: 5 - index }));

export const maritalAdjustmentScale: ScaleDefinition = {
  slug: "marital-adjustment",
  title: "婚姻调适测定量表",
  shortTitle: "LW",
  subtitle: "5 题 / 五点计分",
  category: "婚姻与关系",
  summary: "本测试包含 5 道婚姻调适题目，涵盖婚姻满意度、意见一致性、冲突处理、共同活动和信任等方面。",
  intro: "请选择最符合你们当前婚姻关系的选项。",
  estimatedMinutes: 4,
  scoringNote: "每题按 1～5 分计分，本测试共展示并计分 5 道题目；结果按连续关系体验呈现，不设统一临床阈值。",
  kind: "profile",
  options: maritalOptions(["","","","",""]),
  questions: [
  q("marital-1", "你对目前婚姻生活的总体满意度如何?", maritalOptions(["非常满意", "比较满意", "一般", "不太满意", "非常不满意"]), false, { dimensionKey: "dimension1" }),
  q("marital-2", "在规划家庭年度旅游计划时，你和配偶的意见通常是否一致?", maritalOptions(["总是一致", "大部分时候一致", "偶尔一致", "很少一致", "从未一致"]), false, { dimensionKey: "dimension2" }),
  q("marital-3", "当你和配偶因某件事发生激烈争吵后，通常会采取以下哪种方式解决?", maritalOptions(["双方冷静后，主动沟通，寻求解决方案", "等对方先低头，自己再顺势和解", "暂时搁置，等过段时间自然淡忘", "争吵升级，甚至发生肢体冲突", "冷战，长时间不说话"]), false, { dimensionKey: "dimension3" }),
  q("marital-4", "你们夫妻每周共同参与户外运动的次数大概是多少?", maritalOptions(["3次及以上", "2次", "1次", "很少参与", "几乎从不参与"]), false, { dimensionKey: "dimension4" }),
  q("marital-5", "你是否放心让配偶单独与异性朋友外出聚会?", maritalOptions(["完全放心", "比较放心", "有点担心，但不会干涉", "很担心，会询问具体情况", "非常担心，坚决不允许"]), false, { dimensionKey: "dimension5" }),
  ],
  dimensions: [
    { key: "dimension1", name: "婚姻满意度维度", description: "", bands: [{ min: 1, max: 5, label: "连续性得分", summary: "分数按连续关系体验解释，不设统一临床阈值。" }] },
    { key: "dimension2", name: "夫妻意见一致性维度", description: "", bands: [{ min: 1, max: 5, label: "连续性得分", summary: "分数按连续关系体验解释，不设统一临床阈值。" }] },
    { key: "dimension3", name: "冲突处理方式维度", description: "", bands: [{ min: 1, max: 5, label: "连续性得分", summary: "分数按连续关系体验解释，不设统一临床阈值。" }] },
    { key: "dimension4", name: "共同活动与兴趣维度", description: "", bands: [{ min: 1, max: 5, label: "连续性得分", summary: "分数按连续关系体验解释，不设统一临床阈值。" }] },
    { key: "dimension5", name: "信任与忠诚度维度", description: "", bands: [{ min: 1, max: 5, label: "连续性得分", summary: "分数按连续关系体验解释，不设统一临床阈值。" }] },
  ],
};
