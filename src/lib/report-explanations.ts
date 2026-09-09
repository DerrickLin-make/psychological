import { rangeBandKey } from "@/data/scales/common";
import type { ScaleDefinition } from "@/data/scales";
import type {
  CustomScaleResult,
  MbtiScaleResult,
  ProfileScaleResult,
  ScaleResult,
  Scl90ScaleResult,
  SumScaleResult,
} from "@/lib/scoring";
import { reportExplanations } from "@/data/report-explanations";
import type {
  ExplanationBand,
  ExplanationSource,
  FactorExplanation,
  ProfileExplanation,
  ProfileValueExplanation,
  ReportExplanation,
  ResolvedFactorExplanation,
  ResolvedProfileExplanation,
  ScaleExplanation,
} from "@/data/report-explanations";

const scl90BandKeys: Record<string, string> = {
  阴性: "negative",
  轻度阳性: "mild",
  中度阳性: "moderate",
  偏重阳性: "elevated",
  重度阳性: "severe",
};

function getScaleExplanation(scale: ScaleDefinition): ScaleExplanation {
  const explanation = reportExplanations[scale.slug];
  if (!explanation) {
    throw new Error(`Scale "${scale.slug}" is missing a report explanation entry.`);
  }
  return explanation;
}

function findFactor(explanation: ScaleExplanation, key: string, scale: ScaleDefinition) {
  const factor = explanation.factors[key];
  if (!factor) {
    throw new Error(`Scale "${scale.slug}" is missing explanation factor "${key}".`);
  }
  return factor;
}

function resolveBand(factor: FactorExplanation, bandKey: string, scale: ScaleDefinition): ExplanationBand {
  const band = factor.bands[bandKey];
  if (!band) {
    throw new Error(`Scale "${scale.slug}" factor "${factor.key}" is missing band "${bandKey}".`);
  }
  return band;
}

function resolvedFactor(
  factor: FactorExplanation,
  band: ExplanationBand,
  score: number | undefined,
  maxScore: number | undefined,
  title: string,
  level: string,
): ResolvedFactorExplanation {
  return {
    key: factor.key,
    title,
    ...(score === undefined ? {} : { score }),
    ...(maxScore === undefined ? {} : { maxScore }),
    level,
    mode: band.mode,
    construct: factor.construct,
    interpretation: band.interpretation,
    manifestations: band.manifestations,
    impact: band.impact,
    recommendations: band.recommendations,
    ...(band.riskNotice ? { riskNotice: band.riskNotice } : {}),
  };
}

function resolvedProfile(
  profile: ProfileExplanation,
  value: ProfileValueExplanation,
  key: string,
  title: string,
): ResolvedProfileExplanation {
  return {
    key,
    title,
    value: value.label,
    construct: profile.construct,
    interpretation: value.interpretation,
    manifestations: value.manifestations,
    impact: value.impact,
    recommendations: value.recommendations,
    ...(value.riskNotice ? { riskNotice: value.riskNotice } : {}),
  };
}

function dedupe(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function dedupeSources(sources: ExplanationSource[]) {
  const seen = new Set<string>();
  return sources.filter((item) => {
    if (seen.has(item.citation)) return false;
    seen.add(item.citation);
    return true;
  });
}

function bandKeyFromRange(band: { min: number; max: number; bandKey?: string }) {
  return band.bandKey ?? rangeBandKey(band.min, band.max);
}

function resolveSum(
  scale: ScaleDefinition,
  result: SumScaleResult,
  explanation: ScaleExplanation,
): ResolvedFactorExplanation[] {
  const factor = findFactor(explanation, "total", scale);
  const band = resolveBand(factor, bandKeyFromRange(result.band), scale);
  return [resolvedFactor(factor, band, result.totalScore, result.maxScore, factor.name, result.band.label)];
}

function resolveProfile(
  scale: ScaleDefinition,
  result: ProfileScaleResult,
  explanation: ScaleExplanation,
): ResolvedFactorExplanation[] {
  return result.dimensions.map((dimension) => {
    const factor = findFactor(explanation, dimension.key, scale);
    const bandKey = "continuous" in factor.bands
      ? "continuous"
      : bandKeyFromRange(dimension.band);
    const band = resolveBand(factor, bandKey, scale);
    const configuredDimension = scale.dimensions?.find((item) => item.key === dimension.key);
    const maxScore = configuredDimension
      ? Math.max(...configuredDimension.bands.map((item) => item.max))
      : dimension.band.max;
    return resolvedFactor(factor, band, dimension.score, maxScore, dimension.name, factor.bands.continuous ? band.label : dimension.band.label);
  });
}

function isScl90Result(result: CustomScaleResult | Scl90ScaleResult): result is Scl90ScaleResult {
  return "instrument" in result && result.instrument === "scl90";
}

function resolveScl90(
  scale: ScaleDefinition,
  result: Scl90ScaleResult,
  explanation: ScaleExplanation,
): ResolvedFactorExplanation[] {
  return result.sections.map((section) => {
    const factor = findFactor(explanation, section.key, scale);
    const band = resolveBand(factor, scl90BandKeys[section.level] ?? section.level, scale);
    return resolvedFactor(factor, band, section.score, section.maxScore, section.label, section.level);
  });
}

function resolveCustom(
  scale: ScaleDefinition,
  result: CustomScaleResult,
  explanation: ScaleExplanation,
): ResolvedFactorExplanation[] {
  if (isScl90Result(result)) return resolveScl90(scale, result, explanation);

  return result.sections.flatMap((section) => {
    if (section.key === "network") return [];
    const factor = findFactor(explanation, section.key, scale);
    const bandKey = factor.bands.continuous ? "continuous" : `score-${section.score}`;
    const band = resolveBand(factor, bandKey, scale);
    return [resolvedFactor(factor, band, section.score, section.maxScore, factor.name, band.label)];
  });
}

function resolveMbti(
  scale: ScaleDefinition,
  result: MbtiScaleResult,
  explanation: ScaleExplanation,
): { factors: ResolvedFactorExplanation[]; profiles: ResolvedProfileExplanation[] } {
  const axisProfile = explanation.profiles?.axes;
  const typeProfile = explanation.profiles?.type;
  if (!axisProfile || !typeProfile) {
    throw new Error(`Scale "${scale.slug}" is missing MBTI profile explanations.`);
  }

  const factors = result.pairs.map((pair) => {
    const key = `${pair.left}${pair.right}`;
    const factor = findFactor(explanation, key, scale);
    const band = resolveBand(factor, `winner-${pair.winner}`, scale);
    const score = pair.winner === pair.left ? pair.leftScore : pair.rightScore;
    return resolvedFactor(factor, band, score, pair.leftScore + pair.rightScore, factor.name, band.label);
  });

  const profiles = result.pairs.map((pair) => {
    const key = `${pair.left}${pair.right}`;
    const value = axisProfile.values[pair.winner];
    if (!value) throw new Error(`Scale "${scale.slug}" is missing MBTI axis profile "${pair.winner}".`);
    return resolvedProfile(axisProfile, value, `axis-${key}`, `${axisProfile.name} · ${key}`);
  });
  const typeValue = typeProfile.values[result.typeCode];
  if (!typeValue) throw new Error(`Scale "${scale.slug}" is missing MBTI type profile "${result.typeCode}".`);
  profiles.push(resolvedProfile(typeProfile, typeValue, "type", `${typeProfile.name} · ${result.typeCode}`));

  return { factors, profiles };
}

function resolveAasProfile(
  scale: ScaleDefinition,
  result: CustomScaleResult,
  explanation: ScaleExplanation,
): ResolvedProfileExplanation[] {
  const profile = explanation.profiles?.["attachment-type"];
  if (!profile) throw new Error(`Scale "${scale.slug}" is missing attachment type explanations.`);

  const composite = result.sections.find((section) => section.key === "composite")?.score ?? 0;
  const anxiety = result.sections.find((section) => section.key === "anxiety")?.score ?? 0;
  const key = composite === 3 || anxiety === 3
    ? "boundary"
    : composite > 3
      ? anxiety < 3 ? "secure" : "preoccupied"
      : anxiety < 3 ? "dismissing" : "fearful";
  const value = profile.values[key];
  if (!value) throw new Error(`Scale "${scale.slug}" is missing attachment type profile "${key}".`);
  return [resolvedProfile(profile, value, "attachment-type", profile.name)];
}

function resolveSpecialProfiles(
  scale: ScaleDefinition,
  result: ScaleResult,
  explanation: ScaleExplanation,
): ResolvedProfileExplanation[] {
  if (scale.slug === "aas-r" && result.kind === "custom") return resolveAasProfile(scale, result, explanation);
  return [];
}

export function resolveReportExplanations(scale: ScaleDefinition, result: ScaleResult): ReportExplanation {
  const explanation = getScaleExplanation(scale);
  if (result.kind === "mbti") {
    const resolved = resolveMbti(scale, result, explanation);
    return buildReportExplanation(explanation, result, resolved.factors, resolved.profiles);
  }

  const factors = result.kind === "sum"
    ? resolveSum(scale, result, explanation)
    : result.kind === "profile"
      ? resolveProfile(scale, result, explanation)
      : resolveCustom(scale, result, explanation);
  const profiles = resolveSpecialProfiles(scale, result, explanation);
  return buildReportExplanation(explanation, result, factors, profiles);
}

function buildReportExplanation(
  explanation: ScaleExplanation,
  result: ScaleResult,
  factors: ResolvedFactorExplanation[],
  profiles: ResolvedProfileExplanation[],
): ReportExplanation {
  const factorDefinitions = factors.map((factor) => explanation.factors[factor.key]).filter(Boolean);
  const profileDefinitions = profiles
    .map((profile) => Object.values(explanation.profiles ?? {}).find((item) => item.name === profile.title.split(" · ")[0]))
    .filter((profile): profile is ProfileExplanation => Boolean(profile));
  const recommendations = dedupe([
    ...explanation.overall.recommendations,
    ...factors.flatMap((factor) => factor.recommendations),
    ...profiles.flatMap((profile) => profile.recommendations),
  ]);
  const riskNotices = dedupe([
    ...(explanation.overall.riskNotice ? [explanation.overall.riskNotice] : []),
    ...factors.flatMap((factor) => factor.riskNotice ? [factor.riskNotice] : []),
    ...profiles.flatMap((profile) => profile.riskNotice ? [profile.riskNotice] : []),
    ...("notices" in result && result.notices ? result.notices : []),
  ]);
  const limitations = dedupe([
    ...explanation.limitations,
    ...factorDefinitions.flatMap((factor) => factor.limitations),
    ...profileDefinitions.flatMap((profile) => profile.limitations),
  ]);
  const sources = dedupeSources([
    ...explanation.sources,
    ...factorDefinitions.flatMap((factor) => factor.sources),
    ...profileDefinitions.flatMap((profile) => profile.sources),
  ]);

  return {
    overallSummary: explanation.overall.summary,
    factors,
    profiles,
    recommendations,
    riskNotices,
    limitations,
    sources,
    version: explanation.version,
    translationStatus: explanation.translationStatus,
  };
}
