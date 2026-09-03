"use client";

import type { RefObject } from "react";
import type { ScaleDefinition } from "@/data/scales";
import { ClinicalReport, ReportSection, type ReportMetric } from "@/components/clinical-report";
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

function resultSummary(result: ScaleResult) {
  if (result.kind === "sum") {
    return `${result.band.emphasis} ${result.band.summary} 建议：${result.band.recommendation}`;
  }
  if (result.kind === "mbti") return result.typeProfile.summary;
  if (result.kind === "profile") return result.overview;
  return result.summary;
}

function reportMetrics(result: ScaleResult): ReportMetric[] {
  if (result.kind === "sum") {
    return [
      { label: "总分", value: result.totalScore, hint: `参考范围：${result.band.min} ～ ${result.band.max}` },
      { label: "标准化比例", value: `${Math.round(result.normalized * 100)}%`, hint: `满分：${result.maxScore}` },
      { label: "结果等级", value: result.band.label, hint: "依据本量表参考区间" },
    ];
  }

  if (result.kind === "mbti") {
    return [
      { label: "类型代码", value: result.typeCode, hint: result.typeProfile.nickname },
      { label: "偏好维度", value: result.pairs.filter((pair) => pair.leftScore !== pair.rightScore).length, hint: "存在明显偏好的维度" },
      { label: "题目数量", value: result.totalScore, hint: "本次有效作答" },
    ];
  }

  if (result.kind === "profile") {
    const strongest = [...result.dimensions].sort((left, right) => right.score - left.score)[0];
    return [
      { label: "题目合计", value: formatScore(result.totalScore), hint: "仅用于记录，不作整体等级解释" },
      { label: "最高维度", value: strongest?.name ?? "未形成", hint: strongest ? `得分：${formatScore(strongest.score)}` : "" },
      { label: "维度数量", value: result.dimensions.length, hint: "已完成分析" },
    ];
  }

  return [
    { label: "总分", value: formatScore(result.totalScore), hint: `满分：${result.maxScore}` },
    { label: "结果等级", value: result.label, hint: "依据本量表计分规则" },
    { label: "分析分项", value: result.sections.length, hint: result.metrics?.[0] ? `${result.metrics[0].label}：${result.metrics[0].value}` : "已完成分析" },
  ];
}

function ScoreBars({ result }: { result: ScaleResult }) {
  if (result.kind === "sum") {
    return (
      <div className="report-meter-chart">
        <div className="report-meter-labels"><span>0</span><span>{result.maxScore}</span></div>
        <div className="report-meter-track">
          <span className="report-meter-fill" style={{ width: `${Math.max(2, result.normalized * 100)}%` }} />
        </div>
        <div className="report-meter-value"><strong>{formatScore(result.totalScore)}</strong><span>{result.band.label}</span></div>
      </div>
    );
  }

  if (result.kind === "mbti") {
    return (
      <div className="report-preference-chart">
        {result.pairs.map((pair) => {
          const total = pair.leftScore + pair.rightScore || 1;
          return (
            <div className="report-preference-row" key={`${pair.left}-${pair.right}`}>
              <div className="report-preference-labels"><span>{pair.left} {pair.leftScore}</span><span>{pair.right} {pair.rightScore}</span></div>
              <div className="report-preference-track">
                <span className="report-preference-left" style={{ width: `${(pair.leftScore / total) * 100}%` }} />
                <span className="report-preference-right" style={{ width: `${(pair.rightScore / total) * 100}%` }} />
              </div>
              <small>倾向：{pair.winner}</small>
            </div>
          );
        })}
      </div>
    );
  }

  const items = result.kind === "profile"
    ? result.dimensions.map((dimension) => ({ label: dimension.name, value: dimension.score, max: Math.max(dimension.score, dimension.band.max, 1) }))
    : result.sections.map((section) => ({ label: section.label, value: section.score, max: section.maxScore ?? Math.max(section.score, 1) }));

  return (
    <div className="report-bars">
      {items.map((item) => (
        <div className="report-bar-item" key={item.label}>
          <div className="report-bar-topline"><span>{item.label}</span><strong>{formatScore(item.value)}</strong></div>
          <div className="report-bar-track"><span style={{ width: `${Math.min(100, Math.max(3, (item.value / (item.max || 1)) * 100))}%` }} /></div>
        </div>
      ))}
    </div>
  );
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

function AnalysisTable({ analysis }: { analysis: ScaleAnalysis }) {
  return (
    <div className="table-scroll">
      <table className="report-table report-analysis-table">
        <thead><tr><th>分析维度</th><th>水平</th><th>详细说明</th></tr></thead>
        <tbody>
          {analysis.dimensionAnalyses.map((dimension) => (
            <tr key={dimension.key}>
              <th>{dimension.title}</th>
              <td><strong>{dimension.level}</strong></td>
              <td>{dimension.explanation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnalysisList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="report-analysis-copy report-analysis-list">
      <strong>{title}</strong>
      {items.length > 0 ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>暂无补充说明。</p>}
    </div>
  );
}

export function ScaleReport({ scale, result, completedAt, elapsedSeconds, reportRef, onDownload }: ScaleReportProps) {
  const analysis: ScaleAnalysis = buildFallbackScaleAnalysis(scale, result);

  return (
    <ClinicalReport
      scaleSlug={scale.slug}
      category={scale.category}
      title={scale.title}
      questionCount={scale.mbtiQuestions?.length ?? scale.questions.length}
      resultLabel={resultLabel(scale, result)}
      resultSummary={resultSummary(result)}
      metrics={reportMetrics(result)}
      completedAt={completedAt}
      elapsedSeconds={elapsedSeconds}
      reportRef={reportRef}
      onDownload={onDownload}
    >
      <div className="report-two-column">
        <ReportSection title="结果趋势" eyebrow="分数分布">
          <ScoreBars result={result} />
        </ReportSection>
        <ReportSection title="测评得分" eyebrow="数据明细">
          <ScoreTable result={result} />
        </ReportSection>
      </div>

      <div className="report-lower-grid">
        <ReportSection title="报告分析" eyebrow="本地分析">
          <p className="report-analysis-summary">{analysis.overallSummary}</p>
          <AnalysisTable analysis={analysis} />
        </ReportSection>

        <div className="report-lower-side">
          <ReportSection title="综合建议" eyebrow="行动参考">
            <div className="report-recommendations">
              {analysis.recommendations.map((recommendation, index) => (
                <p key={recommendation}><strong>{index + 1}</strong>{recommendation}</p>
              ))}
            </div>
          </ReportSection>

          <ReportSection title="优势与关注" eyebrow="重点提示">
            <AnalysisList title="可以利用的优势" items={analysis.strengths} />
            <AnalysisList title="建议留意的变化" items={analysis.watchPoints} />
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
          <p>本结果仅用于自我筛查和自我觉察参考，不能替代专业心理咨询、临床诊断或医疗建议。</p>
        </div>
      </ReportSection>
    </ClinicalReport>
  );
}
