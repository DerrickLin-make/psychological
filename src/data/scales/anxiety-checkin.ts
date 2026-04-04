import type { ScaleDefinition } from "./types";
import { frequencyOptions } from "./presets";

export const anxietyCheckinScale: ScaleDefinition = {
  slug: "anxiety-checkin",
  title: "焦虑状态快速筛查",
  shortTitle: "焦虑筛查",
  subtitle: "7 题 / 即时总分 / 适合会谈前焦虑水平识别",
  category: "情绪量表",
  summary: "关注紧张、担忧、坐立不安与身体激活反应，适用于近期压力状态的快速判断。",
  intro: "请回想过去两周内的体验，选择最接近真实频率的答案。答题过程不会上传或保存。",
  estimatedMinutes: 2,
  scoringNote: "总分越高，说明近期焦虑激活和担忧程度越明显。",
  kind: "sum",
  options: frequencyOptions,
  questions: [
    { id: "anx-1", text: "总觉得紧绷、担心，有些事情很难真正放下。" },
    { id: "anx-2", text: "担忧像停不下来的循环，越想越多。" },
    { id: "anx-3", text: "会为不同的事情反复操心，难以收住念头。" },
    { id: "anx-4", text: "放松变得困难，即使停下来身体也还是绷着。" },
    { id: "anx-5", text: "坐立不安，需要不停看手机、走动或做点什么。" },
    { id: "anx-6", text: "容易烦躁、敏感，别人一句话也可能让我更紧张。" },
    { id: "anx-7", text: "仿佛总会出事，对未知情境有明显的不安全感。" },
  ],
  bands: [
    {
      min: 0,
      max: 4,
      label: "轻微或无明显焦虑",
      emphasis: "当前焦虑负荷较低。",
      summary: "近期担忧和身体紧张反应不突出，整体调节能力较稳定。",
      recommendation: "如正处于高压阶段，可保留这次结果作为后续对照基线。",
    },
    {
      min: 5,
      max: 9,
      label: "轻度焦虑",
      emphasis: "已出现可感知的担忧与紧绷。",
      summary: "焦虑反应开始影响专注、休息或情绪稳定，但仍有一定可控空间。",
      recommendation: "建议关注触发场景，并引导来访者记录焦虑高发时段。",
    },
    {
      min: 10,
      max: 14,
      label: "中度焦虑",
      emphasis: "焦虑体验较频繁，干扰范围扩大。",
      summary: "担忧、坐立不安或身体激活反应较明显，可能影响学习、工作与社交表现。",
      recommendation: "适合尽快进入系统评估，必要时配合呼吸放松或稳定化技术。",
    },
    {
      min: 15,
      max: 21,
      label: "重度焦虑",
      emphasis: "需要优先安排专业关注。",
      summary: "焦虑体验已处于高负荷区间，建议进一步识别是否伴随惊恐、回避或睡眠受损。",
      recommendation: "请尽快安排专业评估，并建立近期追踪机制。",
    },
  ],
};
