import { AlertTriangle, CircleHelp, ShieldAlert, UserRound } from 'lucide-react';
import type { ScoreBreakdown } from '../lib/types';

interface RiskBreakdownProps {
  breakdown: ScoreBreakdown;
}

export default function RiskBreakdown({ breakdown }: RiskBreakdownProps) {
  const items = [
    {
      label: '확정 위험',
      value: breakdown.danger,
      icon: ShieldAlert,
      colorClass: 'text-medical-red bg-red-50',
    },
    {
      label: '주의 신호',
      value: breakdown.warning,
      icon: AlertTriangle,
      colorClass: 'text-brand-orange bg-orange-50',
    },
    {
      label: '개인 특성',
      value: breakdown.profile,
      icon: UserRound,
      colorClass: 'text-medical-blue bg-blue-50',
    },
    {
      label: '참고 신호',
      value: breakdown.info,
      icon: CircleHelp,
      colorClass: 'text-medical-teal bg-teal-50',
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.label}
            className="rounded-3xl border border-brand-line bg-white p-4"
          >
            <div
              className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${item.colorClass}`}
            >
              <Icon size={20} />
            </div>
            <p className="text-sm font-bold text-brand-muted">{item.label}</p>
            <p className="mt-1 text-2xl font-black text-brand-ink">+{item.value}</p>
          </article>
        );
      })}
    </div>
  );
}
