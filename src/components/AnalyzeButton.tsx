interface AnalyzeButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
  label?: string;
}

export default function AnalyzeButton({
  disabled,
  loading,
  onClick,
  label = '안전성 분석하기',
}: AnalyzeButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className="w-full rounded-xl bg-brand-orange px-6 py-4 text-base font-extrabold text-white shadow-sm transition hover:bg-brand-orangeDark disabled:cursor-not-allowed disabled:bg-brand-surface disabled:text-brand-muted"
    >
      {loading ? '분석중..' : label}
    </button>
  );
}
