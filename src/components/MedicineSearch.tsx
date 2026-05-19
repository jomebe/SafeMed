import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { mockMedicines } from '../lib/mockData';
import { searchMedicines } from '../lib/api';
import type { Medicine } from '../lib/types';

interface MedicineSearchProps {
  selectedMedicines: Medicine[];
  onSelect: (medicine: Medicine) => void;
  onLoadSample: () => void;
}

export default function MedicineSearch({
  selectedMedicines,
  onSelect,
  onLoadSample,
}: MedicineSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Medicine[]>(mockMedicines.slice(0, 6));
  const selectedIds = useMemo(
    () => new Set(selectedMedicines.map((medicine) => medicine.id)),
    [selectedMedicines],
  );

  useEffect(() => {
    let isActive = true;

    searchMedicines(query)
      .then((medicines) => {
        if (isActive) {
          setResults(medicines.slice(0, 8));
        }
      })
      .catch(() => {
        if (isActive) {
          setResults([]);
        }
      });

    return () => {
      isActive = false;
    };
  }, [query]);

  return (
    <section aria-labelledby="medicine-search-title" className="space-y-4">
      <div>
        <h2 id="medicine-search-title" className="section-label">
          약정보
        </h2>
        <div className="relative mt-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="field-input pr-12"
            placeholder="약 이름을 입력해주세요."
            aria-label="약 이름 검색"
          />
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted"
            size={22}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {results.map((medicine) => {
          const isSelected = selectedIds.has(medicine.id);

          return (
            <button
              key={medicine.id}
              type="button"
              disabled={isSelected}
              onClick={() => onSelect(medicine)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                isSelected
                  ? 'border border-brand-orange bg-orange-50 text-brand-orange'
                  : 'bg-brand-surface text-brand-muted hover:bg-orange-50 hover:text-brand-orange'
              }`}
            >
              {medicine.name}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onLoadSample}
        className="w-full rounded-xl border border-dashed border-brand-orange bg-orange-50 px-4 py-3 text-sm font-extrabold text-brand-orange transition hover:bg-orange-100 sm:w-auto"
      >
        예시 약물 불러오기
      </button>
    </section>
  );
}
