import Link from "next/link";
import { BackButton } from "@/components/back-button";
import { scales } from "@/data/scales";

export default function ScalesPage() {
  return (
    <main className="listing-page">
      <div className="listing-container">
        <header className="listing-topbar">
          <Link className="listing-brand" href="/">
            <strong>MindScope</strong>
            <span>心理健康评估系统</span>
          </Link>
          <BackButton fallbackHref="/" />
        </header>

        <section className="listing-header">
          <p className="page-eyebrow">量表列表</p>
          <h1>
            选择适合当前场景的
            <span>独立测评入口</span>
          </h1>
          <p>每个量表都有独立的作答流程和统一的结果报告，可直接转发给来访者使用。</p>
        </section>

        <section className="scale-grid" aria-label="可用量表">
          {scales.map((scale) => (
            <article key={scale.slug} className="scale-card">
              <div className="scale-card-topline">
                <span className="scale-card-category">{scale.category}</span>
                <span className="scale-card-count">{scale.mbtiQuestions?.length ?? scale.questions.length} 题</span>
              </div>
              <h2>{scale.title}</h2>
              <p className="scale-card-subtitle">{scale.subtitle}</p>
              <p className="scale-card-summary">{scale.summary}</p>
              <div className="scale-card-footer">
                <span>约 {scale.estimatedMinutes} 分钟</span>
                <Link href={`/scales/${scale.slug}`} className="primary-button">开始测评</Link>
              </div>
            </article>
          ))}
        </section>

      </div>
    </main>
  );
}
