import { anxietyCheckinScale } from "./anxiety-checkin";
import { depressionCheckinScale } from "./depression-checkin";
import { personalityProfileScale } from "./personality-profile";

export * from "./types";
export { scaleTemplate } from "./template";

export const scales = [depressionCheckinScale, anxietyCheckinScale, personalityProfileScale];

export function getScaleBySlug(slug: string) {
  return scales.find((scale) => scale.slug === slug);
}
