import type { ScaleOption } from "./types";

export const frequencyOptions: ScaleOption[] = [
  { label: "从不", detail: "过去两周几乎没有出现", value: 0 },
  { label: "偶尔", detail: "出现过几天", value: 1 },
  { label: "经常", detail: "一周里反复出现", value: 2 },
  { label: "持续", detail: "几乎每天都在发生", value: 3 },
];

export const agreementOptions: ScaleOption[] = [
  { label: "非常不符合", detail: "几乎完全不像我", value: 1 },
  { label: "比较不符合", detail: "偶尔会这样，但不稳定", value: 2 },
  { label: "稍微不符合", detail: "整体偏离我的常态", value: 3 },
  { label: "中立", detail: "不好判断或时有时无", value: 4 },
  { label: "稍微符合", detail: "在多数情境下比较像我", value: 5 },
  { label: "比较符合", detail: "通常能代表我的状态", value: 6 },
  { label: "非常符合", detail: "非常贴近我的稳定特质", value: 7 },
];
