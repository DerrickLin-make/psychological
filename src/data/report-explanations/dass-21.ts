import type { ScaleExplanation } from "./types";
import { bandedFactor, screeningLimitations, source } from "./shared";

const dassSource = source(
  "official",
  "Lovibond & Lovibond：Manual for the Depression Anxiety Stress Scales",
  1995,
  "https://www2.psy.unsw.edu.au/dass/",
);

function dassFactor(
  key: string,
  name: string,
  construct: string,
  manifestations: string[],
  impact: string,
  ranges: Array<{ key: string; label: string; interpretation: string; recommendations: string[]; riskNotice?: string }>,
) {
  return bandedFactor({
    key,
    name,
    construct,
    scoreUnit: "sum",
    direction: "concern",
    limitations: [
      ...screeningLimitations,
      "DASS-21 分量表的分数通常按 2 倍换算后解释；本项目按当前计分配置直接使用 0～21 分分量表结果。",
    ],
    sources: [dassSource],
    manifestations,
    impact,
    bands: ranges,
  });
}

export const dass21Explanation: ScaleExplanation = {
  scaleSlug: "dass-21",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    depression: dassFactor("depression", "抑郁", "描述低落、快感减少、动力不足、无望感和自我价值感下降等体验。", ["可能出现兴趣减少、难以启动活动、悲观或感到生活缺少意义。"], "较高分数可能影响日常动力、社交、学习工作和自我照顾。", [
      { key: "range-0-4", label: "正常范围", interpretation: "当前抑郁相关体验处于较低参考区间。", recommendations: ["保持日常活动与支持联系，留意状态是否随情境变化。"] },
      { key: "range-5-6", label: "轻度", interpretation: "抑郁相关体验略有升高，可能在部分情境中出现。", recommendations: ["观察兴趣、精力和睡眠变化；持续时寻求支持。"] },
      { key: "range-7-10", label: "中度", interpretation: "抑郁相关体验已有较明显升高，建议结合功能影响进一步了解。", recommendations: ["建议与心理或医疗专业人员讨论近期状态。"] },
      { key: "range-11-13", label: "重度", interpretation: "抑郁相关体验明显，日常功能受到影响的可能性增加。", recommendations: ["建议尽快进行专业评估，不要只依赖线上量表。"] },
      { key: "range-14-21", label: "极重度", interpretation: "抑郁相关体验处于很高区间，需要优先关注功能与安全。", recommendations: ["建议尽快联系专业服务；如存在自伤想法或无法保证安全，应立即求助。"], riskNotice: "DASS-21 不能单独诊断抑郁障碍，尤其要结合第 21 题安全信息和专业评估。" },
    ]),
    anxiety: dassFactor("anxiety", "焦虑", "描述紧张、害怕、惊恐感以及身体唤醒相关体验。", ["可能出现心跳加快、呼吸不适、发抖、害怕或对身体变化高度警觉。"], "较高分数可能影响放松、睡眠、注意力和对活动的回避。", [
      { key: "range-0-3", label: "正常范围", interpretation: "焦虑相关体验处于较低参考区间。", recommendations: ["维持规律生活，留意身体紧张是否只在特定情境出现。"] },
      { key: "range-4-4", label: "轻度", interpretation: "焦虑相关体验略有升高。", recommendations: ["记录触发情境和身体反应，安排规律休息。"] },
      { key: "range-5-7", label: "中度", interpretation: "焦虑相关体验已有明显升高，建议关注睡眠、回避和功能。", recommendations: ["建议结合近期压力和身体症状寻求专业讨论。"] },
      { key: "range-8-9", label: "重度", interpretation: "焦虑相关体验明显，可能已影响日常活动。", recommendations: ["建议尽快寻求专业评估，持续身体不适时也应排查医学原因。"] },
      { key: "range-10-21", label: "极重度", interpretation: "焦虑和身体唤醒体验处于很高区间。", recommendations: ["建议尽快寻求专业帮助，必要时优先处理急性不适。"], riskNotice: "DASS-21 结果不能单独确定焦虑障碍或身体疾病。" },
    ]),
    stress: dassFactor("stress", "压力", "描述难以放松、易激惹、过度反应和持续紧绷等压力体验。", ["可能感到容易被事情压垮、无法停下来或对小事反应较强。"], "长期高压力可能影响睡眠、恢复、情绪调节和任务安排。", [
      { key: "range-0-7", label: "正常范围", interpretation: "压力相关体验处于较低参考区间。", recommendations: ["保持能恢复精力的休息和生活节奏。"] },
      { key: "range-8-9", label: "轻度", interpretation: "压力和紧绷体验略有升高。", recommendations: ["留意任务负荷，安排短时恢复和清晰边界。"] },
      { key: "range-10-12", label: "中度", interpretation: "压力相关体验已有明显升高。", recommendations: ["主动调整负荷，并与专业人员讨论应对方式。"] },
      { key: "range-13-16", label: "重度", interpretation: "持续紧绷和易激惹体验明显，恢复可能受到影响。", recommendations: ["建议尽快进行专业评估，避免长期硬扛。"] },
      { key: "range-17-21", label: "极重度", interpretation: "压力体验处于很高区间，当前恢复资源可能不足。", recommendations: ["建议尽快寻求专业支持，并优先减少当前过载因素。"] },
    ]),
  },
  overall: {
    summary: "DASS-21 分别描述抑郁、焦虑和压力三个相关但不同的体验维度，不应将任一分量表直接当作诊断。",
    recommendations: ["分别看待三个维度，并结合持续时间、功能影响和安全状况理解结果。"],
  },
  limitations: [
    ...screeningLimitations,
    "DASS-21 是症状体验量表，不是对病因或临床诊断的单独判断。",
  ],
  sources: [dassSource],
};
