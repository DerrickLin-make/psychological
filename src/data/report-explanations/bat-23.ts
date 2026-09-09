import type { ScaleExplanation } from "./types";
import { continuousFactor, descriptiveLimitations, source } from "./shared";

const batSource = source(
  "original-study",
  "Schaufeli, Desart & De Witte：Burnout Assessment Tool（BAT-23）",
  2020,
  "https://burnoutassessmenttool.be/",
);

function batFactor(key: string, name: string, construct: string, interpretation: string, manifestations: string[], impact: string, recommendations: string[]) {
  return continuousFactor({
    key,
    name,
    construct,
    scoreUnit: "average",
    direction: "concern",
    limitations: [
      ...descriptiveLimitations,
      "BAT-23 的维度分数适合描述工作倦怠相关体验；不同国家、职业和样本可能需要不同常模。",
    ],
    sources: [batSource],
    interpretation,
    manifestations,
    impact,
    recommendations,
  });
}

export const bat23Explanation: ScaleExplanation = {
  scaleSlug: "bat-23",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    exhaustion: batFactor("exhaustion", "耗竭", "描述工作导致的身心精力耗尽和恢复不足。", "分数越高，表示工作相关的精力耗竭体验越明显；本项目不设置统一临床切点。", ["可能表现为疲惫、缺乏精力、恢复时间变长或工作前就感到负担。"], "可能减少注意力、耐心和下班后的可用精力。", ["先检查睡眠、恢复时间、工作负荷和休息边界，安排能够真正恢复的短时休息。"]),
    "mental-distance": batFactor("mental-distance", "心理距离", "描述对工作产生厌恶、冷漠、疏离或失去意义感的体验。", "分数越高，表示对工作保持心理距离和消极疏离的体验越明显。", ["可能出现不想接触工作、对工作内容冷漠或以机械方式完成任务。"], "可能影响投入、职业意义感、团队互动和服务质量。", ["记录最消耗或最失去意义的工作环节，区分短期疲劳与持续疏离，并讨论可调整的任务。"]),
    "cognitive-impairment": batFactor("cognitive-impairment", "认知受损", "描述工作中的专注、清晰思考、记忆和信息处理困难。", "分数越高，表示工作中的认知困难体验越明显；需要同时关注睡眠和压力。", ["可能出现分心、忘记细节、思路变慢、错误增多或难以完成复杂任务。"], "可能影响判断、学习、工作准确性和任务切换。", ["观察认知困难是否随睡眠、任务切换和压力变化，必要时减少并行任务并寻求评估。"]),
    "emotional-impairment": batFactor("emotional-impairment", "情绪受损", "描述工作中的情绪控制困难、易怒和过度反应。", "分数越高，表示工作中的情绪调节困难越明显。", ["可能更容易烦躁、失去耐心、对小事反应强烈或难以在互动后平复。"], "可能影响同事和服务对象互动、冲突处理及工作后的恢复。", ["为高压互动预留缓冲时间，练习暂停和边界表达，必要时寻求督导或专业支持。"]),
    "psychological-distress": batFactor("psychological-distress", "心理困扰", "描述与工作相关的睡眠、担忧、紧张和焦虑等伴随困扰。", "分数越高，表示工作相关心理困扰越明显；不等同于某种精神障碍。", ["可能出现担忧、睡眠受影响、紧张或难以从工作状态切换出来。"], "可能扩大工作压力对情绪、身体和日常功能的影响。", ["关注困扰是否已影响睡眠和日常功能，并考虑寻求心理或医疗评估。"]),
    psychosomatic: batFactor("psychosomatic", "身心症状", "描述与工作压力相关的心悸、胃肠不适、头痛、肌肉痛和易生病等体验。", "分数越高，表示身心症状体验越明显；身体症状也应排查医学原因。", ["可能出现头痛、肩颈或背部疼痛、胃肠不适、心悸或反复感觉身体不舒服。"], "可能影响工作耐受、睡眠、活动和对身体状态的安全感。", ["持续或明显的身体不适应先接受医疗评估，同时关注压力、姿势、活动和恢复。"]),
  },
  overall: {
    summary: "BAT-23 从耗竭、心理距离、认知和情绪功能以及伴随困扰等方面描述工作倦怠体验，不使用统一临床等级。",
    recommendations: ["查看各维度所指向的具体工作环节，优先调整负荷、恢复和支持，而不是只追求降低一个分数。"],
  },
  limitations: [
    ...descriptiveLimitations,
    "当前中文题目为工作译文，尚未在本项目中完成中文样本的信效度和常模验证。",
  ],
  sources: [batSource],
};
