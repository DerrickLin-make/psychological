import type { ScaleDefinition } from "./types";
import { q } from "./common";

const maritalOptions = (items: string[]) => items.map((detail, index) => ({ label: String(5 - index), detail, value: 5 - index }));

export const maritalAdjustmentScale: ScaleDefinition = {
  slug: "marital-adjustment",
  title: "婚姻调适测定量表",
  shortTitle: "LW",
  subtitle: "5 个 Word 中明确列出的题目 / 五点计分",
  category: "婚姻与关系",
  summary: "3. 对夫妻自我认知的促进作用：夫妻自身通过填写LW 量表，可以对自己的婚姻状况进行客 观、全面的评估。量表的结果就像一面镜子，帮助夫妻发现婚姻中存在的优势与不足，增   强自我认知。例如， 一对夫妻在填写量表后，发现他们在家庭财政管理方面意见分歧较大， 得分较低，这促使他们反思日常的沟通方式和理财观念，主动寻求解决办法，以改善婚姻   关系。这种自我认知的提升有助于夫妻在日常生活中更加有意识地调整自己的行为和态度， 预防婚姻问题的进一步恶化，维护婚姻的稳定与幸福。",
  intro: "请选择最符合你们当前婚姻关系的选项。",
  estimatedMinutes: 4,
  scoringNote: "The Word document lists five concrete example questions but describes a hypothetical 15-question total. This page presents only the five actual questions and does not invent the remaining items.",
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
    { key: "dimension1", name: "婚姻满意度维度", description: "", bands: [
      { min: 1, max: 2.5, label: "attention", summary: "Lower scores need further discussion." },
      { min: 2.6, max: 3.5, label: "middle", summary: "The item is in the middle range." },
      { min: 3.6, max: 5, label: "stronger", summary: "The item scores relatively high." },
    ] },
    { key: "dimension2", name: "夫妻意见一致性维度", description: "", bands: [
      { min: 1, max: 2.5, label: "attention", summary: "Lower scores need further discussion." },
      { min: 2.6, max: 3.5, label: "middle", summary: "The item is in the middle range." },
      { min: 3.6, max: 5, label: "stronger", summary: "The item scores relatively high." },
    ] },
    { key: "dimension3", name: "冲突处理方式维度", description: "", bands: [
      { min: 1, max: 2.5, label: "attention", summary: "Lower scores need further discussion." },
      { min: 2.6, max: 3.5, label: "middle", summary: "The item is in the middle range." },
      { min: 3.6, max: 5, label: "stronger", summary: "The item scores relatively high." },
    ] },
    { key: "dimension4", name: "共同活动与兴趣维度", description: "", bands: [
      { min: 1, max: 2.5, label: "attention", summary: "Lower scores need further discussion." },
      { min: 2.6, max: 3.5, label: "middle", summary: "The item is in the middle range." },
      { min: 3.6, max: 5, label: "stronger", summary: "The item scores relatively high." },
    ] },
    { key: "dimension5", name: "信任与忠诚度维度", description: "", bands: [
      { min: 1, max: 2.5, label: "attention", summary: "Lower scores need further discussion." },
      { min: 2.6, max: 3.5, label: "middle", summary: "The item is in the middle range." },
      { min: 3.6, max: 5, label: "stronger", summary: "The item scores relatively high." },
    ] },
  ],
};
