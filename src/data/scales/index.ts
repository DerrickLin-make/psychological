import { aasScale } from "./aas-r";
import { bdiScale } from "./bdi";
import { evidenceBasedScales } from "./evidence-scales";
import { epdsScale } from "./epds";
import { fadScale } from "./fad";
import { mbtiScale } from "./mbti";
import { maritalAdjustmentScale } from "./marital-adjustment";
import { neoFfiScale } from "./neo-ffi";
import { pcl5Scale } from "./pcl5";
import { psqiScale } from "./psqi";
import { sasScale } from "./sas";
import { scl90Scale } from "./scl90";
import { sdsScale } from "./sds";

export * from "./types";
export { scaleTemplate } from "./template";

export const scales = [
  aasScale,
  pcl5Scale,
  psqiScale,
  mbtiScale,
  neoFfiScale,
  maritalAdjustmentScale,
  fadScale,
  sdsScale,
  sasScale,
  epdsScale,
  scl90Scale,
  bdiScale,
  ...evidenceBasedScales,
];

export function getScaleBySlug(slug: string) {
  return scales.find((scale) => scale.slug === slug);
}
