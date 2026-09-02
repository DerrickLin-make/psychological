"use client";

import Link from "next/link";
import {
  ClipboardList,
  Clock3,
  Download,
  LifeBuoy,
  LayoutDashboard,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { BackButton } from "@/components/back-button";
import type { ReactNode, RefObject } from "react";

export type ReportMetric = {
  label: string;
  value: string | number;
  hint?: string;
};

export type ReportProfileItem = {
  label: string;
  value: string;
};

type ClinicalReportProps = {
  scaleSlug: string;
  category: string;
  title: string;
  questionCount: number;
  resultLabel: string;
  resultSummary: string;
  metrics: ReportMetric[];
  profileItems?: ReportProfileItem[];
  completedAt: number | null;
  elapsedSeconds: number | null;
  reportRef: RefObject<HTMLDivElement | null>;
  onDownload?: () => void;
  children: ReactNode;
};

function formatDate(timestamp: number | null) {
  if (!timestamp) return "未记录";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function formatElapsed(seconds: number | null) {
  if (!seconds || seconds < 1) return "未记录";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes > 0 ? `${minutes} 分 ${remainder} 秒` : `${remainder} 秒`;
}

export function ReportSection({
  title,
  eyebrow,
  children,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`report-section ${className}`}>
      <div className="report-section-heading">
        <div>
          {eyebrow ? <p className="report-section-eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function Sidebar({ scaleSlug }: { scaleSlug: string }) {
  return (
    <aside className="report-sidebar">
      <div className="report-brand">
        <span>MindScope</span>
        <small>心理健康评估系统</small>
      </div>

      <nav className="report-nav" aria-label="报告导航">
        <a className="report-nav-item is-active" href="#report-overview" aria-current="page">
          <LayoutDashboard size={17} strokeWidth={1.8} />
          <span>报告概览</span>
        </a>
        <Link className="report-nav-item" href={`/scales/${scaleSlug}`}>
          <ClipboardList size={17} strokeWidth={1.8} />
          <span>测评详情</span>
        </Link>
      </nav>

      <div className="report-support">
        <LifeBuoy size={20} strokeWidth={1.7} />
        <div>
          <strong>需要帮助？</strong>
          <span>联系专业咨询师</span>
        </div>
      </div>
    </aside>
  );
}

export function ClinicalReport({
  scaleSlug,
  category,
  title,
  questionCount,
  resultLabel,
  resultSummary,
  metrics,
  profileItems = [],
  completedAt,
  elapsedSeconds,
  reportRef,
  onDownload,
  children,
}: ClinicalReportProps) {
  return (
    <div ref={reportRef} className="clinical-report" id="report">
      <Sidebar scaleSlug={scaleSlug} />

      <div className="report-workspace">
        <div className="report-toolbar">
          <div className="report-toolbar-label">MindScope / 在线测评报告</div>
          <div className="report-toolbar-actions">
            <BackButton fallbackHref={`/scales/${scaleSlug}`} />
            {onDownload ? (
              <button type="button" className="report-action" onClick={onDownload} aria-label="下载报告">
                <Download size={15} strokeWidth={1.8} />
                <span>下载报告</span>
              </button>
            ) : null}
            <button type="button" className="report-action" onClick={() => window.print()} aria-label="打印报告">
              <Printer size={15} strokeWidth={1.8} />
              <span>打印报告</span>
            </button>
          </div>
        </div>

        <main className="report-content">
          <header className="report-heading">
            <div>
              <p className="report-heading-eyebrow">{category}</p>
              <h1>{title} 结果分析报告</h1>
            </div>
            <div className="report-meta">
              <span><Clock3 size={14} />完成时间：{formatDate(completedAt)}</span>
              <span>测评时长：{formatElapsed(elapsedSeconds)}</span>
              <span>指导用时：{formatElapsed(elapsedSeconds)}</span>
            </div>
          </header>

          {profileItems.length > 0 ? (
            <div className="report-profile-row">
              {profileItems.map((item) => (
                <span key={item.label}>{item.label}：{item.value}</span>
              ))}
            </div>
          ) : null}

          <p className="report-result-heading">测评结果</p>

          <section className="report-overview" id="report-overview" aria-label="测评结果概览">
            <div className="report-status-card">
              <span>测评结果</span>
              <strong>{resultLabel}</strong>
            </div>
            <div className="report-metrics">
              {metrics.map((metric) => (
                <div className="report-metric" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  {metric.hint ? <small>{metric.hint}</small> : null}
                </div>
              ))}
            </div>
            <p className="report-overview-summary">{resultSummary}</p>
          </section>

          {children}

          <footer className="report-footer">
            <span><ShieldCheck size={14} /> MindScope 心理健康评估系统</span>
            <span>本报告仅供参考，不作为诊断依据。</span>
            <span>共 {questionCount} 道题</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
