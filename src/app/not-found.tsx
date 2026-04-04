import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold tracking-[0.24em] text-[#8c6b4a] uppercase">404</p>
      <h1 className="mt-4 font-serif text-5xl text-[#23170e]">量表页面不存在</h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-[#56432f]">
        可能是链接已失效，或者该量表尚未发布。你可以回到首页重新选择可用量表。
      </p>
      <Link href="/" className="primary-button mt-8">
        返回首页
      </Link>
    </main>
  );
}
