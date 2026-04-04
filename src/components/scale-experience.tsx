"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ScaleDefinition } from "@/data/scales";
import { scoreScale, type ScaleResult } from "@/lib/scoring";

type ScaleExperienceProps = {
  scale: ScaleDefinition;
};

export function ScaleExperience({ scale }: ScaleExperienceProps) {
  const [stage, setStage] = useState<"intro" | "question" | "result">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>(
    () => Array.from({ length: scale.questions.length }, () => null),
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [result, setResult] = useState<ScaleResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stage, currentIndex]);

  const answeredCount = answers.filter((answer) => answer !== null).length;
  const progress = Math.round((answeredCount / scale.questions.length) * 100);
  const currentQuestion = scale.questions[currentIndex];
  const currentAnswer = answers[currentIndex];

  function resetFlow() {
    setStage("intro");
    setCurrentIndex(0);
    setAnswers(Array.from({ length: scale.questions.length }, () => null));
    setResult(null);
    setSaveMessage("");
    setIsTransitioning(false);
  }

  function startAssessment() {
    setStage("question");
    setCurrentIndex(0);
    setSaveMessage("");
  }

  function goBack() {
    if (currentIndex === 0 || isTransitioning) {
      return;
    }

    setCurrentIndex((previous) => previous - 1);
    setSaveMessage("");
  }

  function selectAnswer(value: number) {
    if (isTransitioning) {
      return;
    }

    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = value;
    setAnswers(nextAnswers);
    setIsTransitioning(true);
    setSaveMessage("");

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      const isLastQuestion = currentIndex === scale.questions.length - 1;

      if (isLastQuestion) {
        const completedAnswers = nextAnswers.map((answer) => {
          if (answer === null) {
            throw new Error("Encountered incomplete answer set.");
          }

          return answer;
        });

        setResult(scoreScale(scale, completedAnswers));
        setStage("result");
      } else {
        setCurrentIndex((previous) => previous + 1);
      }

      setIsTransitioning(false);
    }, 220);
  }

  async function saveReport() {
    if (!reportRef.current) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage("");
      const htmlToImage = await import("html-to-image");
      const renderOptions = {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#f5efe5",
      };

      let dataUrl: string;
      try {
        dataUrl = await htmlToImage.toPng(reportRef.current, renderOptions);
      } catch {
        dataUrl = await htmlToImage.toJpeg(reportRef.current, { ...renderOptions, quality: 0.92 });
      }

      const link = document.createElement("a");
      link.download = `${scale.slug}-report.png`;
      link.href = dataUrl;
      link.click();
      setSaveMessage("报告长图已生成，可直接保存到相册。");
    } catch {
      setSaveMessage("长图生成失败，请稍后重试或使用系统截图保存。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-14 pt-6 sm:px-8 lg:px-10">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-[0.22em] text-[#6c5a43] uppercase">
          MindScope
        </Link>
        <Link
          href="/scales"
          className="rounded-full border border-[#c5b79e] px-4 py-2 text-sm text-[#5e4a33] transition hover:border-[#8e7557] hover:text-[#2d2418]"
        >
          返回量表主页
        </Link>
      </header>

      {stage === "intro" ? (
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="glass-panel overflow-hidden rounded-[32px] p-7 sm:p-9">
            <div className="flex flex-wrap gap-3">
              <span className="badge">{scale.category}</span>
              <span className="badge">{scale.questions.length} 题</span>
              <span className="badge">约 {scale.estimatedMinutes} 分钟</span>
            </div>
            <h1 className="mt-6 font-serif text-4xl leading-tight text-[#20160d] sm:text-5xl">{scale.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#4a3a2a] sm:text-lg">{scale.summary}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-white/70 p-5">
                <p className="text-xs font-semibold tracking-[0.22em] text-[#876c4b] uppercase">指导语</p>
                <p className="mt-3 text-sm leading-7 text-[#3f3224]">{scale.intro}</p>
              </div>
              <div className="rounded-[24px] bg-[#241b15] p-5 text-[#f7efe4]">
                <p className="text-xs font-semibold tracking-[0.22em] text-[#dcbf8d] uppercase">计分说明</p>
                <p className="mt-3 text-sm leading-7 text-[#f3e7d8]">{scale.scoringNote}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={startAssessment} className="primary-button">
                开始测评
              </button>
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="glass-panel rounded-[28px] p-6">
              <p className="text-xs font-semibold tracking-[0.22em] text-[#876c4b] uppercase">体验方式</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[#4d3e2d]">
                <li>单页单题，点击选项后自动平滑跳转到下一题。</li>
                <li>支持返回上一题修改答案，整个过程无需注册或登录。</li>
                <li>所有题目、计分与结果都在浏览器本地完成，即开即走。</li>
              </ul>
            </div>
            <div className="glass-panel rounded-[28px] p-6">
              <p className="text-xs font-semibold tracking-[0.22em] text-[#876c4b] uppercase">适用场景</p>
              <p className="mt-4 text-sm leading-7 text-[#4d3e2d]">
                咨询师可将本量表链接直接发给来访者。来访者完成后可立即查看结论，并将报告长图保存到手机相册。
              </p>
            </div>
            <div className="glass-panel rounded-[28px] p-6">
              <p className="text-xs font-semibold tracking-[0.22em] text-[#876c4b] uppercase">提醒</p>
              <p className="mt-4 text-sm leading-7 text-[#4d3e2d]">
                本页面演示的是纯前端测评流程。若用于正式机构服务，建议由专业人员复核题库与阈值配置。
              </p>
            </div>
          </aside>
        </section>
      ) : null}

      {stage === "question" ? (
        <section className="mx-auto w-full max-w-3xl">
          <div className="glass-panel rounded-[30px] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-[#876c4b] uppercase">{scale.shortTitle}</p>
                <h2 className="mt-2 font-serif text-3xl text-[#24180d]">
                  第 {currentIndex + 1} / {scale.questions.length} 题
                </h2>
              </div>
              <button
                onClick={goBack}
                disabled={currentIndex === 0 || isTransitioning}
                className="rounded-full border border-[#ccbda4] px-4 py-2 text-sm text-[#5b4832] transition enabled:hover:border-[#8d7558] enabled:hover:text-[#2d2418] disabled:cursor-not-allowed disabled:opacity-45"
              >
                上一题
              </button>
            </div>

            <div
              className="mt-6 h-2 overflow-hidden rounded-full bg-white/70"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`答题进度 ${progress}%`}
            >
              <div
                className="h-full rounded-full bg-[#9f7b52] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className={`question-card mt-7 rounded-[28px] bg-[#fffaf2] p-6 sm:p-8 ${isTransitioning ? "opacity-70" : ""}`}>
              <p className="text-xs font-semibold tracking-[0.22em] text-[#92714f] uppercase">当前题目</p>
              <p className="mt-4 text-2xl leading-10 text-[#271c12] sm:text-[2rem]">{currentQuestion.text}</p>
            </div>

            <div className="mt-5 grid gap-3">
              {scale.options.map((option) => {
                const isSelected = currentAnswer === option.value;

                return (
                  <button
                    key={`${currentQuestion.id}-${option.value}`}
                    onClick={() => selectAnswer(option.value)}
                    disabled={isTransitioning}
                    aria-pressed={isSelected}
                    className={`rounded-[24px] border px-5 py-4 text-left transition duration-300 ${
                      isSelected
                        ? "border-[#8d6c47] bg-[#2e2217] text-[#f7efe3]"
                        : "border-[#d8ccb8] bg-white/80 text-[#332619] hover:-translate-y-0.5 hover:border-[#9e7b55] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-lg font-semibold">{option.label}</span>
                      <span className="text-xs tracking-[0.18em] uppercase opacity-70">分值 {option.value}</span>
                    </div>
                    <p className={`mt-2 text-sm leading-6 ${isSelected ? "text-[#eadfce]" : "text-[#68543d]"}`}>
                      {option.detail}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {stage === "result" && result ? (
        <section className="mx-auto w-full max-w-5xl">
          <div ref={reportRef} className="report-surface rounded-[34px] p-6 shadow-[0_30px_90px_rgba(63,38,17,0.16)] sm:p-9">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] text-[#8f6d4c] uppercase">即时测评报告</p>
                <h2 className="mt-3 font-serif text-4xl leading-tight text-[#23170e]">{scale.title}</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#56432f]">
                  本报告由浏览器本地即时生成，不上传任何答题记录。若要用于正式评估，请结合访谈和专业判断。
                </p>
              </div>
              <div className="rounded-[26px] bg-[#2b2017] px-5 py-4 text-[#f7efe4]">
                <p className="text-xs tracking-[0.2em] uppercase text-[#d7bf97]">完成情况</p>
                <p className="mt-2 text-3xl font-semibold">
                  {scale.questions.length} / {scale.questions.length}
                </p>
                <p className="mt-1 text-sm text-[#f1e4d4]">已全部作答</p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[28px] bg-[#f8efe2] p-6">
                <p className="text-xs font-semibold tracking-[0.2em] text-[#92714d] uppercase">核心结果</p>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#b08a60] via-[#8a6847] to-[#3a2c1f]"
                    style={{ width: `${Math.max(12, Math.round(result.normalized * 100))}%` }}
                  />
                </div>
                <div className="mt-5 flex items-end gap-3">
                  <p className="text-5xl font-semibold text-[#2f2115]">{result.totalScore}</p>
                  <p className="pb-2 text-sm text-[#6a553f]">/ {result.maxScore}</p>
                </div>

                {result.kind === "sum" ? (
                  <>
                    <p className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#5c4833]">
                      {result.band.label}
                    </p>
                    <p className="mt-4 text-base leading-8 text-[#423121]">{result.band.emphasis}</p>
                    <p className="mt-3 text-sm leading-7 text-[#5d4a36]">{result.band.summary}</p>
                    <p className="mt-5 rounded-[22px] bg-white px-4 py-4 text-sm leading-7 text-[#5d4935]">
                      建议：{result.band.recommendation}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#5c4833]">
                      多维人格画像
                    </p>
                    <p className="mt-4 text-sm leading-7 text-[#5d4935]">{result.overview}</p>
                  </>
                )}
              </div>

              <div className="grid gap-4">
                {result.kind === "profile"
                  ? result.dimensions.map((dimension) => (
                      <article key={dimension.key} className="rounded-[26px] bg-white/92 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold tracking-[0.2em] text-[#8e6d4d] uppercase">{dimension.name}</p>
                            <p className="mt-2 text-sm leading-7 text-[#5b4733]">{dimension.description}</p>
                          </div>
                          <div className="rounded-2xl bg-[#2a2017] px-4 py-3 text-right text-[#f7efe3]">
                            <p className="text-2xl font-semibold">{dimension.score}</p>
                            <p className="text-xs tracking-[0.16em] uppercase text-[#d4bc95]">7 分制</p>
                          </div>
                        </div>
                        <div className="mt-4 rounded-[20px] bg-[#f7f0e5] px-4 py-3">
                          <p className="text-sm font-semibold text-[#473422]">{dimension.band.label}</p>
                          <p className="mt-2 text-sm leading-7 text-[#614d38]">{dimension.band.summary}</p>
                        </div>
                      </article>
                    ))
                  : (
                      <>
                        <article className="rounded-[26px] bg-white/92 p-5">
                          <p className="text-xs font-semibold tracking-[0.2em] text-[#8e6d4d] uppercase">结果解读</p>
                          <p className="mt-3 text-base leading-8 text-[#3c2d20]">{result.band.summary}</p>
                        </article>
                        <article className="rounded-[26px] bg-white/92 p-5">
                          <p className="text-xs font-semibold tracking-[0.2em] text-[#8e6d4d] uppercase">机构使用提示</p>
                          <p className="mt-3 text-sm leading-7 text-[#5a4734]">
                            咨询师可将该结论作为首次访谈前的快速预判，不替代临床诊断，也不替代面对面风险评估。
                          </p>
                        </article>
                        <article className="rounded-[26px] bg-white/92 p-5">
                          <p className="text-xs font-semibold tracking-[0.2em] text-[#8e6d4d] uppercase">隐私承诺</p>
                          <p className="mt-3 text-sm leading-7 text-[#5a4734]">
                            本系统不创建账号、不写入数据库，来访者关闭页面后答题记录不会留存在平台侧。
                          </p>
                        </article>
                      </>
                    )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button onClick={saveReport} disabled={isSaving} className="primary-button">
              {isSaving ? "正在生成长图..." : "生成长图保存"}
            </button>
            <button onClick={resetFlow} className="secondary-button">
              重新作答
            </button>
            <Link href="/scales" className="secondary-button">
              返回首页
            </Link>
          </div>
          {saveMessage ? <p className="mt-3 text-sm text-[#5d4a36]">{saveMessage}</p> : null}
        </section>
      ) : null}
    </div>
  );
}
