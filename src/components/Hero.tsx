import { ClipboardCheck, Database, FileText, Pill, Stethoscope } from 'lucide-react';

const features = [
  {
    title: '공공데이터 기반',
    description: 'DUR 금기·주의 정보를 바탕으로 위험 신호를 정리합니다.',
    icon: Database,
  },
  {
    title: '다중 약물 분석',
    description: '여러 약을 한 번에 선택해 조합 위험을 확인합니다.',
    icon: Pill,
  },
  {
    title: '쉬운 말 리포트',
    description: '전문 용어를 줄이고 바로 이해되는 문장으로 보여줍니다.',
    icon: FileText,
  },
];

export default function Hero() {
  return (
    <section
      id="intro"
      className="mx-auto hidden max-w-6xl px-5 pb-10 pt-12 md:block md:pb-16 md:pt-20"
    >
      <div className="grid items-center gap-10 md:grid-cols-[1.02fr_0.98fr]">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-brand-orange">
            <Stethoscope size={16} />
            공공 보건 의약품 안전 서비스
          </p>
          <h1 className="text-4xl font-black leading-tight text-brand-ink sm:text-5xl md:text-6xl">
            SafeMed
          </h1>
          <p className="mt-4 text-2xl font-extrabold text-brand-ink sm:text-3xl">
            복용 중인 약, 같이 먹어도 괜찮을까?
          </p>
          <p className="mt-5 max-w-xl text-base leading-8 text-brand-muted sm:text-lg">
            공공데이터 기반으로 약물 조합의 위험도를 분석하는 의약품 안전 리포트
            서비스
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-sm md:max-w-md">
          <div className="absolute -right-4 top-8 h-28 w-28 rounded-full bg-orange-100 blur-2xl" />
          <div className="absolute -left-4 bottom-8 h-24 w-24 rounded-full bg-teal-100 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-brand-line bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-brand-muted">의약품 카드</p>
                <p className="mt-1 text-2xl font-black text-brand-orange">SafeMed</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-brand-orange">
                <ClipboardCheck size={26} />
              </div>
            </div>
            <div className="mt-8 space-y-3">
              {['시메티딘', '메트포르민', '이부프로펜'].map((name, index) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-2xl bg-brand-surface px-4 py-4"
                >
                  <span className="font-bold text-brand-ink">{name}</span>
                  <span
                    className={`h-3 w-3 rounded-full ${
                      index === 0
                        ? 'bg-medical-red'
                        : index === 1
                          ? 'bg-medical-yellow'
                          : 'bg-medical-green'
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-brand-orange px-5 py-4 text-center text-sm font-extrabold text-white">
              위험도 82/100
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article
              key={feature.title}
              className="rounded-3xl border border-brand-line bg-white p-5 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-brand-orange">
                <Icon size={22} />
              </div>
              <h2 className="mt-4 text-lg font-black text-brand-ink">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                {feature.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
