import Link from "next/link";

export default function Home() {
  return (
    <main className="home-page">
      <div className="home-container">
        <header className="home-topbar">
          <Link className="home-brand" href="/">
            <strong>MindScope</strong>
            <span>心理健康评估系统</span>
          </Link>
          <div className="topbar-actions">
            <Link href="/scales" className="secondary-button">查看量表</Link>
          </div>
        </header>

        <section className="home-hero">
          <div>
            <p className="page-eyebrow">专业、清晰、本地生成</p>
            <h1>
              面向心理咨询机构的
              <span>在线测评工作台</span>
            </h1>
            <p className="home-hero-copy">
              为抑郁、焦虑、人格与睡眠等常见测评场景提供轻量化在线入口。结果在本地生成，由客户主动保存或发送，不会上传答题记录。
            </p>
            <Link href="/scales" className="primary-button">开始选择量表</Link>
          </div>
          <aside className="home-hero-panel">
            <strong>面向客户的测评体验</strong>
            <p>移动端优先的单题作答流程，完成后即时生成统一格式的专业报告，便于保存、打印和后续沟通。</p>
          </aside>
        </section>

        <section className="home-features" aria-label="产品特点">
          <div className="home-feature">
            <strong>低门槛访问</strong>
            <p>无需安装 App，打开链接即可完成测评。</p>
          </div>
          <div className="home-feature">
            <strong>即时结果</strong>
            <p>答案在本地完成计分，完成后立即查看结果。</p>
          </div>
          <div className="home-feature">
            <strong>统一报告</strong>
            <p>不同量表使用同一套清晰的临床报告视觉和信息层级。</p>
          </div>
        </section>

      </div>
    </main>
  );
}
