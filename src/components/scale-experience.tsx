"use client";

import Link from "next/link";
import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import type { MbtiQuestion, ScaleAnswer, ScaleDefinition, ScaleQuestion } from "@/data/scales";
import { scoreScale, type ScaleResult } from "@/lib/scoring";

type ScaleExperienceProps = {
  scale: ScaleDefinition;
};

type AnswerState = Array<ScaleAnswer | null>;

function questionCount(scale: ScaleDefinition) {
  return scale.kind === "mbti" ? (scale.mbtiQuestions?.length ?? 0) : scale.questions.length;
}

function getQuestion(scale: ScaleDefinition, index: number): ScaleQuestion | MbtiQuestion {
  if (scale.kind === "mbti") {
    const question = scale.mbtiQuestions?.[index];
    if (!question) throw new Error("MBTI question is missing.");
    return question;
  }
  const question = scale.questions[index];
  if (!question) throw new Error("Scale question is missing.");
  return question;
}

function isMbtiQuestion(question: ScaleQuestion | MbtiQuestion): question is MbtiQuestion {
  return "optionA" in question;
}

function resultLabel(result: ScaleResult) {
  if (result.kind === "sum") return result.band.label;
  if (result.kind === "mbti") return `${result.typeCode} · ${result.typeProfile.nickname}`;
  if (result.kind === "custom") return result.label;
  return result.temperament?.label ?? "人格维度画像";
}

function ResultSummary({ result }: { result: ScaleResult }) {
  if (result.kind === "sum") {
    return (
      <>
        <p className="text-5xl font-semibold tracking-tight text-[#23170e]">{result.totalScore}</p>
        <p className="mt-2 text-sm text-[#6a5540]">满分 {result.maxScore} 分</p>
        {result.rawScore !== undefined ? (
          <p className="mt-1 text-sm text-[#6a5540]">原始总分 {result.rawScore} 分，已换算为标准分。</p>
        ) : null}
        <p className="mt-5 text-base font-semibold text-[#4d3a28]">{result.band.emphasis}</p>
        <p className="mt-2 text-sm leading-7 text-[#6a5540]">{result.band.summary}</p>
        <p className="mt-3 text-sm leading-7 text-[#6a5540]">建议：{result.band.recommendation}</p>
        {result.notices?.map((notice) => (
          <p key={notice} className="mt-4 rounded-2xl border border-[#c98976] bg-[#fff1ed] p-4 text-sm font-semibold leading-7 text-[#8f3f31]">
            {notice}
          </p>
        ))}
      </>
    );
  }

  if (result.kind === "mbti") {
    return (
      <>
        <p className="text-5xl font-semibold tracking-tight text-[#23170e]">{result.typeCode}</p>
        <p className="mt-3 text-xl font-semibold text-[#4d3a28]">{result.typeProfile.nickname}</p>
        <p className="mt-4 text-sm leading-7 text-[#6a5540]">{result.typeProfile.summary}</p>
        <p className="mt-3 text-sm leading-7 text-[#6a5540]">{result.typeProfile.detailedDescription}</p>
        <p className="mt-4 text-sm leading-7 text-[#6a5540]">
          适合职业参考：{result.typeProfile.suitableCareers || "暂无具体职业列表。"}
        </p>
      </>
    );
  }

  if (result.kind === "profile") {
    return (
      <>
        <p className="text-5xl font-semibold tracking-tight text-[#23170e]">{result.temperament?.label ?? "维度画像"}</p>
        <p className="mt-4 text-sm leading-7 text-[#6a5540]">{result.overview}</p>
      </>
    );
  }

  return (
    <>
      <p className="text-5xl font-semibold tracking-tight text-[#23170e]">{result.totalScore}</p>
      <p className="mt-2 text-sm text-[#6a5540]">满分 {result.maxScore} 分</p>
      <p className="mt-4 text-base font-semibold text-[#4d3a28]">{result.summary}</p>
    </>
  );
}

function ResultDetails({ result }: { result: ScaleResult }) {
  if (result.kind === "mbti") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {result.pairs.map((pair) => (
          <div key={`${pair.left}-${pair.right}`} className="rounded-2xl border border-[#d8ccb8] bg-white/55 p-4">
            <div className="flex items-center justify-between text-sm font-semibold text-[#4d3a28]">
              <span>{pair.left} {pair.leftScore}</span>
              <span>{pair.right} {pair.rightScore}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8ded0]">
              <div
                className="h-full rounded-full bg-[#8f6c48]"
                style={{ width: `${Math.max(8, (Math.max(pair.leftScore, pair.rightScore) / (pair.leftScore + pair.rightScore || 1)) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[#6a5540]">倾向：{pair.winner}</p>
          </div>
        ))}
      </div>
    );
  }

  if (result.kind === "profile") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {result.dimensions.map((dimension) => (
          <div key={dimension.key} className="rounded-2xl border border-[#d8ccb8] bg-white/55 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-[#4d3a28]">{dimension.name}</p>
                <p className="mt-1 text-xs text-[#6a5540]">{dimension.band.label}</p>
              </div>
              <p className="text-xl font-semibold text-[#8f6c48]">{dimension.score}</p>
            </div>
            {dimension.description ? <p className="mt-3 text-sm leading-6 text-[#6a5540]">{dimension.description}</p> : null}
            <p className="mt-3 text-xs leading-5 text-[#6a5540]">{dimension.band.summary}</p>
          </div>
        ))}
      </div>
    );
  }

  if (result.kind === "custom") {
    return (
      <>
        {result.metrics?.length ? (
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {result.metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-[#d8ccb8] bg-white/55 p-4">
                <p className="text-xs text-[#6a5540]">{metric.label}</p>
                <p className="mt-2 text-xl font-semibold text-[#4d3a28]">{metric.value}</p>
              </div>
            ))}
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          {result.sections.map((section) => (
            <div key={section.key} className="rounded-2xl border border-[#d8ccb8] bg-white/55 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-[#4d3a28]">{section.label}</p>
                <p className="text-xl font-semibold text-[#8f6c48]">{section.score}</p>
              </div>
              {section.maxScore !== undefined ? <p className="mt-1 text-xs text-[#6a5540]">满分 {section.maxScore}</p> : null}
              {section.summary ? <p className="mt-2 text-xs leading-5 text-[#6a5540]">{section.summary}</p> : null}
            </div>
          ))}
        </div>
      </>
    );
  }

  return null;
}

export function ScaleExperience({ scale }: ScaleExperienceProps) {
  const totalQuestions = questionCount(scale);
  const [stage, setStage] = useState<"intro" | "question" | "result">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>(() => Array.from({ length: totalQuestions }, () => null));
  const [result, setResult] = useState<ScaleResult | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    setStage("intro");
    setCurrentIndex(0);
    setAnswers(Array.from({ length: totalQuestions }, () => null));
    setResult(null);
    setError("");
    setSaveMessage("");
  };

  const finish = (nextAnswers: AnswerState) => {
    try {
      setResult(scoreScale(scale, nextAnswers as ScaleAnswer[]));
      setError("");
      setStage("result");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "计分失败，请检查答案。" );
    }
  };

  const choose = (value: ScaleAnswer) => {
    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = value;
    setAnswers(nextAnswers);
    if (currentIndex === totalQuestions - 1) {
      finish(nextAnswers);
      return;
    }
    setCurrentIndex((index) => index + 1);
  };

  const continueInput = () => {
    const value = answers[currentIndex];
    if (value === null || value === "") {
      setError("请先完成当前题目。");
      return;
    }
    if (currentIndex === totalQuestions - 1) finish(answers);
    else {
      setError("");
      setCurrentIndex((index) => index + 1);
    }
  };

  const goBack = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((index) => index - 1);
    setError("");
  };

  const jumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    setError("");
  };

  const updateTextAnswer = (value: string) => {
    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = value;
    setAnswers(nextAnswers);
    setError("");
  };

  async function saveReport() {
    if (!reportRef.current) return;
    setIsSaving(true);
    setSaveMessage("");
    try {
      const dataUrl = await toPng(reportRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `${scale.shortTitle}-测评结果.png`;
      link.href = dataUrl;
      link.click();
      setSaveMessage("结果图片已生成，可以保存到本地。" );
    } catch {
      setSaveMessage("保存图片失败，请尝试截图保存。" );
    } finally {
      setIsSaving(false);
    }
  }

  if (stage === "intro") {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />
        <section className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-5 py-10 sm:px-8">
          <div className="glass-panel w-full rounded-[36px] p-7 sm:p-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] text-[#7b6246] uppercase">MindScope / Scales</p>
                <p className="mt-3 text-sm text-[#6a5540]">{scale.category}</p>
              </div>
              <Link href="/scales" className="secondary-button">返回量表列表</Link>
            </div>
            <h1 className="mt-10 max-w-3xl font-serif text-4xl leading-tight text-[#23170e] sm:text-6xl">{scale.title}</h1>
            <p className="mt-5 text-lg leading-8 text-[#5d4a36]">{scale.subtitle}</p>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#6a5540]">{scale.summary}</p>
            <div className="mt-8 rounded-2xl border border-[#d8ccb8] bg-white/45 p-5 text-sm leading-7 text-[#6a5540]">
              <p>{scale.intro}</p>
              <p className="mt-2">预计用时约 {scale.estimatedMinutes} 分钟，共 {totalQuestions} 题。</p>
              <p className="mt-2">本测评仅供自我筛查和自我觉察参考，不能替代专业诊断。</p>
            </div>
            <button type="button" className="primary-button mt-8" onClick={() => setStage("question")}>开始测试</button>
          </div>
        </section>
      </main>
    );
  }

  if (stage === "question") {
    const question = getQuestion(scale, currentIndex);
    const answer = answers[currentIndex];
    const options = isMbtiQuestion(question) ? [] : (question.options ?? scale.options);
    const inputType = isMbtiQuestion(question) ? "choice" : (question.inputType ?? "choice");

    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />
        <section className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
          <header className="flex items-center justify-between gap-4">
            <Link href="/scales" className="text-sm font-semibold text-[#6a5540]">退出测试</Link>
            <div className="flex items-center gap-3">
              <button type="button" className="secondary-button px-4 py-2 text-sm" onClick={goBack} disabled={currentIndex === 0}>上一题</button>
              <span className="text-sm text-[#6a5540]">{currentIndex + 1} / {totalQuestions}</span>
            </div>
          </header>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e8ded0]">
            <div className="h-full rounded-full bg-[#8f6c48] transition-all" style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }} />
          </div>
          <div className="mt-4 hidden justify-start gap-1 overflow-x-auto pb-1 lg:flex" aria-label="题目导航">
            {Array.from({ length: totalQuestions }, (_, index) => (
              <button
                key={`question-${index + 1}`}
                type="button"
                className={`h-8 min-w-8 rounded-lg px-2 text-left text-xs font-semibold ${index === currentIndex ? "bg-[#2e2217] text-[#f7efe3]" : answers[index] !== null ? "bg-[#9f7b52] text-white" : "bg-white/70 text-[#6b5a44]"}`}
                onClick={() => jumpToQuestion(index)}
                aria-label={`跳转到第 ${index + 1} 题`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="question-card glass-panel mt-8 rounded-[32px] p-6 sm:p-10">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#876a4a] uppercase">{scale.shortTitle}</p>
            <h1 className="mt-5 text-2xl font-semibold leading-9 text-[#23170e] sm:text-3xl">{question.text}</h1>

            {isMbtiQuestion(question) ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[{ value: 0, label: "A", text: question.optionA }, { value: 1, label: "B", text: question.optionB }].map((option) => (
                  <button key={option.label} type="button" className="secondary-button min-h-28 flex-col items-start gap-2 rounded-2xl p-5 text-left" onClick={() => choose(option.value)}>
                    <span className="text-xs font-bold tracking-[0.2em] text-[#8f6c48]">{option.label}</span>
                    <span className="text-base leading-7 text-[#4d3a28]">{option.text}</span>
                  </button>
                ))}
              </div>
            ) : inputType === "choice" ? (
              <div className="mt-8 grid gap-3">
                {options.map((option) => (
                  <button key={`${question.id}-${option.value}`} type="button" className="secondary-button min-h-16 justify-start gap-4 rounded-2xl px-5 text-left" onClick={() => choose(option.value)}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ede2d2] text-sm font-semibold text-[#8f6c48]">{option.label}</span>
                    <span className="text-sm leading-6 text-[#4d3a28]">{option.detail}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-8">
                <input
                  type={inputType === "time" ? "time" : "text"}
                  value={typeof answer === "string" ? answer : ""}
                  placeholder={question.placeholder}
                  onChange={(event) => updateTextAnswer(event.target.value)}
                  className="w-full rounded-2xl border border-[#d8ccb8] bg-white/70 px-5 py-4 text-lg text-[#4d3a28] outline-none focus:border-[#8f6c48]"
                />
                <p className="mt-3 text-xs text-[#6a5540]">{inputType === "duration" ? "请填写 H:MM，例如 7:30。" : "请填写有效的时间。"}</p>
                <button type="button" className="primary-button mt-6" onClick={continueInput}>继续</button>
              </div>
            )}
            {error ? <p className="mt-5 text-sm text-[#9b493c]">{error}</p> : null}
          </div>
        </section>
      </main>
    );
  }

  if (!result) return null;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <section className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <header className="flex items-center justify-between gap-4">
          <Link href="/scales" className="text-sm font-semibold text-[#6a5540]">返回量表列表</Link>
          <button type="button" className="secondary-button" onClick={reset}>重新测试</button>
        </header>
        <div ref={reportRef} className="report-surface mt-8 rounded-[36px] border border-[#d8ccb8] p-6 sm:p-10">
          <p className="text-xs font-semibold tracking-[0.24em] text-[#7b6246] uppercase">{scale.shortTitle} / Result</p>
          <h1 className="mt-5 font-serif text-4xl leading-tight text-[#23170e]">{scale.title}</h1>
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-3xl bg-white/55 p-6">
              <p className="text-sm font-semibold text-[#8f6c48]">结果提示</p>
              <p className="mt-4 text-2xl font-semibold leading-9 text-[#4d3a28]">{resultLabel(result)}</p>
              <div className="mt-6"><ResultSummary result={result} /></div>
            </div>
            <div className="rounded-3xl bg-white/40 p-6">
              <p className="text-sm font-semibold text-[#8f6c48]">维度与计分详情</p>
              <div className="mt-5"><ResultDetails result={result} /></div>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-[#d8ccb8] bg-white/40 p-5 text-sm leading-7 text-[#6a5540]">
            <p className="font-semibold text-[#4d3a28]">计分说明</p>
            <p className="mt-2">{scale.scoringNote}</p>
            <p className="mt-2">本结果仅用于自我筛查和自我觉察参考，不能替代专业心理咨询、临床诊断或医疗建议。</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="primary-button" onClick={saveReport} disabled={isSaving}>{isSaving ? "生成中…" : "保存结果图片"}</button>
          <button type="button" className="secondary-button" onClick={reset}>再测一次</button>
        </div>
        {saveMessage ? <p className="mt-3 text-sm text-[#5d4a36]">{saveMessage}</p> : null}
      </section>
    </main>
  );
}
