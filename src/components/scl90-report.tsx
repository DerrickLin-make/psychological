"use client";

import type { RefObject } from "react";
import { ClinicalReport, ReportSection } from "@/components/clinical-report";
import { ReportExplanationList, ReportSourceNotes } from "@/components/report-explanations";
import { getScl90Conclusion, type Scl90Profile } from "@/lib/scl90-report";
import type { ScaleAnswer, ScaleDefinition } from "@/data/scales";
import type { Scl90ScaleResult } from "@/lib/scoring";
import { buildFallbackScaleAnalysis, type ScaleAnalysis } from "@/lib/scale-analysis";

type Scl90ReportProps = {
  scale: ScaleDefinition;
  result: Scl90ScaleResult;
  answers: ScaleAnswer[];
  profile: Scl90Profile;
  completedAt: number | null;
  elapsedSeconds: number | null;
  reportRef: RefObject<HTMLDivElement | null>;
  onDownload: () => void;
};

function chartPoints(result: Scl90ScaleResult) {
  const width = 760;
  const height = 250;
  const padding = { top: 22, right: 24, bottom: 44, left: 42 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const x = (index: number) => padding.left + (innerWidth / Math.max(result.sections.length - 1, 1)) * index;
  const y = (score: number) => padding.top + innerHeight - ((score - 1) / 4) * innerHeight;

  return {
    width,
    height,
    padding,
    points: result.sections.map((section, index) => `${x(index)},${y(section.score)}`).join(" "),
    dots: result.sections.map((section, index) => ({ x: x(index), y: y(section.score), section })),
    horizontalLines: [1, 2, 3, 4, 5].map((value) => ({ value, y: y(value) })),
  };
}

function ScoreChart({ result }: { result: Scl90ScaleResult }) {
  const chart = chartPoints(result);

  return (
    <div className="report-chart-wrap" aria-label="SCL-90 十个维度平均分折线图">
      <svg viewBox={`0 0 ${chart.width} ${chart.height}`} role="img">
        {chart.horizontalLines.map((line) => (
          <g key={line.value}>
            <line x1={chart.padding.left} x2={chart.width - chart.padding.right} y1={line.y} y2={line.y} className="report-chart-grid" />
            <text x={chart.padding.left - 12} y={line.y + 4} textAnchor="end" className="report-chart-label">{line.value}</text>
          </g>
        ))}
        <polyline points={chart.points} className="report-chart-line" />
        {chart.dots.map(({ x, y, section }) => (
          <g key={section.key}>
            <circle cx={x} cy={y} r="5" className="report-chart-dot" />
            <text x={x} y={chart.height - 14} textAnchor="middle" className="report-chart-label">{section.label}</text>
          </g>
        ))}
      </svg>
      <div className="report-chart-legend">
        <span><i className="report-legend-line" /> 因子均分</span>
        <span><i className="report-legend-reference" /> 参考均分 2.00</span>
      </div>
    </div>
  );
}

function ScoreTable({ result }: { result: Scl90ScaleResult }) {
  return (
    <div className="table-scroll">
      <table className="report-table">
        <thead><tr><th>指标</th><th>得分</th><th>均分</th><th>得分范围</th></tr></thead>
        <tbody>
          <tr><th>总分</th><td>{result.totalScore}</td><td>{result.overallMean.toFixed(2)}</td><td>0 ～ 450</td></tr>
          <tr><th>阳性项目数</th><td>{result.positiveCount}</td><td>—</td><td>0 ～ 90</td></tr>
          <tr><th>阴性项目数</th><td>{result.negativeCount}</td><td>—</td><td>0 ～ 90</td></tr>
          <tr><th>阳性症状均分</th><td>—</td><td>{result.positiveMean.toFixed(2)}</td><td>1 ～ 5</td></tr>
          {result.sections.map((section) => (
            <tr key={section.key}>
              <th>{section.label}</th>
              <td>{section.rawScore}</td>
              <td>{section.score.toFixed(2)}</td>
              <td>1 ～ 5</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Scl90Report({
  scale,
  result,
  answers,
  profile,
  completedAt,
  elapsedSeconds,
  reportRef,
  onDownload,
}: Scl90ReportProps) {
  const analysis: ScaleAnalysis = buildFallbackScaleAnalysis(scale, result);
  const conclusion = getScl90Conclusion(result.overallMean);

  return (
    <ClinicalReport
      scaleSlug="scl-90"
      category="症状自评量表"
      title="症状自评量表（SCL-90）"
      questionCount={answers.length}
      resultLabel={conclusion}
      resultSummary={`总分 ${result.totalScore}，总体症状指数（总均分）为 ${result.overallMean.toFixed(2)}，阳性项目 ${result.positiveCount} 项，阴性项目 ${result.negativeCount} 项。`}
      metrics={[
        { label: "总分", value: result.totalScore, hint: "参考范围：0 ～ 450" },
        { label: "阳性项目数", value: result.positiveCount, hint: "参考范围：0 ～ 90" },
        { label: "阴性项目数", value: result.negativeCount, hint: "参考范围：0 ～ 90" },
      ]}
      profileItems={profile.age ? [{ label: "年龄", value: profile.age }] : []}
      completedAt={completedAt}
      elapsedSeconds={elapsedSeconds}
      reportRef={reportRef}
      onDownload={onDownload}
    >
      <div className="report-two-column">
        <ReportSection title="十因子症状分图（SCL-90）" eyebrow="因子均分">
          <ScoreChart result={result} />
        </ReportSection>
        <ReportSection title="测评得分" eyebrow="数据明细">
          <ScoreTable result={result} />
        </ReportSection>
      </div>

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
