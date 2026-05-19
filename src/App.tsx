import { useMemo, useRef, useState } from 'react';
import AccessibilityControls from './components/AccessibilityControls';
import AnalyzeButton from './components/AnalyzeButton';
import Header from './components/Header';
import Hero from './components/Hero';
import MedicineSearch from './components/MedicineSearch';
import ProfileForm from './components/ProfileForm';
import ResultDashboard from './components/ResultDashboard';
import SelectedMedicineList from './components/SelectedMedicineList';
import { analyzeMedicines } from './lib/api';
import { mockMedicines } from './lib/mockData';
import type { AnalysisResult, Medicine, UserProfile } from './lib/types';

const disclaimer =
  '본 서비스는 의학적 진단이나 처방을 대체하지 않습니다. 복약 관련 결정은 반드시 의사·약사와 상담하세요.';

export default function App() {
  const analysisRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [selectedMedicines, setSelectedMedicines] = useState<Medicine[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    age: '',
    sex: 'other',
    pregnant: false,
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const appClassName = useMemo(
    () =>
      [
        'min-h-screen bg-white text-brand-ink',
        largeText ? 'large-text-mode' : '',
        highContrast ? 'high-contrast-mode' : '',
      ]
        .filter(Boolean)
        .join(' '),
    [highContrast, largeText],
  );

  const handleSelectMedicine = (medicine: Medicine) => {
    setSelectedMedicines((currentMedicines) => {
      if (currentMedicines.some((item) => item.id === medicine.id)) {
        return currentMedicines;
      }

      return [...currentMedicines, medicine];
    });
    setResult(null);
  };

  const handleRemoveMedicine = (medicineId: string) => {
    setSelectedMedicines((currentMedicines) =>
      currentMedicines.filter((medicine) => medicine.id !== medicineId),
    );
    setResult(null);
  };

  const handleLoadSample = () => {
    const sampleNames = ['암로디핀', '메트포르민', '시메티딘', '이부프로펜'];
    setSelectedMedicines(
      mockMedicines.filter((medicine) => sampleNames.includes(medicine.name)),
    );
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (selectedMedicines.length < 2) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const analysisResult = await analyzeMedicines({
        medicines: selectedMedicines,
        profile,
      });
      setResult(analysisResult);
      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } finally {
      setLoading(false);
    }
  };

  const scrollToAnalysis = () => {
    analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div id="top" className={appClassName}>
      <Header onStart={scrollToAnalysis} />
      <main>
        <Hero />

        <section
          id="analysis"
          ref={analysisRef}
          className="mx-auto grid max-w-sm gap-6 px-7 pb-12 pt-2 md:max-w-6xl md:grid-cols-[0.9fr_1.1fr] md:px-5 md:py-12"
        >
          <div className="bg-white md:rounded-[2rem] md:border md:border-brand-line md:p-7 md:shadow-sm">
            <MedicineSearch
              selectedMedicines={selectedMedicines}
              onSelect={handleSelectMedicine}
              onLoadSample={handleLoadSample}
            />
            <div className="mt-6">
              <SelectedMedicineList
                medicines={selectedMedicines}
                onRemove={handleRemoveMedicine}
              />
            </div>
          </div>

          <div className="bg-white md:rounded-[2rem] md:border md:border-brand-line md:p-7 md:shadow-sm">
            <ProfileForm profile={profile} onChange={setProfile} />
            <div className="mt-8">
              <AnalyzeButton
                disabled={selectedMedicines.length < 2}
                loading={loading}
                onClick={handleAnalyze}
              />
            </div>
          </div>
        </section>

        {loading && (
          <section className="mx-auto flex min-h-[24rem] max-w-6xl items-center justify-center px-5 py-16">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-line border-t-brand-orange" />
              <p className="mt-8 text-2xl font-black text-brand-muted">분석중..</p>
            </div>
          </section>
        )}

        <div ref={resultRef} className="mx-auto max-w-6xl px-5 py-8 md:py-12">
          {result && (
            <ResultDashboard
              result={result}
              selectedMedicines={selectedMedicines}
            />
          )}
        </div>
      </main>

      <footer className="border-t border-brand-line px-5 py-8 text-center text-sm font-semibold leading-7 text-brand-muted">
        <p>{disclaimer}</p>
      </footer>

      <AccessibilityControls
        largeText={largeText}
        highContrast={highContrast}
        onLargeTextChange={setLargeText}
        onHighContrastChange={setHighContrast}
        onReset={() => {
          setLargeText(false);
          setHighContrast(false);
        }}
      />
    </div>
  );
}
