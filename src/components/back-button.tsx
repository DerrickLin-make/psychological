"use client";

import { ArrowLeft } from "lucide-react";
import { Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  fallbackHref?: string;
  onBeforeNavigate?: () => boolean;
};

export function BackButton({ fallbackHref = "/", onBeforeNavigate }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBeforeNavigate && !onBeforeNavigate()) return;
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

export function HomeButton({ onBeforeNavigate }: Pick<BackButtonProps, "onBeforeNavigate"> = {}) {
  return (
    <Link
      href="/"
      className="secondary-button home-button"
      aria-label="返回首页"
      onClick={(event) => {
        if (onBeforeNavigate && !onBeforeNavigate()) event.preventDefault();
      }}
    >
      <Home aria-hidden="true" size={16} strokeWidth={2} />
      <span>返回首页</span>
    </Link>
  );
}
