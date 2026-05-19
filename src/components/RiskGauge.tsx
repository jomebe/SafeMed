import type { RiskLevel } from '../lib/types';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
}

const levelLabel: Record<RiskLevel, string> = {
  safe: '🟢 안전',
  caution: '🟡 주의',
  danger: '🔴 위험',
};

export default function RiskGauge({ score, level }: RiskGaugeProps) {
  return (
    <div className="rounded-3xl border border-brand-line bg-white p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="section-label">위험지수</p>
          <p className="mt-2 text-sm font-bold text-brand-muted">{levelLabel[level]}</p>
        </div>
        <p
          className={`text-2xl font-black ${
            level === 'danger'
              ? 'text-medical-red'
              : level === 'caution'
                ? 'text-brand-orange'
                : 'text-medical-green'
          }`}
        >
          {score}/100
        </p>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-brand-surface">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            level === 'danger'
              ? 'bg-medical-red'
              : level === 'caution'
                ? 'bg-brand-orange'
                : 'bg-medical-green'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-xl bg-brand-surface text-center text-xs font-bold text-brand-muted">
        <span className="border-r border-white py-3">안전</span>
        <span className="border-r border-white py-3">주의요함</span>
        <span className="py-3">위험</span>
      </div>
    </div>
  );
}
