import type { ScaleExplanation } from "./types";
import { continuousFactor, descriptiveLimitations, source } from "./shared";

const neoSource = source(
  "official",
  "Costa & McCrae：NEO-PI-R / NEO-FFI Professional Manual",
  1992,
  "https://sjdm.org/dmidi/NEO-FFI.html",
);
function neoFactor(
  key: string,
  name: string,
  construct: string,
  direction: "positive" | "concern" | "descriptive",
  lowMeaning: string,
  highMeaning: string,
  manifestations: string[],
  impact: string,
) {
  return continuousFactor({
    key,
    name,
    construct,
    scoreUnit: "sum",
    direction,
    limitations: descriptiveLimitations,
    sources: [neoSource],
    manifestations,
    impact,
    interpretation: `分数越低，${lowMeaning}；分数越高，${highMeaning}。本项目不使用统一的低、中、高阈值。`,
    recommendations: ["把该特质放回具体的学习、工作和关系情境中观察，避免把分数理解成绝对优劣。"],
  });
}

export const neoFfiExplanation: ScaleExplanation = {
  scaleSlug: "neo-ffi",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    N: neoFactor("N", "神经质", "描述体验负性情绪、压力反应和情绪波动的倾向。", "descriptive", "较少报告持续的负性情绪和压力反应，通常更容易恢复平衡。", "更容易感受到担忧、紧张或情绪波动，压力情境中的主观负荷可能更高。", ["可能更敏锐地注意到威胁、失败或不确定性。", "高分不表示缺陷，也可能反映对环境和内在状态的敏感。"], "在压力较大时，情绪负荷可能影响睡眠、专注和决策，需要更多恢复与支持。"),
    E: neoFactor("E", "外向性", "描述社交活力、积极情绪、表达和从互动中获得能量的倾向。", "descriptive", "更偏好安静、独处或小范围互动，社交能量未必来自高频交流。", "更常主动接触他人、表达观点并从社交和活动中获得能量。", ["可能在互动频率、表达主动性和活动节奏上与他人不同。", "低分不等于社交能力差，高分也不等于必须持续社交。"], "会影响适合的工作环境、恢复方式和沟通节奏，而不是直接决定能力或成就。"),
    O: neoFactor("O", "开放性", "描述对新经验、抽象思考、审美体验和不同观点的兴趣与接受度。", "descriptive", "更偏好熟悉、具体和经过验证的方式，通常重视实际经验与稳定性。", "更容易对新观点、复杂概念、想象和审美经验产生兴趣。", ["可能表现在好奇心、想象力、学习主题和对变化的接受程度上。", "高低都可能在不同任务中形成优势。"], "会影响学习偏好、问题解决方式和对变化的适应路径，不能直接等同于智力。"),
    A: neoFactor("A", "宜人性", "描述合作、信任、体谅、谦逊和关注他人需要的倾向。", "descriptive", "更倾向于直接表达立场、保持竞争性或对他人动机保持审慎。", "更倾向于合作、体谅和维护关系中的和谐，也更重视他人感受。", ["可能表现在冲突处理、信任速度、边界表达和帮助他人的方式上。", "高分不等于必须迎合，低分也不等于缺乏善意。"], "会影响协作、谈判、边界和冲突处理方式，关键在于能否按情境灵活调整。"),
    C: neoFactor("C", "尽责性", "描述目标坚持、组织计划、自律、可靠和完成任务的倾向。", "descriptive", "更偏好灵活应对和即时选择，可能不喜欢过度规划或固定流程。", "更倾向于提前规划、保持秩序并持续把责任落实到行动。", ["可能表现在时间管理、任务启动、细节关注和完成承诺上。", "高分也可能伴随过度自我要求，低分也可能带来灵活性。"], "会影响学习工作中的执行方式和压力来源，需同时关注效率与休息边界。"),
  },
  overall: {
    summary: "NEO-FFI 用五个宽泛人格维度描述相对稳定的倾向，不提供人格好坏排名，也不能据此推断职业或诊断。",
    recommendations: ["把维度分数当作自我观察线索，结合长期行为和真实环境，而不是根据一次作答固定定义自己。"],
  },
  limitations: descriptiveLimitations,
  sources: [neoSource],
};
