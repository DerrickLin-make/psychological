import Link from "next/link";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />

      <section className="mx-auto w-full max-w-7xl px-5 pb-16 pt-6 sm:px-8 lg:px-10">
        <header>
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-[#7b6246] uppercase">MindScope</p>
            <p className="mt-2 text-sm text-[#6a5540]">面向心理咨询机构的零维护在线测评前端</p>
          </div>
        </header>

        <div className="mt-10">
          <div className="glass-panel rounded-[36px] p-7 sm:p-10">
            <h1 className="mt-2 max-w-4xl font-serif text-5xl leading-[1.05] text-[#23170e] sm:text-6xl">
              为心理咨询机构打造一套
              <span className="mt-2 block text-[#8f6c48]">即开即测、即测即出结果</span>
              的轻量级量表系统
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#4f3e2e] sm:text-lg">
              面向抑郁、焦虑、人格等高频测评场景，来访者通过微信或手机浏览器打开专属链接即可完成作答，全部结果在本机浏览器即时计算，不采集、不存储敏感答题记录。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/scales" className="primary-button">
                查看全部量表
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[26px] bg-white/78 p-5">
                <p className="text-xs font-semibold tracking-[0.18em] text-[#896c4f] uppercase">使用角色</p>
                <p className="mt-3 text-sm leading-7 text-[#54412f]">来访者在线作答，咨询师直接发链接，全程无需安装 App。</p>
              </div>
              <div className="rounded-[26px] bg-[#261c15] p-5 text-[#f4eadf]">
                <p className="text-xs font-semibold tracking-[0.18em] text-[#d6be95] uppercase">交互体验</p>
                <p className="mt-3 text-sm leading-7 text-[#f1e4d3]">移动端优先的单页单题体验，减少滚动负担，答题节奏更清晰。</p>
              </div>
              <div className="rounded-[26px] bg-white/78 p-5">
                <p className="text-xs font-semibold tracking-[0.18em] text-[#896c4f] uppercase">结果呈现</p>
                <p className="mt-3 text-sm leading-7 text-[#54412f]">即时显示区间结论或多维画像，并支持长图保存。</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
