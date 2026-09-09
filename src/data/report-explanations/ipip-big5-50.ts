import type { ScaleExplanation } from "./types";
import { continuousFactor, descriptiveLimitations, source } from "./shared";

const ipipSource = source(
  "official",
  "International Personality Item Pool（IPIP）官方资料与 Goldberg 等人的人格项目研究",
  1999,
  "https://ipip.ori.org/",
);

function ipipFactor(key: string, name: string, construct: string, highMeaning: string, lowMeaning: string, manifestations: string[], impact: string) {
  return continuousFactor({
    key,
    name,
    construct,
    scoreUnit: "sum",
    direction: "descriptive",
    limitations: descriptiveLimitations,
    sources: [ipipSource],
    interpretation: `分数越高，${highMeaning}；分数越低，${lowMeaning}。这里描述的是连续倾向，不是能力排名。`,
    manifestations,
    impact,
    recommendations: ["结合具体情境观察该倾向何时有帮助、何时需要调整，不把人格分数当作固定标签。"],
  });
}

export const ipipBig5Explanation: ScaleExplanation = {
  scaleSlug: "ipip-big5-50",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    extraversion: ipipFactor("extraversion", "外向性", "描述社交活力、表达意愿和从互动中获得能量的倾向。", "更容易主动互动、表达和寻求外部刺激", "更偏好安静、独处或小范围互动", ["可能表现在谈话主动性、活动频率和社交恢复方式上。"], "会影响适合的沟通节奏和环境偏好，但不等同于社交能力。"),
    agreeableness: ipipFactor("agreeableness", "宜人性", "描述合作、体谅、共情和关注他人感受的倾向。", "更重视合作、信任和维护关系", "更倾向于直接、审慎或竞争性的互动方式", ["可能表现在冲突、边界、帮助他人和信任判断上。"], "会影响团队合作和关系维护，需要与边界表达同时看待。"),
    conscientiousness: ipipFactor("conscientiousness", "尽责性", "描述规划、秩序、自律和把责任落实到行动的倾向。", "更容易规划、坚持和按时完成任务", "更偏好灵活调整，可能不喜欢固定流程", ["可能表现在整理、时间管理、任务启动和承诺兑现上。"], "会影响学习工作中的执行方式，也需防止过度完美和自我压力。"),
    "emotional-stability": ipipFactor("emotional-stability", "情绪稳定性", "描述面对压力、波动和负性情绪时的稳定与恢复倾向。", "更容易保持稳定并从压力中恢复", "更容易体验担忧、紧张或情绪波动", ["可能表现在压力反应、担忧频率和恢复速度上。"], "会影响主观压力和恢复，但不能替代情绪症状筛查。"),
    intellect: ipipFactor("intellect", "智力／想象力", "描述抽象思考、词汇、想象力和对新观点的兴趣。", "更容易对复杂概念、新观点和创造性想法感兴趣", "更重视具体经验、熟悉方式和实际应用", ["可能表现在学习主题、问题解决方式和审美兴趣上。"], "会影响探索和学习偏好，不等于智商或学业成绩。"),
  },
  overall: {
    summary: "IPIP 大五结果描述五个连续人格倾向。IPIP 项目本身是开放的人格测量资源，但具体组合和中文版本仍需要独立验证。",
    recommendations: ["把结果用于理解偏好和行为模式，结合真实行为与环境反馈，而不是据此判断价值或职业适配。"],
  },
  limitations: [
    ...descriptiveLimitations,
    "本项目的 50 题组合和中文译文需要单独的本地信效度与常模验证。",
  ],
  sources: [ipipSource],
};
