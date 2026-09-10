"use client";

import type { RefObject } from "react";
import type { ScaleDefinition } from "@/data/scales";
import { ClinicalReport, ReportSection } from "@/components/clinical-report";
import { ReportDashboard } from "@/components/report-dashboard";
import { ReportExplanationList, ReportSourceNotes } from "@/components/report-explanations";
import { buildReportDashboard } from "@/lib/report-dashboard";
import type { ScaleResult } from "@/lib/scoring";
import { buildFallbackScaleAnalysis, type ScaleAnalysis } from "@/lib/scale-analysis";

type ScaleReportProps = {
  scale: ScaleDefinition;
  result: ScaleResult;
  completedAt: number | null;
  elapsedSeconds: number | null;
  reportRef: RefObject<HTMLDivElement | null>;
  onDownload: () => void;
};

function formatScore(score: number) {
  return Number.isInteger(score) ? String(score) : score.toFixed(2);
}

function resultLabel(scale: ScaleDefinition, result: ScaleResult) {
  if (result.kind === "sum") return result.band.label;
  if (result.kind === "mbti") return `${result.typeCode} · ${result.typeProfile.nickname}`;
  if (result.kind === "profile") return result.temperament?.label ?? `${scale.shortTitle}多维画像`;
  return result.label;
}

function ScoreTable({ result }: { result: ScaleResult }) {
  if (result.kind === "sum") {
    return (
      <div className="table-scroll">
        <table className="report-table">
          <thead><tr><th>指标</th><th>得分</th><th>参考范围</th><th>结果</th></tr></thead>
          <tbody>
            <tr><th>总分</th><td>{formatScore(result.totalScore)}</td><td>0 ～ {result.maxScore}</td><td>{result.band.label}</td></tr>
            {result.rawScore !== undefined ? <tr><th>原始总分</th><td>{formatScore(result.rawScore)}</td><td>原始计分</td><td>已标准化</td></tr> : null}
            <tr><th>标准化比例</th><td>{Math.round(result.normalized * 100)}%</td><td>0% ～ 100%</td><td>{result.band.emphasis}</td></tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (result.kind === "mbti") {
    return (
      <div className="table-scroll">
        <table className="report-table">
          <thead><tr><th>偏好维度</th><th>左侧得分</th><th>右侧得分</th><th>结果</th></tr></thead>
          <tbody>{result.pairs.map((pair) => <tr key={`${pair.left}-${pair.right}`}><th>{pair.left} / {pair.right}</th><td>{pair.leftScore}</td><td>{pair.rightScore}</td><td>{pair.winner}</td></tr>)}</tbody>
        </table>
      </div>
    );
  }

  if (result.kind === "profile") {
    return (
      <div className="table-scroll">
        <table className="report-table">
          <thead><tr><th>维度</th><th>得分</th><th>水平</th><th>解释</th></tr></thead>
          <tbody>{result.dimensions.map((dimension) => <tr key={dimension.key}><th>{dimension.name}</th><td>{formatScore(dimension.score)}</td><td>{dimension.band.label}</td><td>{dimension.band.summary}</td></tr>)}</tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="report-table">
        <thead><tr><th>指标</th><th>得分</th><th>满分</th><th>说明</th></tr></thead>
        <tbody>{result.sections.map((section) => <tr key={section.key}><th>{section.label}</th><td>{formatScore(section.score)}</td><td>{section.maxScore ?? "—"}</td><td>{section.summary ?? "依据本量表分项结果进行解释。"}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export function ScaleReport({ scale, result, completedAt, elapsedSeconds, reportRef, onDownload }: ScaleReportProps) {
  const analysis: ScaleAnalysis = buildFallbackScaleAnalysis(scale, result);
  const dashboard = buildReportDashboard(scale, result);

  return (
    <ClinicalReport
      scaleSlug={scale.slug}
      category={scale.category}
      title={scale.title}
      questionCount={scale.mbtiQuestions?.length ?? scale.questions.length}
      resultLabel={resultLabel(scale, result)}
      resultSummary={analysis.overallSummary}
      metrics={dashboard.metrics}
      completedAt={completedAt}
      elapsedSeconds={elapsedSeconds}
      reportRef={reportRef}
      onDownload={onDownload}
    >
      <ReportDashboard model={dashboard} summary={analysis.overallSummary} />

      <ReportSection title="测评得分" eyebrow="数据明细">
        <ScoreTable result={result} />
      </ReportSection>

      <div className="report-lower-grid">
        <ReportSection title="报告分析" eyebrow="本地分析">
          <p className="report-analysis-summary">{analysis.overallSummary}</p>
          <ReportExplanationList factors={analysis.dimensionAnalyses} profiles={analysis.profiles} />
        </ReportSection>

        <div className="report-lower-side">
          <ReportSection title="综合建议" eyebrow="行动参考">
            <div className="report-recommendations">
              {analysis.recommendations.map((recommendation, index) => (
                <p key={recommendation}><strong>{index + 1}</strong>{recommendation}</p>
              ))}
            </div>
          </ReportSection>

          <ReportSection title="安全提示" eyebrow="使用边界">
            <div className="report-closing-message">
              <p>{analysis.riskNotice}</p>
              {analysis.watchPoints.length > 0 ? (
                <ul className="report-watch-list">{analysis.watchPoints.map((item) => <li key={item}>{item}</li>)}</ul>
              ) : null}
            </div>
          </ReportSection>

          <ReportSection title="寄语" eyebrow="温馨提示">
            <div className="report-closing-message">
              <p>{analysis.closingMessage}</p>
              <p className="report-risk-notice">{analysis.riskNotice}</p>
            </div>
          </ReportSection>
        </div>
      </div>

      {analysis.notices.length > 0 ? (
        <ReportSection title="需要优先关注" eyebrow="安全提示">
          <div className="report-alert report-alert-danger">
            {analysis.notices.map((notice) => <p key={notice}>{notice}</p>)}
          </div>
        </ReportSection>
      ) : null}

      <ReportSection title="计分说明" eyebrow="使用提示">
        <div className="report-note">
          <p>{scale.scoringNote}</p>
          {scale.translationNote ? <p>{scale.translationNote}</p> : null}
          {scale.sourceNote ? <p>{scale.sourceNote}</p> : null}
          <ReportSourceNotes analysis={analysis} />
        </div>
      </ReportSection>
    </ClinicalReport>
  );
}
