import { useRef, useEffect } from 'react';

export function useCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>): CanvasRenderingContext2D | null {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;
  }, [canvasRef]);

  return ctxRef.current;
}
