import { AlertCircle, CheckCircle2, ChevronDown, Info, PlusCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { RiskFinding, SafeCombination } from '../lib/types';

interface ReportSectionProps {
  findings: RiskFinding[];
  safeCombinations: SafeCombination[];
  easySummary: string;
}

export default function ReportSection({
  findings,
  safeCombinations,
  easySummary,
}: ReportSectionProps) {
  const [showAllWarnings, setShowAllWarnings] = useState(false);
  const [showSafeDetails, setShowSafeDetails] = useState(false);
  const [showEasySummary, setShowEasySummary] = useState(false);
  const dangerFindings = findings.filter((finding) => finding.severity === 'danger');
  const warningFindings = findings.filter((finding) => finding.severity === 'warning');
  const infoFindings = findings.filter((finding) => finding.severity === 'info');
  const visibleWarnings = showAllWarnings ? warningFindings : warningFindings.slice(0, 5);
  const hasExtraWarnings = warningFindings.length > visibleWarnings.length;
  const safePreview = useMemo(() => safeCombinations.slice(0, 6), [safeCombinations]);

  return (
    <section id="report" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-label">안전 리포트</p>
          <h2 className="mt-2 text-2xl font-black text-brand-ink">
            선택한 약물 조합 분석 결과
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowEasySummary((current) => !current)}
          className="rounded-xl bg-orange-50 px-4 py-3 text-sm font-extrabold text-brand-orange transition hover:bg-orange-100"
        >
          쉬운 설명 보기
        </button>
      </div>

      {showEasySummary && (
        <article className="rounded-3xl border border-orange-100 bg-orange-50 p-5">
          <p className="text-sm font-black text-brand-orange">AI 쉬운 말 요약 예시</p>
          <p className="mt-3 leading-7 text-brand-ink">{easySummary}</p>
          <p className="mt-3 text-sm leading-6 text-brand-muted">
            데모 프론트엔드에서 만든 예시 문장입니다. 실제 의료 AI 판단이 아닙니다.
          </p>
        </article>
      )}

      <RiskGroup
        title="🔴 즉시 확인 필요"
        emptyText="즉시 확인이 필요한 위험 조합은 발견되지 않았습니다."
        findings={dangerFindings}
        tone="danger"
      />

      <RiskGroup
        title="🟡 주의 사항"
        emptyText="주의 사항이 확인되지 않았습니다."
        findings={visibleWarnings}
        tone="warning"
      />

      {hasExtraWarnings && (
        <button
          type="button"
          onClick={() => setShowAllWarnings(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-surface px-4 py-3 text-sm font-bold text-brand-muted transition hover:text-brand-orange"
        >
          <PlusCircle size={18} />
          더 보기
        </button>
      )}

      {infoFindings.length > 0 && (
        <RiskGroup
          title="🔵 참고 신호"
          emptyText=""
          findings={infoFindings}
          tone="info"
        />
      )}

      <article className="rounded-3xl border border-brand-line bg-white p-5">
        <button
          type="button"
          onClick={() => setShowSafeDetails((current) => !current)}
          className="flex w-full items-center justify-between gap-4 text-left"
          aria-expanded={showSafeDetails}
        >
          <div>
            <h3 className="text-lg font-black text-brand-ink">🟢 안전 확인</h3>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              현재 데이터 기준 안전 확인된 조합 {safeCombinations.length}건
            </p>
          </div>
          <ChevronDown
            className={`text-brand-muted transition ${
              showSafeDetails ? 'rotate-180' : ''
            }`}
            size={22}
          />
        </button>

        {showSafeDetails && (
          <div className="mt-4 space-y-3">
            {safePreview.map((combination) => (
              <div
                key={combination.id}
                className="rounded-2xl bg-brand-surface px-4 py-3 text-sm text-brand-muted"
              >
                <span className="font-bold text-brand-ink">
                  {combination.medicines.map((medicine) => medicine.name).join(' + ')}
                </span>
                <span className="block pt-1">{combination.summary}</span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

interface RiskGroupProps {
  title: string;
  emptyText: string;
  findings: RiskFinding[];
  tone: 'danger' | 'warning' | 'info';
}

function RiskGroup({ title, emptyText, findings, tone }: RiskGroupProps) {
  const Icon =
    tone === 'danger' ? AlertCircle : tone === 'warning' ? AlertCircle : Info;
  const iconClass =
    tone === 'danger'
      ? 'bg-medical-red text-white'
      : tone === 'warning'
        ? 'bg-medical-yellow text-white'
        : 'bg-medical-blue text-white';

  return (
    <article className="rounded-3xl border border-brand-line bg-white p-5">
      <h3 className="text-lg font-black text-brand-ink">{title}</h3>
      {findings.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-brand-muted">{emptyText}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {findings.map((finding) => (
            <div key={finding.id} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {finding.medicines.map((medicine) => (
                  <div
                    key={`${finding.id}-${medicine.id}`}
                    className="rounded-xl bg-brand-surface px-4 py-3 text-center text-sm font-bold text-brand-muted"
                  >
                    {medicine.name}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 text-sm leading-6 text-brand-muted">
                <span
                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${iconClass}`}
                >
                  <Icon size={13} />
                </span>
                <p>
                  <span className="font-bold text-brand-ink">{finding.title}</span>
                  <br />
                  {finding.reason}
                  <br />
                  <span className="font-semibold text-brand-orange">
                    출처: {finding.source}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
