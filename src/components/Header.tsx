import { ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onStart: () => void;
}

export default function Header({ onStart }: HeaderProps) {
  return (
    <header className="top-0 z-30 bg-white/92 backdrop-blur md:sticky md:border-b md:border-brand-line">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-7 py-8 md:justify-between md:px-5 md:py-4">
        <a href="#top" className="flex items-center gap-2" aria-label="SafeMed 홈">
          <span className="hidden h-9 w-9 items-center justify-center rounded-2xl bg-brand-orange text-white md:flex">
            <ShieldCheck size={20} strokeWidth={2.5} />
          </span>
          <span className="text-3xl font-black tracking-normal text-brand-orange md:text-2xl">
            SafeMed
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-brand-muted md:flex">
          <a className="transition hover:text-brand-ink" href="#intro">
            서비스 소개
          </a>
          <a className="transition hover:text-brand-ink" href="#analysis">
            분석하기
          </a>
          <a className="transition hover:text-brand-ink" href="#report">
            리포트 예시
          </a>
        </nav>

        <button
          type="button"
          onClick={onStart}
          className="hidden rounded-xl bg-brand-orange px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-orangeDark md:inline-flex"
        >
          지금 분석하기
        </button>
      </div>
    </header>
  );
}
