import type { ScaleExplanation } from "./types";
import { continuousFactor, descriptiveLimitations, source } from "./shared";

const fadSource = source(
  "original-study",
  "Epstein, Baldwin & Bishop：The McMaster Family Assessment Device",
  1983,
  "https://doi.org/10.1111/j.1752-0606.1983.tb01497.x",
);
function fadFactor(key: string, name: string, construct: string, focus: string) {
  return continuousFactor({
    key,
    name,
    construct,
    scoreUnit: "average",
    direction: "positive",
    limitations: [
      ...descriptiveLimitations,
      "当前项目使用的是五个维度的中文工作版本，不等同于完整 FAD 的全部分量表。",
    ],
    sources: [fadSource],
    manifestations: [`该维度主要观察家庭成员在${focus}中的互动方式。`, "单个成员的感受不能完全代表全体家庭成员的看法。"],
    impact: `该维度的互动质量可能影响家庭中的安全感、合作和应对压力的方式；需要结合具体事件理解。`,
    interpretation: `分数越高，通常表示${name}相关的家庭功能感受更充分；分数越低，可能提示需要进一步讨论的互动环节。本项目不使用统一的临床阈值。`,
    recommendations: ["选择一个具体、可观察的家庭情境进行沟通练习，避免把结果变成对某位家庭成员的责备。"],
  });
}

export const fadExplanation: ScaleExplanation = {
  scaleSlug: "fad",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    a: fadFactor("a", "情感交流", "描述家庭成员表达感受、需要和关心的开放程度。", "表达情感、谈论需要和处理不舒服的感受"),
    b: fadFactor("b", "积极沟通", "描述家庭成员坦率交流并共同面对问题的倾向。", "坦率表达、倾听和面对不愉快问题"),
    c: fadFactor("c", "自我主义", "描述家庭互动中是否更偏向个人利益、个人中心或缺少相互体谅。", "个人需要、相互体谅和家庭责任之间的平衡"),
    d: fadFactor("d", "问题解决", "描述家庭识别、讨论、执行和复盘问题解决方案的能力。", "识别问题、分配责任、执行方案和确认结果"),
    e: fadFactor("e", "家庭规则", "描述家庭规则、责任分担和相互管理的清晰度与灵活性。", "家务分工、提醒、边界和日常规则"),
  },
  overall: {
    summary: "FAD 结果用于描述若干家庭互动维度，不代表对某个家庭成员或整个家庭作出诊断。",
    recommendations: ["优先把分数转化为具体的沟通、分工和问题解决行为，而不是给家庭贴上好坏标签。"],
  },
  limitations: [
    ...descriptiveLimitations,
    "当前五维工作版本与原始 FAD 的七个分量表并不完全相同，报告不应声称等同于完整正式版本。",
  ],
  sources: [fadSource],
};
