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
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.label}
            className="rounded-xl bg-brand-surface p-3"
          >
            <div
              className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full ${item.colorClass}`}
            >
              <Icon size={17} />
            </div>
            <p className="text-xs font-bold text-brand-muted">{item.label}</p>
            <p className="mt-1 text-xl font-black text-brand-ink">+{item.value}</p>
          </article>
        );
      })}
    </div>
  );
}
