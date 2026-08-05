import { useEffect, useState } from 'react';

export function useIntroSequence(reducedMotion) {
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (introDone) {
      document.documentElement.classList.remove('intro-lock');
      return;
    }
    document.documentElement.classList.add('intro-lock');
    const timer = setTimeout(() => setIntroDone(true), reducedMotion ? 900 : 2500);
    return () => clearTimeout(timer);
  }, [introDone, reducedMotion]);

  return { introDone, finishIntro: () => setIntroDone(true) };
}
