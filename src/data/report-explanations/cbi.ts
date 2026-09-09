import type { ScaleExplanation } from "./types";
import { continuousFactor, descriptiveLimitations, source } from "./shared";

const cbiSource = source(
  "original-study",
  "Kristensen, Borritz, Villadsen & Christensen：The Copenhagen Burnout Inventory",
  2005,
  "https://doi.org/10.1080/02678370500297720",
);

function cbiFactor(key: string, name: string, construct: string, interpretation: string, manifestations: string[], impact: string, recommendations: string[]) {
  return continuousFactor({
    key,
    name,
    construct,
    scoreUnit: "percent",
    direction: "concern",
    limitations: [
      ...descriptiveLimitations,
      "CBI 分数是连续指标，不能用一个统一阈值区分是否患有职业倦怠。",
    ],
    sources: [cbiSource],
    interpretation,
    manifestations,
    impact,
    recommendations,
  });
}

export const cbiExplanation: ScaleExplanation = {
  scaleSlug: "cbi",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    personal: cbiFactor("personal", "个人倦怠", "描述不归因于特定领域的总体疲劳和身心耗竭。", "分数越高，表示个人层面的疲劳和耗竭体验越明显；当前不设置统一临床切点。", ["可能感到精力不足、恢复变慢、身体沉重或即使休息后仍疲惫。"], "可能影响睡眠、情绪、注意力和处理日常任务的能力。", ["优先核对睡眠、休息、身体不适和持续压力来源，安排实际可执行的恢复时间。"]),
    work: cbiFactor("work", "工作相关倦怠", "描述与工作要求、工作量、控制感和工作环境相关的疲劳与耗竭。", "分数越高，表示工作情境相关的疲劳和耗竭越明显；应结合工作周期和任务结构观察。", ["可能在工作日更明显，表现为启动困难、工作后耗竭或对工作要求感到持续透支。"], "可能影响工作效率、错误率、职业满意度和下班后的恢复。", ["记录最消耗精力的工作环节，与主管或团队讨论负荷、优先级、边界和休息机会。"]),
    client: cbiFactor("client", "服务对象相关倦怠", "描述与客户、患者、学生或其他服务对象互动相关的疲劳、挫败和耗竭。", "分数越高，表示服务对象互动带来的耗竭体验越明显；不是对服务对象或从业者的道德评价。", ["可能表现为互动前紧张、互动后精疲力竭、共情资源下降或对重复需求感到挫败。"], "可能影响互动质量、情绪调节、工作边界和继续从事服务工作的意愿。", ["关注互动负荷、督导、同伴支持和恢复安排，必要时寻求专业支持。"]),
  },
  overall: {
    summary: "CBI 将个人、工作和服务对象相关的耗竭分开描述，分数用于定位压力来源，不提供统一临床等级。",
    recommendations: ["比较三个维度的情境差异，优先处理最具体、最可改变的负荷来源。"],
  },
  limitations: [
    ...descriptiveLimitations,
    "本项目使用中文工作译文，分数不应直接与未经确认的其他版本或人群常模比较。",
  ],
  sources: [cbiSource],
};
