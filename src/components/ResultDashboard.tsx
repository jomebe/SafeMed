import DrugDetailCard from './DrugDetailCard';
import ReportSection from './ReportSection';
import RiskBreakdown from './RiskBreakdown';
import RiskGauge from './RiskGauge';
import TTSButton from './TTSButton';
import type { AnalysisResult, Medicine, RiskLevel } from '../lib/types';

interface ResultDashboardProps {
  result: AnalysisResult;
  selectedMedicines: Medicine[];
}

const levelBadge: Record<RiskLevel, string> = {
  safe: '🟢 안전',
  caution: '🟡 주의',
  danger: '🔴 위험',
};

export default function ResultDashboard({
  result,
  selectedMedicines,
}: ResultDashboardProps) {
  const dangerCount = result.findings.filter(
    (finding) => finding.severity === 'danger',
  ).length;
  const warningCount = result.findings.filter(
    (finding) => finding.severity === 'warning',
  ).length;
  const ttsText = [
    `SafeMed 안전성 분석 결과입니다. 총 위험 점수는 ${result.riskScore}점입니다.`,
    `위험 단계는 ${levelBadge[result.riskLevel]}입니다.`,
    result.summary,
    '본 서비스는 의학적 진단이나 처방을 대체하지 않습니다. 복약 관련 결정은 반드시 의사와 약사와 상담하세요.',
  ].join(' ');

  return (
    <section className="space-y-6" aria-live="polite">
      <div className="rounded-3xl border border-brand-line bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-label">분석 완료</p>
            <h2 className="mt-2 text-2xl font-black text-brand-ink">
              SafeMed 안전성 리포트
            </h2>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-sm font-black ${
              result.riskLevel === 'danger'
                ? 'bg-red-50 text-medical-red'
                : result.riskLevel === 'caution'
                  ? 'bg-orange-50 text-brand-orange'
                  : 'bg-green-50 text-medical-green'
            }`}
          >
            {levelBadge[result.riskLevel]}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {selectedMedicines.map((medicine) => (
            <span
              key={medicine.id}
              className="rounded-xl bg-brand-surface px-3 py-2 text-sm font-bold text-brand-muted"
            >
              {medicine.name}
            </span>
          ))}
        </div>
      </div>

      <RiskGauge score={result.riskScore} level={result.riskLevel} />

      <div className="grid gap-3 sm:grid-cols-3">
        <CountCard label="높은 위험" value={dangerCount} tone="danger" />
        <CountCard label="주의 필요" value={warningCount} tone="warning" />
        <CountCard label="안전 확인" value={result.safeCombinations.length} tone="safe" />
      </div>

      <RiskBreakdown breakdown={result.scoreBreakdown} />

      <div className="flex justify-end">
        <TTSButton text={ttsText} />
      </div>

      <ReportSection
        findings={result.findings}
        safeCombinations={result.safeCombinations}
        easySummary={result.summary}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {selectedMedicines.map((medicine) => (
          <DrugDetailCard key={medicine.id} medicine={medicine} />
        ))}
      </div>

      <p className="rounded-3xl border border-orange-100 bg-orange-50 p-5 text-sm font-semibold leading-7 text-brand-ink">
        본 서비스는 의학적 진단이나 처방을 대체하지 않습니다. 복약 관련 결정은 반드시
        의사·약사와 상담하세요.
      </p>
    </section>
  );
}

interface CountCardProps {
  label: string;
  value: number;
  tone: 'danger' | 'warning' | 'safe';
}

function CountCard({ label, value, tone }: CountCardProps) {
  const toneClass =
    tone === 'danger'
      ? 'text-medical-red bg-red-50'
      : tone === 'warning'
        ? 'text-brand-orange bg-orange-50'
        : 'text-medical-green bg-green-50';

  return (
    <article className="rounded-3xl border border-brand-line bg-white p-5">
      <p className="text-sm font-bold text-brand-muted">{label}</p>
      <p className={`mt-3 inline-flex rounded-2xl px-4 py-2 text-2xl font-black ${toneClass}`}>
        {value}
      </p>
    </article>
  );
}
