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
import { rangeBandKey } from "./common";
import type { DimensionBand, ScaleBand, ScaleDefinition } from "./types";

export * from "./types";
export { scaleTemplate } from "./template";

const registeredScales: ScaleDefinition[] = [
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

function withBandKeys<T extends ScaleBand | DimensionBand>(bands: T[]) {
  return bands.map((band) => ({
    ...band,
    bandKey: band.bandKey ?? rangeBandKey(band.min, band.max),
  }));
}

function normalizeScaleBands(scale: ScaleDefinition): ScaleDefinition {
  return {
    ...scale,
    ...(scale.bands ? { bands: withBandKeys(scale.bands) } : {}),
    ...(scale.dimensions
      ? { dimensions: scale.dimensions.map((dimension) => ({ ...dimension, bands: withBandKeys(dimension.bands) })) }
      : {}),
  };
}

export const scales = registeredScales.map(normalizeScaleBands);

export function getScaleBySlug(slug: string) {
  return scales.find((scale) => scale.slug === slug);
}
