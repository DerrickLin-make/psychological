"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  fallbackHref?: string;
};

export function BackButton({ fallbackHref = "/" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <button type="button" className="back-button" onClick={handleBack}>
      <ArrowLeft aria-hidden="true" size={16} strokeWidth={2} />
      <span>返回上一页</span>
    </button>
  );
}
