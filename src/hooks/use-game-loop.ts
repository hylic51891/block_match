import { useRef, useCallback, useEffect } from 'react';

export function useGameLoop(callback: () => void, enabled: boolean = true): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const rafRef = useRef<number>(0);

  const loop = useCallback(() => {
    callbackRef.current();
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (enabled) {
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, loop]);
}
