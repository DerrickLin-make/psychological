import type { ScaleExplanation } from "./types";
import { bandedFactor, screeningLimitations, source } from "./shared";

const scl90Source = source(
  "official",
  "Pearson：Symptom Checklist-90-Revised（SCL-90-R）官方产品与手册资料",
  1994,
  "https://www.pearsonassessments.com/en-us/Store/Professional-Assessments/Personality-%26-Biopsychosocial/Symptom-Checklist-90-Revised/p/100000645",
);

const levels = [
  { key: "negative", label: "阴性", interpretation: "该因子均分低于本项目设定的 2 分参考线，当前未达到阳性参考水平。", recommendations: ["继续结合实际体验观察；如单项困扰明显，也不应只看总分。"] },
  { key: "mild", label: "轻度阳性", interpretation: "该因子均分达到轻度阳性参考水平，提示近期可能存在一定相关体验。", recommendations: ["记录具体症状、持续时间和情境；如果影响功能或持续存在，建议咨询专业人员。"] },
  { key: "moderate", label: "中度阳性", interpretation: "该因子均分达到中度阳性参考水平，相关体验可能较集中或较频繁。", recommendations: ["建议安排专业评估，结合睡眠、身体状态、生活事件和功能影响理解。"] },
  { key: "elevated", label: "偏重阳性", interpretation: "该因子均分处于偏重阳性参考水平，近期困扰可能较明显。", recommendations: ["建议尽快获得专业心理或医疗评估，确认困扰来源和支持需要。"] },
  { key: "severe", label: "重度阳性", interpretation: "该因子均分处于较高阳性参考水平，相关困扰可能已明显影响日常状态。", recommendations: ["建议尽快寻求专业评估；如存在紧迫安全风险，应立即联系当地急救或危机支持。"], riskNotice: "SCL-90 结果不能单独用于诊断；高分尤其需要结合面谈、功能影响和安全状况确认。" },
];

function factor(key: string, name: string, construct: string, manifestations: string[], impact: string) {
  return bandedFactor({
    key,
    name,
    construct,
    scoreUnit: "average",
    direction: "concern",
    limitations: screeningLimitations,
    sources: [scl90Source],
    manifestations,
    impact,
    bands: levels,
  });
}

export const scl90Explanation: ScaleExplanation = {
  scaleSlug: "scl-90",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    F1: factor("F1", "躯体化", "描述以身体不适、疼痛或生理感受形式体验心理压力的倾向。", ["可能关注头晕、心慌、胃肠不适、肌肉紧张或其他身体感觉。"], "持续的身体困扰可能影响活动、睡眠和就医决策，需要同时排查医学原因。"),
    F2: factor("F2", "强迫症状", "描述反复出现的想法、冲动或需要重复确认、检查的体验。", ["可能难以停止反复思考，或需要重复行为来减轻不安。"], "会占用注意力和时间，影响任务完成、睡眠和日常灵活性。"),
    F3: factor("F3", "人际关系敏感", "描述在人际互动中感到被评价、尴尬、受伤或不自在的体验。", ["可能更敏感地注意他人的眼神、语气、评价或距离变化。"], "可能减少社交投入，增加回避和关系中的自我怀疑。"),
    F4: factor("F4", "抑郁", "描述低落、兴趣减少、精力下降、无望感等抑郁相关体验。", ["可能表现为情绪低落、动力减少、疲劳、自我评价下降或失去兴趣。"], "可能影响自我照顾、学习工作、人际互动和对未来的期待。"),
    F5: factor("F5", "焦虑", "描述紧张、担心、惊恐感和身体唤醒等焦虑相关体验。", ["可能表现为坐立不安、心跳加快、过度担忧或难以放松。"], "持续焦虑可能干扰专注、睡眠、决策和对日常活动的参与。"),
    F6: factor("F6", "敌对", "描述易怒、烦躁、争执冲动或对抗性体验。", ["可能更容易因挫折、阻碍或不公平感产生强烈反应。"], "可能增加冲突频率，影响关系、团队协作和自我控制感。"),
    F7: factor("F7", "恐怖", "描述对特定对象、场景或社交情境的强烈害怕和回避体验。", ["可能在特定场景中出现明显害怕、紧张或想要逃离的冲动。"], "回避范围扩大时，可能限制出行、社交、学习和工作的选择。"),
    F8: factor("F8", "偏执", "描述对他人意图、关系安全或被伤害可能性的警觉和不信任体验。", ["可能反复揣测他人动机，较难放松地接受模糊信息。"], "过高警觉可能增加关系压力和孤立感；应结合现实证据谨慎理解。"),
    F9: factor("F9", "精神病性", "描述疏离、孤独、怪异体验或与现实感和社会联系有关的困扰线索。", ["可能感到与他人隔离、思绪异常难整理，或出现不寻常的感受。"], "若相关体验明显或影响现实判断、生活安全，应尽快接受专业评估。"),
    F10: factor("F10", "睡眠及饮食", "描述睡眠、食欲和饮食节律方面的近期困扰。", ["可能表现为入睡困难、早醒、睡眠不稳、食欲变化或饮食节律改变。"], "睡眠和饮食变化会反过来影响情绪、精力、专注与身体状态。"),
  },
  overall: {
    summary: "SCL-90 通过多个症状维度描述近一周的主观困扰强度；总症状指数、阳性项目数和各因子均分需要结合功能影响与专业面谈理解。",
    recommendations: ["优先关注持续时间长、影响功能明显或涉及安全的具体体验，并结合身体状况和近期生活事件进行评估。"],
    riskNotice: "本报告是自我筛查与自我觉察参考，不构成精神或身体疾病诊断；如出现自伤、自杀、现实判断明显受损或无法维持基本生活的情况，请立即寻求紧急帮助。",
  },
  limitations: ["SCL-90 的中文内容和本地参考线需要以授权版本及适用人群常模为准，本报告不将阳性结果等同于临床诊断。", ...screeningLimitations],
  sources: [scl90Source],
};
