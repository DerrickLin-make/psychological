export type ScaleOption = {
  label: string;
  detail: string;
  value: number;
};

export type ScaleBand = {
  min: number;
  max: number;
  label: string;
  emphasis: string;
  summary: string;
  recommendation: string;
};

export type DimensionBand = {
  min: number;
  max: number;
  label: string;
  summary: string;
};

export type ScaleDimension = {
  key: string;
  name: string;
  description: string;
  bands: DimensionBand[];
};

export type ScaleQuestion = {
  id: string;
  text: string;
  dimensionKey?: string;
  reverse?: boolean;
};

export type ScaleDefinition = {
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  category: string;
  summary: string;
  intro: string;
  estimatedMinutes: number;
  scoringNote: string;
  kind: "sum" | "profile";
  options: ScaleOption[];
  questions: ScaleQuestion[];
  bands?: ScaleBand[];
  dimensions?: ScaleDimension[];
};
