import type { ScaleDefinition } from "./types";
import { agreementOptions } from "./presets";

export const personalityProfileScale: ScaleDefinition = {
  slug: "personality-profile",
  title: "人格倾向速测画像",
  shortTitle: "人格画像",
  subtitle: "10 题 / 五维画像 / 含反向计分示例",
  category: "人格量表",
  summary: "以五个核心人格维度快速形成来访者画像，适合会谈前了解互动风格与稳定特质。",
  intro: "请按你平时更稳定、更常见的一面作答，而不是仅根据最近几天的情绪状态判断。",
  estimatedMinutes: 3,
  scoringNote: "每个维度单独计分，部分题目采用反向计分以平衡作答偏差。",
  kind: "profile",
  options: agreementOptions,
  questions: [
    { id: "tipi-1", text: "我通常外向、有活力，和人互动会让我充电。", dimensionKey: "extraversion" },
    { id: "tipi-2", text: "我愿意体谅他人，也比较容易合作共事。", dimensionKey: "agreeableness" },
    { id: "tipi-3", text: "我做事有条理，答应别人的事情通常会落实。", dimensionKey: "conscientiousness" },
    { id: "tipi-4", text: "我容易紧张、敏感，压力一来情绪波动会比较明显。", dimensionKey: "emotional-stability", reverse: true },
    { id: "tipi-5", text: "我对新观点和新体验有好奇心，愿意尝试变化。", dimensionKey: "openness" },
    { id: "tipi-6", text: "我更安静克制，很多时候宁愿自己待着。", dimensionKey: "extraversion", reverse: true },
    { id: "tipi-7", text: "我容易挑剔或不耐烦，合作时常先看到问题。", dimensionKey: "agreeableness", reverse: true },
    { id: "tipi-8", text: "我容易分心或拖延，执行节奏不够稳定。", dimensionKey: "conscientiousness", reverse: true },
    { id: "tipi-9", text: "大多数时候我比较平和，能较快恢复稳定。", dimensionKey: "emotional-stability" },
    { id: "tipi-10", text: "我更偏向熟悉和确定，不太主动尝试新鲜做法。", dimensionKey: "openness", reverse: true },
  ],
  dimensions: [
    {
      key: "extraversion",
      name: "外向性",
      description: "反映个体在社交活力、表达意愿与互动偏好上的倾向。",
      bands: [
        { min: 1, max: 3.49, label: "偏内敛", summary: "更偏好低刺激和有边界的互动方式。" },
        { min: 3.5, max: 5.49, label: "均衡", summary: "能在独处与社交之间灵活切换。" },
        { min: 5.5, max: 7, label: "偏外向", summary: "更容易从社交、表达和行动中获得能量。" },
      ],
    },
    {
      key: "agreeableness",
      name: "宜人性",
      description: "反映合作、共情、体谅与冲突处理风格。",
      bands: [
        { min: 1, max: 3.49, label: "直接务实", summary: "表达更直接，合作中更强调边界和效率。" },
        { min: 3.5, max: 5.49, label: "均衡", summary: "既能照顾关系，也保留自己的判断。" },
        { min: 5.5, max: 7, label: "高度合作", summary: "更容易体察他人感受并维持关系和谐。" },
      ],
    },
    {
      key: "conscientiousness",
      name: "尽责性",
      description: "反映规划、自律、执行与责任落实能力。",
      bands: [
        { min: 1, max: 3.49, label: "弹性随性", summary: "风格更灵活，但节奏和持续性可能波动较大。" },
        { min: 3.5, max: 5.49, label: "均衡", summary: "在秩序与灵活之间保持相对平衡。" },
        { min: 5.5, max: 7, label: "高自律", summary: "更重视规划、承诺和结果落地。" },
      ],
    },
    {
      key: "emotional-stability",
      name: "情绪稳定性",
      description: "反映压力来临时的恢复速度和情绪调节能力。",
      bands: [
        { min: 1, max: 3.49, label: "敏感警觉", summary: "更容易察觉压力和风险，情绪波动也会更明显。" },
        { min: 3.5, max: 5.49, label: "均衡", summary: "能感受到压力，但通常保有基本稳定度。" },
        { min: 5.5, max: 7, label: "高稳定", summary: "面对压力时更容易保持平和并逐步恢复。" },
      ],
    },
    {
      key: "openness",
      name: "开放性",
      description: "反映个体对新观点、抽象思考和变化体验的接受度。",
      bands: [
        { min: 1, max: 3.49, label: "偏保守", summary: "更偏好熟悉路径与明确规则，重视确定性。" },
        { min: 3.5, max: 5.49, label: "均衡", summary: "能在稳定和探索之间做适度切换。" },
        { min: 5.5, max: 7, label: "高开放", summary: "愿意尝试新观点、新方法和不同体验。" },
      ],
    },
  ],
};
