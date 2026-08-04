import type { ScaleBand, ScaleOption } from "./types";

export const likert4: ScaleOption[] = [
  { label: "1", detail: "没有或很少", value: 1 },
  { label: "2", detail: "有时", value: 2 },
  { label: "3", detail: "大部分时间", value: 3 },
  { label: "4", detail: "绝大多数时间", value: 4 },
];

export const likert5: ScaleOption[] = [
  { label: "1", detail: "完全不符合", value: 1 },
  { label: "2", detail: "较不符合", value: 2 },
  { label: "3", detail: "不能确定", value: 3 },
  { label: "4", detail: "较符合", value: 4 },
  { label: "5", detail: "完全符合", value: 5 },
];

export const frequency4: ScaleOption[] = [
  { label: "没有或很少", detail: "几乎没有出现", value: 1 },
  { label: "有时", detail: "偶尔出现", value: 2 },
  { label: "大部分时间", detail: "经常出现", value: 3 },
  { label: "绝大多数时间", detail: "几乎一直出现", value: 4 },
];

export const sdsOptions: ScaleOption[] = [
  { label: "A", detail: "偶尔", value: 1 },
  { label: "B", detail: "有时", value: 2 },
  { label: "C", detail: "持续", value: 3 },
  { label: "D", detail: "经常", value: 4 },
];

export const sasOptions: ScaleOption[] = [
  { label: "1", detail: "没有或很少有", value: 1 },
  { label: "2", detail: "有时有", value: 2 },
  { label: "3", detail: "大部分时间有（经常有）", value: 3 },
  { label: "4", detail: "绝大多数时间有", value: 4 },
];

export const zeroToThree: ScaleOption[] = [
  { label: "0", detail: "没有", value: 0 },
  { label: "1", detail: "轻度", value: 1 },
  { label: "2", detail: "中度", value: 2 },
  { label: "3", detail: "重度", value: 3 },
];

export const severity5: ScaleOption[] = [
  { label: "1", detail: "无", value: 1 },
  { label: "2", detail: "轻度", value: 2 },
  { label: "3", detail: "中度", value: 3 },
  { label: "4", detail: "偏重", value: 4 },
  { label: "5", detail: "严重", value: 5 },
];

export const sumBands = (
  bands: Array<[number, number, string, string, string, string]>,
): ScaleBand[] => bands.map(([min, max, label, emphasis, summary, recommendation]) => ({
  min,
  max,
  label,
  emphasis,
  summary,
  recommendation,
}));

export function q(
  id: string,
  text: string,
  options?: ScaleOption[],
  reverse = false,
  extras?: {
    dimensionKey?: string;
    inputType?: "choice" | "time" | "duration" | "text";
    placeholder?: string;
  },
) {
  return {
    id,
    text,
    ...(options ? { options } : {}),
    ...(reverse ? { reverse: true } : {}),
    ...(extras ?? {}),
  };
}
