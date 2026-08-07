"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { requestScl90Analysis } from "@/lib/scl90-analysis";
import {
  buildFallbackScl90Analysis,
  getScl90Conclusion,
  type Scl90Analysis,
  type Scl90Profile,
} from "@/lib/scl90-report";
import type { ScaleAnswer } from "@/data/scales";
import type { Scl90ScaleResult } from "@/lib/scoring";

type Scl90ReportProps = {
  result: Scl90ScaleResult;
  answers: ScaleAnswer[];
  profile: Scl90Profile;
  completedAt: number | null;
  elapsedSeconds: number | null;
  reportRef: RefObject<HTMLDivElement | null>;
};

function formatDate(timestamp: number | null) {
  if (!timestamp) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function formatElapsed(seconds: number | null) {
  if (!seconds || seconds < 1) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes > 0 ? `${minutes} 分 ${remainder} 秒` : `${remainder} 秒`;
}

function chartPoints(result: Scl90ScaleResult) {
  const width = 760;
  const height = 250;
  const padding = { top: 22, right: 24, bottom: 44, left: 42 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const x = (index: number) => padding.left + (innerWidth / Math.max(result.sections.length - 1, 1)) * index;
  const y = (score: number) => padding.top + innerHeight - (score / 4) * innerHeight;
  return {
    width,
    height,
    padding,
    points: result.sections.map((section, index) => `${x(index)},${y(section.score)}`).join(" "),
    dots: result.sections.map((section, index) => ({ x: x(index), y: y(section.score), section })),
    horizontalLines: [0, 1, 2, 3, 4].map((value) => ({ value, y: y(value) })),
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="scl90-section-title">
      <span>{children}</span>
    </div>
  );
}

function ScoreChart({ result }: { result: Scl90ScaleResult }) {
  const chart = chartPoints(result);
  return (
    <div className="scl90-chart-wrap" aria-label="SCL-90 十个维度平均分折线图">
      <svg viewBox={`0 0 ${chart.width} ${chart.height}`} role="img">
        {chart.horizontalLines.map((line) => (
          <g key={line.value}>
            <line x1={chart.padding.left} x2={chart.width - chart.padding.right} y1={line.y} y2={line.y} className="scl90-chart-grid" />
            <text x={chart.padding.left - 12} y={line.y + 4} textAnchor="end" className="scl90-chart-label">{line.value}</text>
          </g>
        ))}
        <polyline points={chart.points} className="scl90-chart-line" />
        {chart.dots.map(({ x, y, section }) => (
          <g key={section.key}>
            <circle cx={x} cy={y} r="5" className="scl90-chart-dot" />
            <text x={x} y={chart.height - 14} textAnchor="middle" className="scl90-chart-label">{section.key}</text>
          </g>
        ))}
      </svg>
      <div className="scl90-chart-legend">
        {result.sections.map((section) => <span key={section.key}>{section.key} {section.label}</span>)}
      </div>
    </div>
  );
}

function ProfileSummary({ profile }: { profile: Scl90Profile }) {
  return (
    <div className="scl90-profile-grid">
      <span>年龄段：{profile.age || "未填写"}</span>
      <span>性别：{profile.gender || "未填写"}</span>
      <span>报告类型：在线自评</span>
    </div>
  );
}

function ReportAnalysis({ analysis }: { analysis: Scl90Analysis }) {
  return (
    <>
      <p className="scl90-analysis-summary">{analysis.overallSummary}</p>
      <div className="scl90-analysis-table">
        <div className="scl90-analysis-row scl90-analysis-head">
          <span>指标</span>
          <span>等级</span>
          <span>说明</span>
        </div>
        {analysis.factorAnalyses.map((factor) => (
          <div className="scl90-analysis-row" key={factor.key}>
            <strong>{factor.title}</strong>
            <span className="scl90-level">{factor.level}</span>
            <p>{factor.explanation}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export function Scl90Report({
  result,
  answers,
  profile,
  completedAt,
  elapsedSeconds,
  reportRef,
}: Scl90ReportProps) {
  const [analysis, setAnalysis] = useState<Scl90Analysis>(() => buildFallbackScl90Analysis(result));
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [analysisError, setAnalysisError] = useState("");
  const [aiConsent, setAiConsent] = useState(true);
  const conclusion = getScl90Conclusion(result.overallMean);

  const generateAnalysis = useCallback(async () => {
    if (!aiConsent) {
      setAnalysisError("请先勾选同意发送测评数据，再生成 AI 分析。");
      return;
    }

    setAnalysisStatus("loading");
    setAnalysisError("");
    try {
      const nextAnalysis = await requestScl90Analysis({
        scale: "scl90",
        answers: answers.map((answer) => Number(answer)),
        result,
        profile,
      });
      setAnalysis(nextAnalysis);
      setAnalysisStatus("success");
    } catch (error) {
      setAnalysisStatus("error");
      setAnalysisError(error instanceof Error ? error.message : "AI 分析暂时不可用，请稍后重试。");
    }
  }, [aiConsent, answers, profile, result]);

  useEffect(() => {
    if (!aiConsent || analysisStatus !== "idle") return;
    const timer = window.setTimeout(() => void generateAnalysis(), 0);
    return () => window.clearTimeout(timer);
  }, [aiConsent, analysisStatus, generateAnalysis]);

  return (
    <>
      <div ref={reportRef} className="scl90-report">
        <header className="scl90-report-header">
          <div>
            <p className="scl90-brand">MindScope 心理测评</p>
            <p className="scl90-brand-subtitle">在线心理测评结果报告</p>
          </div>
          <div className="scl90-report-meta">
            <span>完成时间：{formatDate(completedAt)}</span>
            <span>作答用时：{formatElapsed(elapsedSeconds)}</span>
            <span>题目数量：90 题</span>
          </div>
        </header>

        <div className="scl90-report-heading">
          <p className="scl90-kicker">测评结果分析</p>
          <h1>症状自评量表（SCL-90）结果分析报告</h1>
          <ProfileSummary profile={profile} />
        </div>

        <section className="scl90-conclusion" aria-label="总体结论">
          <div>
            <p className="scl90-muted-label">测评结果</p>
            <p className="scl90-conclusion-label">{conclusion}</p>
            <p className="scl90-conclusion-text">本次测评总症状指数为 {result.overallMean.toFixed(2)}，阳性项目数为 {result.positiveCount}。</p>
          </div>
          <div className="scl90-conclusion-score">
            <span>总分</span>
            <strong>{result.totalScore}</strong>
            <small>/ {result.maxScore}</small>
          </div>
        </section>

        <section className="scl90-report-section">
          <SectionTitle>症状自评量表（SCL-90）维度图</SectionTitle>
          <ScoreChart result={result} />
        </section>

        <section className="scl90-report-section">
          <SectionTitle>测评得分</SectionTitle>
          <div className="scl90-score-table">
            <div className="scl90-score-row scl90-score-head">
              <span>指标</span><span>得分</span><span>参考范围</span><span>当前水平</span>
            </div>
            <div className="scl90-score-row"><strong>总症状指数</strong><span>{result.totalScore}</span><span>0–360</span><span>{conclusion}</span></div>
            <div className="scl90-score-row"><strong>阳性项目数</strong><span>{result.positiveCount}</span><span>0–90</span><span>项目数</span></div>
            <div className="scl90-score-row"><strong>阳性症状均分</strong><span>{result.positiveMean.toFixed(2)}</span><span>0–4</span><span>阳性项目平均分</span></div>
            {result.sections.map((section) => (
              <div className="scl90-score-row" key={section.key}>
                <strong>{section.key} {section.label}</strong>
                <span>{section.score.toFixed(2)}</span>
                <span>0–4</span>
                <span>{section.level}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="scl90-report-section">
          <SectionTitle>报告解析</SectionTitle>
          <ReportAnalysis analysis={analysis} />
        </section>

        <section className="scl90-report-section">
          <SectionTitle>综合建议</SectionTitle>
          <div className="scl90-recommendations">
            {analysis.recommendations.map((recommendation, index) => (
              <p key={recommendation}><strong>{index + 1}</strong>{recommendation}</p>
            ))}
          </div>
        </section>

        <section className="scl90-report-section scl90-message-section">
          <SectionTitle>寄语</SectionTitle>
          <p>{analysis.closingMessage}</p>
          <p className="scl90-risk-notice">{analysis.riskNotice}</p>
        </section>
      </div>

      <section className="scl90-ai-control" aria-label="AI 分析设置">
        <div>
          <p className="scl90-ai-title">DeepSeek AI 分析</p>
          <p className="scl90-ai-description">报告打开后会自动尝试生成 AI 解析。将发送 90 道题的作答选项、统计结果和可选匿名信息，数据不会在本网站保存。</p>
        </div>
        <label className="scl90-consent">
          <input type="checkbox" checked={aiConsent} onChange={(event) => setAiConsent(event.target.checked)} />
          <span>同意发送测评数据进行 AI 分析</span>
        </label>
        <button type="button" className="primary-button" onClick={generateAnalysis} disabled={analysisStatus === "loading"}>
          {analysisStatus === "loading" ? "分析生成中…" : analysisStatus === "success" ? "重新生成分析" : analysisStatus === "error" ? "重试 AI 分析" : "生成 AI 分析"}
        </button>
        {analysisStatus === "success" ? <p className="scl90-ai-success">AI 分析已更新到报告中。</p> : null}
        {analysisError ? <p className="scl90-ai-error">{analysisError} 当前报告仍保留本地基础解析，可稍后重试。</p> : null}
      </section>
    </>
  );
}
