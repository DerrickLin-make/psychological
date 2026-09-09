"use client";

import Link from "next/link";
import { toPng } from "html-to-image";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { BackButton, HomeButton } from "@/components/back-button";
import type { MbtiQuestion, ScaleAnswer, ScaleDefinition, ScaleQuestion } from "@/data/scales";
import { ScaleReport } from "@/components/scale-report";
import { Scl90Report } from "@/components/scl90-report";
import { clearAssessmentDraft, loadAssessmentDraft, saveAssessmentDraft } from "@/lib/assessment-draft";
import { scoreScale, type ScaleResult } from "@/lib/scoring";
import { isScl90Result, type Scl90Profile } from "@/lib/scl90-report";

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

function optionBadge(label: string, index: number) {
  return label.length === 1 ? label : String.fromCharCode(65 + index);
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
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  const [profile, setProfile] = useState<Scl90Profile>({});
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const isScl90 = scale.slug === "scl-90";

  useEffect(() => {
    const draft = loadAssessmentDraft(window.sessionStorage, scale.slug, totalQuestions);
    if (draft) {
      setAnswers(draft.answers);
      setCurrentIndex(draft.currentIndex);
      setStartedAt(draft.startedAt);
      setProfile(draft.profile);
      setStage("question");
      setDraftRestored(true);
    }
    setIsDraftReady(true);
  }, [scale.slug, totalQuestions]);

  useEffect(() => {
    if (!isDraftReady || stage !== "question" || startedAt === null) return;

    try {
      saveAssessmentDraft(window.sessionStorage, {
        scaleSlug: scale.slug,
        questionCount: totalQuestions,
        currentIndex,
        answers,
        startedAt,
        profile,
      });
    } catch {
      // Storage may be unavailable; the assessment can still continue in memory.
    }
  }, [answers, currentIndex, isDraftReady, profile, scale.slug, stage, startedAt, totalQuestions]);

  useEffect(() => {
    if (stage !== "question" || !answers.some((answer) => answer !== null && answer !== "")) return;

    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [answers, stage]);

  const clearDraft = () => {
    try {
      clearAssessmentDraft(window.sessionStorage, scale.slug);
    } catch {
      // Nothing else is required when browser storage is unavailable.
    }
  };

  const confirmLeave = () => window.confirm("答题尚未完成。离开后可在当前标签页恢复，确定离开吗？");

  const preventUnconfirmedLeave = (event: ReactMouseEvent<HTMLElement>) => {
    if (!confirmLeave()) event.preventDefault();
  };

  const reset = () => {
    clearDraft();
    setStage("intro");
    setCurrentIndex(0);
    setAnswers(Array.from({ length: totalQuestions }, () => null));
    setResult(null);
    setError("");
    setSaveMessage("");
    setStartedAt(null);
    setCompletedAt(null);
    setProfile({});
    setDraftRestored(false);
  };

  const finish = (nextAnswers: AnswerState) => {
    try {
      setResult(scoreScale(scale, nextAnswers as ScaleAnswer[]));
      clearDraft();
      setCompletedAt(Date.now());
      setError("");
      setStage("result");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "计分失败，请检查答案。");
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
      setSaveMessage("结果图片已生成，可以保存到本地。");
    } catch {
      setSaveMessage("保存图片失败，请尝试截图保存。");
    } finally {
      setIsSaving(false);
    }
  }

  if (stage === "intro") {
    return (
      <main className="experience-shell">
        <div className="experience-container">
          <header className="experience-topbar">
            <Link className="experience-brand" href="/">
              <strong>MindScope</strong>
              <span>心理健康评估系统</span>
            </Link>
            <div className="topbar-actions">
              <HomeButton />
              <BackButton fallbackHref="/scales" />
            </div>
          </header>

          <section className="intro-layout">
            <div className="intro-copy">
              <p className="page-eyebrow">{scale.category}</p>
              <h1>{scale.title}</h1>
              <p className="intro-subtitle">{scale.subtitle}</p>
              <p className="intro-summary">{scale.summary}</p>
              <button type="button" className="primary-button" onClick={() => { setStartedAt(Date.now()); setStage("question"); }}>
                开始测评
              </button>
            </div>

            <aside className="intro-info-panel">
              <div className="info-stat">
                <span>预计用时</span>
                <strong>{scale.estimatedMinutes} 分钟</strong>
              </div>
              <div className="info-stat">
                <span>题目数量</span>
                <strong>{totalQuestions} 题</strong>
              </div>
              <div className="intro-description">
                <p>{scale.intro}</p>
                <p>本测评仅供自我筛查和自我觉察参考，不能替代专业诊断。</p>
              </div>

              {isScl90 ? (
                <div className="profile-form">
                  <div className="profile-form-heading">
                    <strong>可选匿名信息</strong>
                    <span>用于让报告更完整，不填写也可以完成测评。</span>
                  </div>
                  <label>
                    <span>年龄段</span>
                    <select value={profile.age ?? ""} onChange={(event) => setProfile((current) => ({ ...current, age: event.target.value || undefined }))}>
                      <option value="">未填写</option>
                      <option value="18 岁以下">18 岁以下</option>
                      <option value="18–25 岁">18–25 岁</option>
                      <option value="26–35 岁">26–35 岁</option>
                      <option value="36–45 岁">36–45 岁</option>
                      <option value="46 岁及以上">46 岁及以上</option>
                    </select>
                  </label>
                  <label>
                    <span>性别</span>
                    <select value={profile.gender ?? ""} onChange={(event) => setProfile((current) => ({ ...current, gender: event.target.value || undefined }))}>
                      <option value="">未填写</option>
                      <option value="女">女</option>
                      <option value="男">男</option>
                      <option value="其他/不便说明">其他/不便说明</option>
                    </select>
                  </label>
                </div>
              ) : null}
            </aside>
          </section>

        </div>
      </main>
    );
  }

  if (stage === "question") {
    const question = getQuestion(scale, currentIndex);
    const answer = answers[currentIndex];
    const options = isMbtiQuestion(question) ? [] : (question.options ?? scale.options);
    const inputType = isMbtiQuestion(question) ? "choice" : (question.inputType ?? "choice");

    return (
      <main className="experience-shell">
        <div className="experience-container question-container">
          <header className="experience-topbar">
            <Link className="experience-brand" href="/scales" onClick={preventUnconfirmedLeave}>
              <strong>{scale.shortTitle}</strong>
              <span>在线测评</span>
            </Link>
            <div className="question-header-actions">
              <HomeButton onBeforeNavigate={confirmLeave} />
              <BackButton fallbackHref={`/scales/${scale.slug}`} onBeforeNavigate={confirmLeave} />
              <button type="button" className="secondary-button" onClick={goBack} disabled={currentIndex === 0}>上一题</button>
              <span>{currentIndex + 1} / {totalQuestions}</span>
            </div>
          </header>

          <div className="question-progress" aria-label="答题进度">
            <span style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }} />
          </div>

          <div className="question-layout">
            <aside className="question-rail">
              <p className="page-eyebrow">答题进度</p>
              <strong>{Math.round(((currentIndex + 1) / totalQuestions) * 100)}%</strong>
              <p>请根据最近一段时间的真实感受作答。</p>
              <p role="status">
                {draftRestored ? "已恢复当前标签页中的临时答题进度。" : null}
                进度仅临时保存在当前标签页；刷新后可继续。共享设备使用后请关闭标签页清除。
              </p>
              <Link href="/scales" className="text-link" onClick={preventUnconfirmedLeave}>退出测评</Link>
            </aside>

            <section className="question-card">
              <div className="question-card-heading">
                <span>第 {currentIndex + 1} 题</span>
                <span>{scale.shortTitle}</span>
              </div>
              <h1>{question.text}</h1>

              {isMbtiQuestion(question) ? (
                <div className="answer-grid answer-grid-two">
                  {[{ value: 0, label: "A", text: question.optionA }, { value: 1, label: "B", text: question.optionB }].map((option) => (
                    <button key={option.label} type="button" className="answer-option answer-option-large" onClick={() => choose(option.value)}>
                      <strong>{option.label}</strong>
                      <span>{option.text}</span>
                    </button>
                  ))}
                </div>
              ) : inputType === "choice" ? (
                <div className="answer-grid">
                  {options.map((option, index) => (
                    <button key={`${question.id}-${option.value}`} type="button" className="answer-option" onClick={() => choose(option.value)}>
                      <strong>{optionBadge(option.label, index)}</strong>
                      <span>{option.detail}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-answer">
                  <input
                    type={inputType === "time" ? "time" : "text"}
                    value={typeof answer === "string" ? answer : ""}
                    placeholder={question.placeholder}
                    onChange={(event) => updateTextAnswer(event.target.value)}
                  />
                  <p>{inputType === "duration" ? "请填写 H:MM，例如 7:30。" : "请输入有效内容。"}</p>
                  <button type="button" className="primary-button" onClick={continueInput}>继续</button>
                </div>
              )}
              {error ? <p className="form-error">{error}</p> : null}
            </section>
          </div>

          <div className="question-index" aria-label="题目导航">
            {Array.from({ length: totalQuestions }, (_, index) => (
              <button
                key={`question-${index + 1}`}
                type="button"
                className={index === currentIndex ? "is-current" : answers[index] !== null ? "is-answered" : ""}
                onClick={() => jumpToQuestion(index)}
                aria-label={`跳转到第 ${index + 1} 题`}
              >
                {index + 1}
              </button>
            ))}
          </div>

        </div>
      </main>
    );
  }

  if (!result) return null;

  const scl90Result = isScl90 && isScl90Result(result) ? result : null;
  const elapsedSeconds = startedAt && completedAt ? Math.round((completedAt - startedAt) / 1000) : null;

  return (
    <main className="report-page">
      <div className="report-page-container">
        {scl90Result ? (
          <Scl90Report
            scale={scale}
            result={scl90Result}
            answers={answers as ScaleAnswer[]}
            profile={profile}
            completedAt={completedAt}
            elapsedSeconds={elapsedSeconds}
            reportRef={reportRef}
            onDownload={saveReport}
          />
        ) : (
          <ScaleReport
            scale={scale}
            result={result}
            completedAt={completedAt}
            elapsedSeconds={elapsedSeconds}
            reportRef={reportRef}
            onDownload={saveReport}
          />
        )}
        <div className="report-page-actions">
          <button type="button" className="secondary-button" onClick={reset}>重新测试</button>
          {isSaving ? <span>报告生成中…</span> : null}
          {saveMessage ? <span>{saveMessage}</span> : null}
        </div>
      </div>
    </main>
  );
}
