import type { ScaleExplanation } from "./types";
import { bandedFactor, screeningLimitations, source } from "./shared";

const epdsSource = source(
  "original-study",
  "Cox, Holden & Sagovsky：Detection of postnatal depression and development of the EPDS",
  1987,
  "https://pubmed.ncbi.nlm.nih.gov/3651732/",
);

export const epdsExplanation: ScaleExplanation = {
  scaleSlug: "epds",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    total: bandedFactor({
      key: "total",
      name: "产后情绪总分",
      construct: "描述过去 7 天的情绪低落、焦虑、应对困难、失眠、悲伤和自伤相关体验。",
      scoreUnit: "sum",
      direction: "concern",
      limitations: [
        ...screeningLimitations,
        "EPDS 的解释和切点会受到孕期或产后阶段、文化背景和当地验证结果影响。",
      ],
      sources: [epdsSource],
      manifestations: ["可能涉及对未来的期待、焦虑担忧、情绪低落、哭泣和应对日常事务的困难。"],
      impact: "升高的产后情绪困扰可能影响休息、自我照顾、亲密关系和照料婴儿时的精力。",
      bands: [
        { key: "range-0-8", label: "较低", interpretation: "当前总分处于较低参考区间，未显示出明显升高的产后抑郁相关自评体验。", recommendations: ["继续关注睡眠、支持系统和情绪变化，给自己安排可获得的休息与帮助。"] },
        { key: "range-9-12", label: "轻度", interpretation: "当前总分提示部分产后情绪体验有所升高，建议结合持续时间和现实压力继续观察。", recommendations: ["与可信任的人或专业人员讨论近期状态；若困扰持续或加重，尽早寻求评估。"] },
        { key: "range-13-30", label: "需关注", interpretation: "当前总分达到需要进一步关注的区间，建议尽快结合产后阶段、功能影响和安全状况进行专业评估。", recommendations: ["建议尽快联系妇产科、精神科或心理专业人员；第 10 题任何非零回答都应优先处理。"], riskNotice: "产后情绪筛查不能替代诊断；如存在自伤或伤害婴儿的担忧，应立即获得紧急帮助。" },
      ],
    }),
  },
  overall: {
    summary: "EPDS 结果用于筛查近期产后情绪困扰，需结合产后时间、睡眠、支持系统和安全风险综合理解。",
    recommendations: ["不要把分数当作母职能力评价；需要帮助时尽早让家人和专业人员参与。"],
  },
  limitations: [
    ...screeningLimitations,
    "本项目为中文工作译文，正式临床或研究使用应采用经过授权和本地验证的版本。",
  ],
  sources: [epdsSource],
};
