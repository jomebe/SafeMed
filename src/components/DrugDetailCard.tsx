import { Pill } from 'lucide-react';
import type { Medicine } from '../lib/types';

interface DrugDetailCardProps {
  medicine: Medicine;
}

export default function DrugDetailCard({ medicine }: DrugDetailCardProps) {
  return (
    <article className="grid gap-4 rounded-3xl border border-brand-line bg-white p-5 sm:grid-cols-[1fr_10rem]">
      <div>
        <p className="section-label">약별 상세 정보</p>
        <h3 className="mt-3 text-lg font-black text-brand-ink">{medicine.name}</h3>
        <dl className="mt-3 space-y-2 text-sm leading-6 text-brand-muted">
          <div>
            <dt className="inline font-bold text-brand-orange">이름: </dt>
            <dd className="inline">{medicine.name}</dd>
          </div>
          <div>
            <dt className="inline font-bold text-brand-orange">성분: </dt>
            <dd className="inline">
              {medicine.ingredientName} · {medicine.ingredientCode}
            </dd>
          </div>
          <div>
            <dt className="inline font-bold text-brand-orange">정보: </dt>
            <dd className="inline">{medicine.description}</dd>
          </div>
          <div>
            <dt className="inline font-bold text-brand-orange">제조사: </dt>
            <dd className="inline">{medicine.company}</dd>
          </div>
        </dl>
      </div>
      <div className="flex min-h-40 items-center justify-center rounded-2xl bg-brand-surface text-brand-muted">
        <div className="text-center">
          <Pill className="mx-auto mb-3 text-brand-orange" size={34} />
          <p className="text-sm font-bold">{medicine.category}</p>
        </div>
      </div>
    </article>
  );
}
