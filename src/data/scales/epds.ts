import type { ScaleDefinition } from "./types";
import { q, sumBands } from "./common";

const epdsOptions = (items: string[]) => items.map((detail, value) => ({ label: String(value), detail, value }));

export const epdsScale: ScaleDefinition = {
  slug: "epds",
  title: "爱丁堡产后抑郁量表（EPDS）",
  shortTitle: "EPDS",
  subtitle: "10 题 / 过去 7 天 / 产后情绪筛查",
  category: "产后情绪",
  summary: "请选择最接近您在过去7天内感受的答案。总分为0-30分，得分越高提示抑郁症状越严重。",
  intro: "请选择最接近您在过去7天内感受的答案。总分为0-30分，得分越高提示抑郁症状越严重。",
  estimatedMinutes: 5,
  scoringNote: "每题为0-3分制（第1、2题为反向计分），请选择最符合自己过去7天感受的选项。",
  kind: "sum",
  options: epdsOptions(["","","",""]),
  questions: [
  q("epds-1", "我能看到事物有趣的一面，并笑的开心", epdsOptions(["同以前一样", "没有以前那么多", "肯定比以前少", "完全不能"]), true),
  q("epds-2", "我欣然期待未来的一切", epdsOptions(["同以前一样", "没有以前那么多", "肯定比以前少", "完全不能"]), true),
  q("epds-3", "当事情出错时，我会不必要地责备自己", epdsOptions(["没有这样", "不经常这样", "有时会这样", "大部分时候会这样"]), false),
  q("epds-4", "我无缘无故感到焦虑和担心", epdsOptions(["一点也没有", "极少这样", "有时候这样", "经常这样"]), false),
  q("epds-5", "我无缘无故感到害怕和惊慌", epdsOptions(["一点也没有", "不经常这样", "有时候这样", "相当多时候这样"]), false),
  q("epds-6", "很多事情冲着我来，使我透不过气", epdsOptions(["我一直像平时那样应付得好", "大部分时候我都能像平时那样应付得好", "有时候我不能像平时那样应付得好", "大多数时候我都不能应付"]), false),
  q("epds-7", "我很不开心，以至失眠", epdsOptions(["一点也没有", "不经常这样", "有时候这样", "大部分时间这样"]), false),
  q("epds-8", "我感到难过和悲伤", epdsOptions(["一点也没有", "不经常这样", "相当多时候这样", "大部分时候这样"]), false),
  q("epds-9", "我不开心到哭", epdsOptions(["一点也没有", "不经常这样", "有时候这样", "大部分时间这样"]), false),
  q("epds-10", "我想过要伤害自己", epdsOptions(["没有这样", "很少这样", "有时候这样", "相当多时候这样"]), false),
  ],
  bands: sumBands([
    [0, 8, "lower", "no clear depressive range", "The document describes 0-8 as no depression.", "Continue observing your emotional state."],
    [9, 12, "mild", "mild range", "The document describes 9-12 as mild depression.", "Consider discussing persistent symptoms with a professional."],
    [13, 30, "attention", "professional evaluation recommended", "The document recommends professional evaluation at 13 or above.", "Seek professional assessment."],
  ]),
};
