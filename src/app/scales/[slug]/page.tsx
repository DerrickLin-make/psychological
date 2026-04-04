import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScaleExperience } from "@/components/scale-experience";
import { getScaleBySlug, scales } from "@/data/scales";

type ScalePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return scales.map((scale) => ({ slug: scale.slug }));
}

export async function generateMetadata({ params }: ScalePageProps): Promise<Metadata> {
  const { slug } = await params;
  const scale = getScaleBySlug(slug);

  if (!scale) {
    return {
      title: "量表未找到",
    };
  }

  return {
    title: `${scale.title} | MindScope`,
    description: scale.summary,
  };
}

export default async function ScalePage({ params }: ScalePageProps) {
  const { slug } = await params;
  const scale = getScaleBySlug(slug);

  if (!scale) {
    notFound();
  }

  return <ScaleExperience scale={scale} />;
}
