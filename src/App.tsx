import { useEffect, useMemo, useState } from 'react';
import AccessibilityControls from './components/AccessibilityControls';
import AnalyzeButton from './components/AnalyzeButton';
import MedicineSearch from './components/MedicineSearch';
import ProfileForm from './components/ProfileForm';
import ResultDashboard from './components/ResultDashboard';
import SelectedMedicineList from './components/SelectedMedicineList';
import { analyzeMedicines, searchMedicines } from './lib/api';
import type { AnalysisResult, Medicine, UserProfile } from './lib/types';

const disclaimer =
  '본 서비스는 의학적 진단이나 처방을 대체하지 않습니다. 복약 관련 결정은 반드시 의사·약사와 상담하세요.';

export default function App() {
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
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowSplash(false);
    }, 800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const appClassName = useMemo(
    () =>
      [
        'app-root min-h-screen text-brand-ink',
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

  const handleLoadSample = async () => {
    const sampleNames = ['암로디핀', '메트포르민', '시메티딘', '이부프로펜'];
    const medicines = await searchMedicines('');
    setSelectedMedicines(medicines.filter((medicine) => sampleNames.includes(medicine.name)));
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="top" className={appClassName}>
      <main className="app-frame" aria-live="polite">
        {showSplash ? (
          <SplashScreen />
        ) : loading ? (
          <LoadingScreen />
        ) : result ? (
          <ResultDashboard
            result={result}
            selectedMedicines={selectedMedicines}
            onReset={() => setResult(null)}
          />
        ) : (
          <section className="flex min-h-screen flex-col px-[29px] pb-8 pt-14">
            <h1 className="text-center text-3xl font-black text-brand-orange">
              SafeMed
            </h1>

            <div className="mt-8 space-y-6">
              <MedicineSearch
                selectedMedicines={selectedMedicines}
                onSelect={handleSelectMedicine}
                onLoadSample={handleLoadSample}
              />

              <SelectedMedicineList
                medicines={selectedMedicines}
                onRemove={handleRemoveMedicine}
              />

              <ProfileForm profile={profile} onChange={setProfile} />
            </div>

            <div className="mt-auto pt-10">
              <AnalyzeButton
                disabled={selectedMedicines.length < 2}
                loading={loading}
                onClick={handleAnalyze}
                label="검색하기"
              />
              <p className="mt-4 text-center text-[11px] font-semibold leading-5 text-brand-muted">
                {disclaimer}
              </p>
            </div>
          </section>
        )}
      </main>

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

function SplashScreen() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-white">
      <h1 className="text-4xl font-black text-brand-orange">SafeMed</h1>
    </section>
  );
}

function LoadingScreen() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-[#cfcfcf] border-t-brand-muted" />
        <p className="mt-8 text-2xl font-black text-brand-muted">분석중..</p>
      </div>
    </section>
  );
}
