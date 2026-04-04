import Link from "next/link";
import { scales } from "@/data/scales";

export default function ScalesPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />

      <section className="mx-auto w-full max-w-7xl px-5 pb-14 pt-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-[#7b6246] uppercase">MindScope</p>
            <p className="mt-2 text-sm text-[#6a5540]">选择一份量表，进入独立测评页面</p>
          </div>
          <Link href="/" className="secondary-button">
            返回首页
          </Link>
        </header>

        <div className="mt-10 glass-panel rounded-[36px] p-7 sm:p-10">
          <p className="text-xs font-semibold tracking-[0.24em] text-[#876a4a] uppercase">量表列表</p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-[#23170e] sm:text-6xl">
            咨询师可直接转发的
            <span className="mt-2 block text-[#8f6c48]">独立测评入口</span>
          </h1>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {scales.map((scale) => (
              <article key={scale.slug} className="rounded-[30px] border border-[#d8ccb8] bg-white/78 p-6 shadow-[0_18px_50px_rgba(72,49,25,0.06)]">
                <div className="flex items-center justify-between gap-4">
                  <span className="badge">{scale.category}</span>
                  <span className="text-sm text-[#765f45]">{scale.questions.length} 题</span>
                </div>
                <h2 className="mt-5 font-serif text-3xl text-[#23170e]">{scale.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#5d4935]">{scale.subtitle}</p>
                <p className="mt-5 text-sm leading-7 text-[#564330]">{scale.summary}</p>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <span className="text-sm text-[#7a6145]">约 {scale.estimatedMinutes} 分钟完成</span>
                  <Link href={`/scales/${scale.slug}`} className="primary-button">
                    开始测评
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
