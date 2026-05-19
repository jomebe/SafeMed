import { X } from 'lucide-react';
import type { Medicine } from '../lib/types';

interface SelectedMedicineListProps {
  medicines: Medicine[];
  onRemove: (medicineId: string) => void;
}

export default function SelectedMedicineList({
  medicines,
  onRemove,
}: SelectedMedicineListProps) {
  if (medicines.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-line bg-white px-4 py-5 text-sm text-brand-muted">
        선택된 약이 없습니다. 두 가지 이상 선택하면 분석할 수 있습니다.
      </div>
    );
  }

  return (
    <section aria-labelledby="selected-medicine-title" className="space-y-3">
      <h2 id="selected-medicine-title" className="section-label">
        선택된 약정보
      </h2>
      <div className="flex flex-wrap gap-2">
        {medicines.map((medicine) => (
          <span
            key={medicine.id}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-line bg-brand-surface px-3 py-2 text-sm font-semibold text-brand-muted"
          >
            {medicine.name}
            <button
              type="button"
              onClick={() => onRemove(medicine.id)}
              className="rounded-full text-brand-muted transition hover:text-brand-orange"
              aria-label={`${medicine.name} 삭제`}
            >
              <X size={16} />
            </button>
          </span>
        ))}
      </div>
    </section>
  );
}
