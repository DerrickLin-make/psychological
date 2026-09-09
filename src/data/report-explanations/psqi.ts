import type { ScaleExplanation } from "./types";
import { bandedFactor, screeningLimitations, source } from "./shared";

const psqiSource = source(
  "original-study",
  "Buysse 等：The Pittsburgh Sleep Quality Index: a new instrument for psychiatric practice and research",
  1989,
  "https://doi.org/10.1016/0165-1781(89)90047-4",
);

const componentBands = [
  { key: "score-0", label: "0 分", interpretation: "本成分在本次作答中没有报告明显负担或困难。", recommendations: ["保持目前有帮助的睡眠习惯，并继续观察作息变化。"] },
  { key: "score-1", label: "1 分", interpretation: "本成分存在轻微或偶发的睡眠困难，当前影响相对有限。", recommendations: ["记录触发因素和发生频率，优先调整最容易改变的睡眠习惯。"] },
  { key: "score-2", label: "2 分", interpretation: "本成分存在较明显的睡眠困难，可能已经影响部分白天状态。", recommendations: ["连续记录睡眠和白天功能；若持续存在，建议咨询专业人员。"] },
  { key: "score-3", label: "3 分", interpretation: "本成分报告的睡眠困难较突出，建议结合持续时间和日间影响进一步评估。", recommendations: ["优先处理这一睡眠环节；如果持续或明显影响安全、工作和学习，尽快寻求专业评估。"], riskNotice: "PSQI 成分分数不能单独诊断睡眠障碍；若出现严重白天嗜睡、呼吸暂停线索或安全风险，应及时就医。" },
];

function componentFactor(key: string, name: string, construct: string, manifestations: string[], impact: string) {
  return bandedFactor({
    key,
    name,
    construct,
    scoreUnit: "component",
    direction: "concern",
    limitations: screeningLimitations,
    sources: [psqiSource],
    manifestations,
    impact,
    bands: componentBands,
  });
}

export const psqiExplanation: ScaleExplanation = {
  scaleSlug: "psqi",
  version: "2026.09-local-1",
  translationStatus: "working-adaptation",
  factors: {
    A: componentFactor("A", "主观睡眠质量", "对过去 1 个月总体睡眠质量的主观评价。", ["可能反映对睡眠是否恢复、满意和舒适的整体感受。"], "会影响对睡眠问题的总体判断，也可能影响白天的精力和情绪预期。"),
    B: componentFactor("B", "入睡潜伏", "入睡所需时间及入睡困难的频率。", ["可能表现为躺下后较久不能入睡，或需要反复调整才能入睡。"], "入睡困难可能压缩实际睡眠时间，并增加夜间焦虑和第二天疲劳。"),
    C: componentFactor("C", "睡眠时长", "过去 1 个月通常获得的实际睡眠时长。", ["实际睡眠时间可能少于个人需要，或因作息安排不稳定而波动。"], "睡眠不足可能影响注意力、情绪调节、反应速度和日间恢复。"),
    D: componentFactor("D", "睡眠效率", "实际睡眠时间占卧床时间的比例。", ["可能表现为卧床时间较长但真正睡着的时间较少，或夜间清醒时间较多。"], "低效率会让床与清醒、担忧或反复尝试入睡联系起来，削弱睡眠恢复感。"),
    E: componentFactor("E", "睡眠障碍", "夜间影响睡眠的各种症状或事件的频率。", ["可能包括夜醒、呼吸不适、鼾声、冷热不适、噩梦、疼痛等。"], "反复中断会减少连续睡眠，影响第二天的精力和情绪稳定。"),
    F: componentFactor("F", "催眠药物使用", "过去 1 个月使用催眠或助眠药物的频率。", ["可能反映为偶尔或经常需要药物帮助入睡或维持睡眠。"], "用药频率需要结合药物种类、医嘱、效果和副作用理解，不能仅凭成分分数判断用药是否合适。"),
    G: componentFactor("G", "日间功能障碍", "白天保持清醒和完成事情时受到的睡眠相关影响。", ["可能表现为白天困倦、注意力下降、动力不足或完成任务困难。"], "日间功能受影响时，学习、工作、驾驶和社交安全都可能受到牵连。"),
  },
  overall: {
    summary: "PSQI 通过七个睡眠成分描述过去 1 个月的睡眠质量、夜间困难和日间功能，总分是这些成分的合计，不替代睡眠障碍诊断。",
    recommendations: ["同时看总分和具体成分，优先处理最影响白天功能、持续时间最长或存在安全风险的睡眠问题。"],
    riskNotice: "如果出现持续严重失眠、明显白天嗜睡、睡眠呼吸异常或驾驶等场景中的安全风险，请及时寻求专业医疗评估。",
  },
  limitations: ["PSQI 的中文题干为本项目工作译文，正式研究或临床使用应采用授权中文版本。", ...screeningLimitations],
  sources: [psqiSource],
};
