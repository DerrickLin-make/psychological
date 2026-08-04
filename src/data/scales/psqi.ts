import type { ScaleDefinition } from "./types";
import { q } from "./common";

const psqiLatencyOptions = [{"label": "0", "detail": "≤15min", "value": 0}, {"label": "1", "detail": "16~30min", "value": 1}, {"label": "2", "detail": "30~60min", "value": 2}, {"label": "3", "detail": "＞60min", "value": 3}];
const psqiFrequencyOptions = [{"label": "0", "detail": "过去1个月没有", "value": 0}, {"label": "1", "detail": "每周平均不足1个晚上", "value": 1}, {"label": "2", "detail": "每周平均1~2个晚上", "value": 2}, {"label": "3", "detail": "每周平均3个或更多晚上", "value": 3}];
const psqiQualityOptions = [{"label": "0", "detail": "非常好", "value": 0}, {"label": "1", "detail": "尚好", "value": 1}, {"label": "2", "detail": "不好", "value": 2}, {"label": "3", "detail": "非常差", "value": 3}];
const psqiDaytimeOptions = [{"label": "0", "detail": "过去1个月没有", "value": 0}, {"label": "1", "detail": "每周平均不足1个晚上", "value": 1}, {"label": "2", "detail": "每周平均1~2个晚上", "value": 2}, {"label": "3", "detail": "每周平均3个或更多晚上", "value": 3}];
const psqiActivityOptions = [{"label": "0", "detail": "没有困难", "value": 0}, {"label": "1", "detail": "有一点困难", "value": 1}, {"label": "2", "detail": "比较困难", "value": 2}, {"label": "3", "detail": "非常困难", "value": 3}];

export const psqiScale: ScaleDefinition = {
  slug: "psqi",
  title: "匹兹堡睡眠质量指数（PSQI）",
  shortTitle: "PSQI",
  subtitle: "睡眠质量指数 / 最近 1 个月",
  category: "睡眠",
  summary: "PSQI中前19个条目为自我评定问题，由被评价者亲自填写，后5个问题由睡眠同伴评定，主要根据最近1个月的睡眠习惯进行填写。",
  intro: "请根据最近 1 个月的睡眠习惯填写。时间题请按 24 小时制填写。",
  estimatedMinutes: 8,
  scoringNote: "本页面呈现 Word 文档中可计分的自评单元：Q1～Q4、Q5A～J、Q6～Q9，共 18 个。原文将其概括为 19 个自评条目，但表格实际列出 18 个可计分单元；Q10 及 Q11～Q15 为睡眠同伴评定项目，不参与总分，因此未纳入本页计分。因子计分沿用原文：睡眠效率＝实际睡眠时间／床上时间×100%，并按 A～G 因子相加得到 0～21 分。",
  kind: "custom",
  options: psqiFrequencyOptions,
  questions: [
  q("psqi-1", "过去1个月你通常上床睡觉的时间是？（请按24h制填写）", undefined, false, { inputType: "time", placeholder: "23:00" }),
  q("psqi-2", "过去1个月你每晚通常要多长时间（min）才能入睡？", psqiLatencyOptions),
  q("psqi-3", "过去1个月每天早上通常什么时候起床？（请按24h制填写）", undefined, false, { inputType: "time", placeholder: "07:00" }),
  q("psqi-4", "过去1个月你每晚实际睡眠的时间有多少？", undefined, false, { inputType: "duration", placeholder: "7:30" }),
  q("psqi-5A", "A.不能在30min内入睡", psqiFrequencyOptions),
  q("psqi-5B", "B.在晚上睡眠中醒来或早醒", psqiFrequencyOptions),
  q("psqi-5C", "C.晚上有无起床上洗手间", psqiFrequencyOptions),
  q("psqi-5D", "D.不舒服的呼吸", psqiFrequencyOptions),
  q("psqi-5E", "E.大声咳嗽或打鼾", psqiFrequencyOptions),
  q("psqi-5F", "F.感到寒冷", psqiFrequencyOptions),
  q("psqi-5G", "G.感到太热", psqiFrequencyOptions),
  q("psqi-5H", "H.做噩梦", psqiFrequencyOptions),
  q("psqi-5I", "I.出现疼痛", psqiFrequencyOptions),
  q("psqi-5J", "J.其他影响睡眠的事情如果有，请说明：", psqiFrequencyOptions),
  q("psqi-6", "你对过去1个月睡眠质量总的评价", psqiQualityOptions),
  q("psqi-7", "近1个月你用催眠药物的情况", psqiFrequencyOptions),
  q("psqi-8", "过去1个月你在开车、吃饭或参加社会活动时难以保持清醒状态？", psqiDaytimeOptions),
  q("psqi-9", "过去1个月你在积极完成事情上有无困难？", psqiActivityOptions),
  ],
  customScoringKey: "psqi",
};
