import { anxietyCheckinScale } from "./anxiety-checkin";
import { depressionCheckinScale } from "./depression-checkin";
import { mbtiScale } from "./mbti";
import { personalityProfileScale } from "./personality-profile";
import { temperamentScale } from "./temperament";

export * from "./types";
export { scaleTemplate } from "./template";

export const scales = [depressionCheckinScale, anxietyCheckinScale, personalityProfileScale, temperamentScale, mbtiScale];

export function getScaleBySlug(slug: string) {
  return scales.find((scale) => scale.slug === slug);
}
