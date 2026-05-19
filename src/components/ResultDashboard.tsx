import DrugDetailCard from './DrugDetailCard';
import ReportSection from './ReportSection';
import RiskBreakdown from './RiskBreakdown';
import RiskGauge from './RiskGauge';
import TTSButton from './TTSButton';
import type { AnalysisResult, Medicine, RiskLevel } from '../lib/types';

interface ResultDashboardProps {
  result: AnalysisResult;
  selectedMedicines: Medicine[];
  onReset: () => void;
}

const levelBadge: Record<RiskLevel, string> = {
  safe: '🟢 안전',
  caution: '🟡 주의',
  danger: '🔴 위험',
};

export default function ResultDashboard({
  result,
  selectedMedicines,
  onReset,
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
    <section className="min-h-screen space-y-6 bg-white px-[29px] pb-8 pt-14" aria-live="polite">
      <h1 className="text-center text-3xl font-black text-brand-orange">SafeMed</h1>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="section-label">선택된 약정보</p>
          <span
            className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
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
        <div className="flex flex-wrap gap-2">
          {selectedMedicines.map((medicine) => (
            <span
              key={medicine.id}
              className="rounded-lg bg-brand-surface px-3 py-2 text-xs font-bold text-brand-muted"
            >
              {medicine.name}
            </span>
          ))}
        </div>
      </div>

      <RiskGauge score={result.riskScore} level={result.riskLevel} />

      <div className="grid grid-cols-3 gap-2">
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

      <div className="space-y-5">
        {selectedMedicines.map((medicine) => (
          <DrugDetailCard key={medicine.id} medicine={medicine} />
        ))}
      </div>

      <p className="border-t border-brand-line pt-5 text-xs font-semibold leading-6 text-brand-muted">
        본 서비스는 의학적 진단이나 처방을 대체하지 않습니다. 복약 관련 결정은 반드시
        의사·약사와 상담하세요.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-xl bg-brand-orange px-4 py-4 text-sm font-extrabold text-white"
      >
        다시 분석하기
      </button>
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
    <article className="rounded-xl bg-brand-surface p-3">
      <p className="text-[11px] font-bold text-brand-muted">{label}</p>
      <p className={`mt-2 inline-flex rounded-xl px-3 py-1 text-xl font-black ${toneClass}`}>
        {value}
      </p>
    </article>
  );
}
