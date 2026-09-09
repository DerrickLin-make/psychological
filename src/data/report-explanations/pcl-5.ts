import type { ScaleExplanation } from "./types";
import { bandedFactor, screeningLimitations, source } from "./shared";

const pclSource = source(
  "official",
  "U.S. Department of Veterans Affairs, National Center for PTSD：PCL-5 使用与计分说明",
  2013,
  "https://www.ptsd.va.gov/professional/assessment/adult-sr/ptsd-checklist.asp",
);
const manifestations = [
  "可能出现与创伤经历有关的闯入、回避、情绪或警觉变化。",
  "这些体验的频率和强度需要结合具体事件、持续时间及个人感受理解。",
];
const impact = "如果相关体验持续存在，可能影响睡眠、注意力、工作学习、人际互动或对环境安全的感受。";

export const pcl5Explanation: ScaleExplanation = {
  scaleSlug: "pcl-5",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    total: bandedFactor({
      key: "total",
      name: "创伤相关症状总分",
      construct: "描述过去一个月与特定创伤或高压力经历相关的症状困扰程度。",
      scoreUnit: "sum",
      direction: "concern",
      limitations: [
        ...screeningLimitations,
        "本项目使用的是每题 1～5 分的本地版本，不能直接等同于官方 0～4 分 PCL-5 的原始分数。",
      ],
      sources: [pclSource],
      manifestations,
      impact,
      bands: [
        {
          key: "range-17-30",
          label: "较低",
          interpretation: "本次创伤相关困扰总分处于当前版本的较低区间，未达到项目设置的进一步关注参考线。",
          recommendations: ["如果仍有反复回避、噩梦或明显警觉，可继续记录触发情境并寻求支持。"],
        },
        {
          key: "range-31-33",
          label: "需要关注",
          interpretation: "本次创伤相关困扰达到进一步关注参考区间，建议结合具体创伤经历和日常功能做专业评估。",
          recommendations: ["建议预约临床心理师或精神科医生，进一步讨论症状持续时间、功能影响和安全感。"],
        },
        {
          key: "range-34-85",
          label: "较高",
          interpretation: "本次创伤相关困扰处于较高区间，相关症状可能已经明显影响生活或恢复过程。",
          recommendations: ["建议尽快寻求专业心理或精神科评估；如出现无法保证自身安全的情况，应立即寻求紧急帮助。"],
          riskNotice: "高分并不单独确诊 PTSD，但持续的创伤相关困扰和功能受损值得尽快获得专业支持。",
        },
      ],
    }),
  },
  overall: {
    summary: "PCL-5 结果用于描述创伤相关症状的自我报告强度，解释时需要结合创伤事件、症状持续时间、功能影响和专业访谈。",
    recommendations: ["不要仅凭一次总分给自己贴上诊断标签；如困扰持续或影响日常功能，建议进行专业评估。"],
  },
  limitations: [
    ...screeningLimitations,
    "官方资料说明 PCL-5 的解释和切点需要结合人群与评估目的；本项目的中文题目和 1～5 分计分属于工作版本。",
  ],
  sources: [pclSource],
};
