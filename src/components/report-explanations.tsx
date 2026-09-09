import type {
  ExplanationSource,
  ReportExplanation,
  ResolvedFactorExplanation,
  ResolvedProfileExplanation,
} from "@/data/report-explanations";

function formatScore(score: number) {
  return Number.isInteger(score) ? String(score) : score.toFixed(2);
}

function ScoreMeta({ item }: { item: ResolvedFactorExplanation }) {
  if (item.score === undefined) return <span className="report-explanation-level">{item.level}</span>;
  return (
    <span className="report-explanation-score">
      得分 {formatScore(item.score)}{item.maxScore === undefined ? "" : ` / ${formatScore(item.maxScore)}`} · {item.level}
    </span>
  );
}

function ExplanationCopy({
  manifestations,
  impact,
  recommendations,
  riskNotice,
}: Pick<ResolvedFactorExplanation, "manifestations" | "impact" | "recommendations" | "riskNotice">) {
  return (
    <div className="report-explanation-copy">
      <div>
        <strong>可能表现</strong>
        <ul>{manifestations.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <p><strong>可能影响</strong>{impact}</p>
      <div>
        <strong>行动建议</strong>
        <ul>{recommendations.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      {riskNotice ? <p className="report-explanation-risk"><strong>风险提示</strong>{riskNotice}</p> : null}
    </div>
  );
}

function FactorCard({ factor }: { factor: ResolvedFactorExplanation }) {
  return (
    <article className="report-explanation-card">
      <header className="report-explanation-card-header">
        <div>
          <p className="report-explanation-kicker">因子解释</p>
          <h3>{factor.title}</h3>
        </div>
        <ScoreMeta item={factor} />
      </header>
      <p><strong>测量内容</strong>{factor.construct}</p>
      <p><strong>本次含义</strong>{factor.interpretation}</p>
      <ExplanationCopy
        manifestations={factor.manifestations}
        impact={factor.impact}
        recommendations={factor.recommendations}
        riskNotice={factor.riskNotice}
      />
    </article>
  );
}

function ProfileCard({ profile }: { profile: ResolvedProfileExplanation }) {
  return (
    <article className="report-explanation-card report-profile-explanation-card">
      <header className="report-explanation-card-header">
        <div>
          <p className="report-explanation-kicker">固定画像</p>
          <h3>{profile.title}</h3>
        </div>
        <span className="report-explanation-level">{profile.value}</span>
      </header>
      <p><strong>测量内容</strong>{profile.construct}</p>
      <p><strong>本次含义</strong>{profile.interpretation}</p>
      <ExplanationCopy
        manifestations={profile.manifestations}
        impact={profile.impact}
        recommendations={profile.recommendations}
        riskNotice={profile.riskNotice}
      />
    </article>
  );
}

export function ReportExplanationList({
  factors,
  profiles = [],
}: {
  factors: ResolvedFactorExplanation[];
  profiles?: ResolvedProfileExplanation[];
}) {
  return (
    <div className="report-explanation-list">
      {profiles.map((profile) => <ProfileCard key={profile.key} profile={profile} />)}
      {factors.map((factor) => <FactorCard key={factor.key} factor={factor} />)}
    </div>
  );
}

function sourceLabel(source: ExplanationSource) {
  const kind = {
    official: "官方资料",
    "original-study": "原始研究",
    "validation-study": "验证研究",
    "authoritative-reference": "权威参考",
  }[source.kind];
  const year = source.year ? `（${source.year}）` : "";
  return `${kind}：${source.citation}${year}`;
}

export function ReportSourceNotes({ analysis }: { analysis: Pick<ReportExplanation, "limitations" | "sources" | "version" | "translationStatus"> }) {
  const translation = analysis.translationStatus === "authorized"
    ? "授权中文版"
    : "中文工作译文，尚未完成本项目本地样本的信效度与常模验证";

  return (
    <div className="report-source-notes">
      <p><strong>解释库版本</strong>{analysis.version}</p>
      <p><strong>中文版本状态</strong>{translation}</p>
      <div>
        <strong>适用范围与限制</strong>
        <ul>{analysis.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <div>
        <strong>来源</strong>
        <ul>
          {analysis.sources.map((item) => (
            <li key={item.citation}>
              {item.url ? <a href={item.url} target="_blank" rel="noreferrer">{sourceLabel(item)}</a> : sourceLabel(item)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
