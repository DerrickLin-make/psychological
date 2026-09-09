import type { ScaleExplanation } from "./types";
import { continuousFactor, descriptiveLimitations, source } from "./shared";

const ffmqSource = source(
  "original-study",
  "Baer, Smith, Hopkins, Krietemeyer & Toney：Using self-report assessment methods to explore facets of mindfulness",
  2006,
  "https://doi.org/10.1177/1073191105283504",
);

function ffmqFactor(key: string, name: string, construct: string, interpretation: string, manifestations: string[], impact: string, recommendations: string[]) {
  return continuousFactor({
    key,
    name,
    construct,
    scoreUnit: "average",
    direction: "positive",
    limitations: descriptiveLimitations,
    sources: [ffmqSource],
    interpretation,
    manifestations,
    impact,
    recommendations,
  });
}

export const ffmq39Explanation: ScaleExplanation = {
  scaleSlug: "ffmq-39",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    observe: ffmqFactor("observe", "观察", "描述注意内在体验和外部感官信息的倾向。", "分数越高，表示本次作答中更常注意身体、感官、想法或情绪的变化。", ["可能留意声音、身体感觉、情绪变化和环境细节。"], "观察能提供自我觉察线索，但也需要避免把注意变成反复监控或担忧。", ["练习把注意放回当下一个具体感官对象，并同时保持对情境的整体把握。"]),
    describe: ffmqFactor("describe", "描述", "描述识别并用语言表达内在体验的倾向。", "分数越高，表示更容易辨认和描述自己的想法、情绪与身体感觉。", ["可能更容易说清楚“我感到什么、发生了什么、我需要什么”。"], "更清晰的表达有助于沟通和寻求支持，但不代表情绪一定更少。", ["用简单词语记录情绪、身体感觉和需要，先求准确，不要求表达得完美。"]),
    "act-aware": ffmqFactor("act-aware", "觉察行动", "描述在进行活动时保持当下注意，而不是自动化或走神的倾向。", "分数越高，表示做事时更能觉察正在做什么、注意力在哪里。", ["可能更少在自动驾驶状态下完成任务，也更容易发现注意力偏移。"], "有助于减少粗心和冲动反应，但不等于需要持续紧绷地监控自己。", ["选择一个日常活动进行短时单任务练习，发现走神后温和地把注意带回。"]),
    nonjudge: ffmqFactor("nonjudge", "不评判", "描述较少用好坏、应该不应该评价自己想法和感受的倾向。", "分数越高，表示更能允许内在体验存在，而不立即进行自我批评。", ["可能更少因为出现某种想法或情绪而责备自己。"], "减少自我评判可能帮助情绪恢复和自我理解，但不等于放弃对行为后果负责。", ["把“我正在有这个感受”和“我必须按它行动”区分开。"]),
    nonreact: ffmqFactor("nonreact", "不反应", "描述允许想法和情绪来去，而不被它们立即带走的倾向。", "分数越高，表示更能在情绪或想法出现时留出反应空间。", ["可能先观察、暂停，再决定是否表达或行动。"], "有助于减少自动化反应，但不代表压抑情绪或永远保持平静。", ["在困难情境中先暂停几秒，命名体验，再选择符合目标的下一步。"]),
  },
  overall: {
    summary: "FFMQ-39 从五个方面描述正念相关倾向，分数高低不是道德评价，也不代表已经掌握某种训练技能。",
    recommendations: ["把分数转化为具体觉察练习，并观察练习是否改善当下选择和恢复，而不是追求单一总分。"],
  },
  limitations: [
    ...descriptiveLimitations,
    "不同人群、冥想经验和中文版本可能影响各维度的结构与分数解释。",
  ],
  sources: [ffmqSource],
};
