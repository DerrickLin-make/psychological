import type { ScaleDefinition } from "./types";

export const scaleTemplate: ScaleDefinition = {
  slug: "your-scale-slug",
  title: "量表全名",
  shortTitle: "量表简称",
  subtitle: "50 题 / 总分或多维度",
  category: "量表分类",
  summary: "这里填写量表简介，用于列表页展示。",
  intro: "这里填写答题前指导语。",
  estimatedMinutes: 8,
  scoringNote: "这里填写计分说明。",
  kind: "sum",
  options: [
    { label: "从不", detail: "过去一段时间没有出现", value: 0 },
    { label: "偶尔", detail: "偶尔出现", value: 1 },
    { label: "经常", detail: "比较常见", value: 2 },
    { label: "持续", detail: "几乎一直存在", value: 3 },
  ],
  questions: [
    { id: "your-scale-1", text: "这里填写第 1 题题干。" },
    { id: "your-scale-2", text: "这里填写第 2 题题干。", reverse: true },
  ],
  bands: [
    {
      min: 0,
      max: 10,
      label: "结果标签",
      emphasis: "一句高层级判断。",
      summary: "这里填写结果摘要。",
      recommendation: "这里填写建议语。",
    },
  ],
};
