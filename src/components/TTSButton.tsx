import { Volume2 } from 'lucide-react';

interface TTSButtonProps {
  text: string;
}

export default function TTSButton({ text }: TTSButtonProps) {
  const speak = () => {
    if (typeof window.speechSynthesis === 'undefined') {
      globalThis.alert('이 브라우저에서는 음성 읽기를 지원하지 않습니다.');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.96;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={speak}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-ink px-4 py-3 text-sm font-extrabold text-white transition hover:bg-black"
    >
      <Volume2 size={18} />
      리포트 음성으로 듣기
    </button>
  );
}
