import { RotateCcw } from 'lucide-react';

interface AccessibilityControlsProps {
  largeText: boolean;
  highContrast: boolean;
  onLargeTextChange: (enabled: boolean) => void;
  onHighContrastChange: (enabled: boolean) => void;
  onReset: () => void;
}

export default function AccessibilityControls({
  largeText,
  highContrast,
  onLargeTextChange,
  onHighContrastChange,
  onReset,
}: AccessibilityControlsProps) {
  return (
    <section
      aria-label="접근성 설정"
      className="fixed bottom-4 right-4 z-40 flex max-w-[calc(100vw-2rem)] flex-wrap items-center justify-end gap-2"
    >
      <button
        type="button"
        onClick={() => onLargeTextChange(!largeText)}
        className={`access-button ${largeText ? 'access-button-active' : ''}`}
        aria-pressed={largeText}
      >
        큰 글씨
      </button>
      <button
        type="button"
        onClick={() => onHighContrastChange(!highContrast)}
        className={`access-button ${highContrast ? 'access-button-active' : ''}`}
        aria-pressed={highContrast}
      >
        고대비
      </button>
      <button
        type="button"
        onClick={onReset}
        className="access-button"
        aria-label="접근성 설정 초기화"
      >
        <RotateCcw size={16} />
        Reset
      </button>
    </section>
  );
}
