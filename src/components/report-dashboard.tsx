import type { ComponentType } from "react";
import {
  Activity,
  BrainCircuit,
  Eye,
  HeartPulse,
  MessageSquareText,
  Scale,
  ShieldCheck,
  Waves,
} from "lucide-react";
import type {
  DashboardDimension,
  DashboardGauge,
  ReportDashboardModel,
} from "@/lib/report-dashboard";

function formatScore(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function ScoreGauge({ gauge }: { gauge: DashboardGauge }) {
  const circumference = 2 * Math.PI * 72;
  const offset = circumference * (1 - gauge.normalized);

  return (
    <div className="dashboard-gauge" role="img" aria-label={`${gauge.label} ${formatScore(gauge.value)}，${gauge.rangeLabel}`}>
      <svg viewBox="0 0 220 220" aria-hidden="true">
        <circle className="dashboard-gauge-ticks" cx="110" cy="110" r="91" />
        <circle className="dashboard-gauge-track" cx="110" cy="110" r="72" />
        <circle
          className="dashboard-gauge-progress"
          cx="110"
          cy="110"
          r="72"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <circle className="dashboard-gauge-inner" cx="110" cy="110" r="55" />
      </svg>
      <div className="dashboard-gauge-copy">
        <strong>{formatScore(gauge.value)}</strong>
        <span>{gauge.label}</span>
        <small>{gauge.rangeLabel}</small>
      </div>
    </div>
  );
}

function radarPoint(index: number, count: number, radius: number, centerX = 220, centerY = 145) {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
  };
}

function pointList(points: Array<{ x: number; y: number }>) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function RadarChart({ dimensions, midpoint }: { dimensions: DashboardDimension[]; midpoint?: number }) {
  const radius = 100;
  const grid = [0.2, 0.4, 0.6, 0.8, 1].map((ratio) =>
    pointList(dimensions.map((_, index) => radarPoint(index, dimensions.length, radius * ratio))),
  );
  const values = pointList(dimensions.map((item, index) => radarPoint(index, dimensions.length, radius * item.normalized)));
  const referenceRatio = midpoint === undefined
    ? undefined
    : (midpoint - dimensions[0].min) / (dimensions[0].max - dimensions[0].min);
  const reference = referenceRatio === undefined
    ? undefined
    : pointList(dimensions.map((_, index) => radarPoint(index, dimensions.length, radius * referenceRatio)));

  return (
    <div className="dashboard-radar" role="img" aria-label={dimensions.map((item) => `${item.name} ${formatScore(item.value)}`).join("，")}>
      <svg viewBox="0 0 440 310" aria-hidden="true">
        {grid.map((points, index) => <polygon key={points} className={`dashboard-radar-grid is-${index + 1}`} points={points} />)}
        {dimensions.map((item, index) => {
          const edge = radarPoint(index, dimensions.length, radius);
          const label = radarPoint(index, dimensions.length, radius + 34);
          const anchor = label.x < 200 ? "end" : label.x > 240 ? "start" : "middle";
          return (
            <g key={item.key}>
              <line className="dashboard-radar-axis" x1="220" y1="145" x2={edge.x} y2={edge.y} />
              <text className="dashboard-radar-label" x={label.x} y={label.y - 3} textAnchor={anchor}>{item.name}</text>
              <text className="dashboard-radar-value" x={label.x} y={label.y + 14} textAnchor={anchor}>{formatScore(item.value)} / {formatScore(item.max)}</text>
            </g>
          );
        })}
        {reference ? <polygon className="dashboard-radar-reference" points={reference} /> : null}
        <polygon className="dashboard-radar-shape" points={values} />
        {dimensions.map((item, index) => {
          const point = radarPoint(index, dimensions.length, radius * item.normalized);
          return <circle key={item.key} className="dashboard-radar-dot" cx={point.x} cy={point.y} r="4" />;
        })}
      </svg>
      {midpoint !== undefined ? <p>虚线表示量表中点 {formatScore(midpoint)}，不是常模平均。</p> : null}
    </div>
  );
}

function MiniGauge({ item }: { item: DashboardDimension }) {
  const progress = Math.round(item.normalized * 100);
  return (
    <div className="dashboard-mini-gauge" role="img" aria-label={`${item.name} ${formatScore(item.value)} / ${formatScore(item.max)}`}>
      <svg viewBox="0 0 120 70" aria-hidden="true">
        <path className="dashboard-mini-track" pathLength="100" d="M 12 60 A 48 48 0 0 1 108 60" />
        <path className="dashboard-mini-progress" pathLength="100" strokeDasharray={`${progress} 100`} d="M 12 60 A 48 48 0 0 1 108 60" />
        <line className="dashboard-mini-needle" x1="60" y1="60" x2="60" y2="25" transform={`rotate(${-90 + item.normalized * 180} 60 60)`} />
        <circle className="dashboard-mini-center" cx="60" cy="60" r="4" />
      </svg>
      <strong>{formatScore(item.value)}<small> / {formatScore(item.max)}</small></strong>
    </div>
  );
}

const dimensionIcons: Array<ComponentType<{ size?: number; strokeWidth?: number }>> = [
  Eye,
  MessageSquareText,
  Activity,
  Scale,
  Waves,
  BrainCircuit,
  HeartPulse,
  ShieldCheck,
];

function DimensionCards({ dimensions, showScaleNote }: { dimensions: DashboardDimension[]; showScaleNote: boolean }) {
  if (dimensions.length === 0) return null;
  return (
    <section className="dashboard-dimension-section" aria-labelledby="dashboard-dimension-title">
      <div className="dashboard-section-title">
        <div>
          <span>维度画像</span>
          <h2 id="dashboard-dimension-title">维度得分与趋势</h2>
        </div>
        {showScaleNote ? <p>区间仅表示 1–5 量尺位置，不是临床切点。</p> : null}
      </div>
      <div className="dashboard-dimension-grid">
        {dimensions.map((item, index) => {
          const Icon = dimensionIcons[index % dimensionIcons.length];
          return (
            <article className="dashboard-dimension-card" key={item.key}>
              <div className="dashboard-dimension-icon"><Icon size={20} strokeWidth={1.8} /></div>
              <div className="dashboard-dimension-main">
                <div className="dashboard-dimension-heading">
                  <div><h3>{item.name}</h3><span>{item.level}</span></div>
                  <strong>{formatScore(item.value)}</strong>
                </div>
                <p>{item.description}</p>
                <div className="dashboard-progress" aria-hidden="true"><span style={{ width: `${Math.max(2, item.normalized * 100)}%` }} /></div>
                <div className="dashboard-progress-labels"><span>{formatScore(item.min)}</span><span>{formatScore(item.max)}</span></div>
              </div>
              <MiniGauge item={item} />
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PreferenceDashboard({ model }: { model: ReportDashboardModel }) {
  return (
    <div className="dashboard-preferences" aria-label="MBTI 四组偏好维度">
      {model.preferences.map((pair) => {
        const total = pair.leftScore + pair.rightScore || 1;
        const left = (pair.leftScore / total) * 100;
        return (
          <div className="dashboard-preference" key={`${pair.left}-${pair.right}`}>
            <div><strong>{pair.left}</strong><span>倾向 {pair.winner}</span><strong>{pair.right}</strong></div>
            <div className="dashboard-preference-track">
              <span className="dashboard-preference-left" style={{ width: `${left}%` }} />
              <span className="dashboard-preference-right" style={{ width: `${100 - left}%` }} />
            </div>
            <small>{pair.leftScore} : {pair.rightScore}</small>
          </div>
        );
      })}
    </div>
  );
}

function DimensionBars({ dimensions }: { dimensions: DashboardDimension[] }) {
  return (
    <div className="dashboard-comparison-bars">
      {dimensions.map((item) => (
        <div key={item.key}>
          <p><span>{item.name}</span><strong>{formatScore(item.value)} / {formatScore(item.max)}</strong></p>
          <div><span style={{ width: `${Math.max(2, item.normalized * 100)}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export function ReportDashboard({ model, summary }: { model: ReportDashboardModel; summary: string }) {
  const isFfmq = model.mode === "profile" && model.dimensions.map((item) => item.key).join(",") === "observe,describe,act-aware,nonjudge,nonreact";
  const secondaryTitle = model.mode === "mbti"
    ? "四维偏好分布"
    : model.canUseRadar
      ? "维度雷达图"
      : "分项得分对比";

  return (
    <>
      <section className="dashboard-visual-grid" aria-label="测评核心图表">
        {model.gauge ? (
          <article className="dashboard-chart-card dashboard-gauge-card">
            <header><span>结果概览</span><h2>总分位置</h2></header>
            <ScoreGauge gauge={model.gauge} />
            {model.mode === "profile" ? <p className="dashboard-chart-note">合计分用于记录，结果以各维度画像解释为主。</p> : null}
          </article>
        ) : (
          <article className="dashboard-chart-card dashboard-type-card">
            <span>偏好类型</span>
            <strong>{model.metrics[0]?.value}</strong>
            <p>{model.metrics[0]?.hint}</p>
          </article>
        )}

        <article className="dashboard-chart-card dashboard-primary-chart">
          <header><span>数据画像</span><h2>{secondaryTitle}</h2></header>
          {model.mode === "mbti" ? <PreferenceDashboard model={model} /> : model.canUseRadar ? (
            <RadarChart dimensions={model.dimensions} midpoint={model.midpoint} />
          ) : model.dimensions.length > 0 ? (
            <DimensionBars dimensions={model.dimensions} />
          ) : (
            <div className="dashboard-result-summary"><BrainCircuit size={28} strokeWidth={1.6} /><p>{summary}</p></div>
          )}
        </article>
      </section>
      <DimensionCards dimensions={model.dimensions} showScaleNote={isFfmq} />
    </>
  );
}
