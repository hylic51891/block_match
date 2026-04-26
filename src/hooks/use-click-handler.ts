import { useCallback, useRef } from 'react';
import type { Point } from '@/types/common';

type ClickHandler = (point: Point) => void;

/**
 * Returns a click handler that maps canvas click coordinates to grid points.
 */
export function useClickHandler(
  boardWidth: number,
  boardHeight: number,
  cellSize: number,
  onClick: ClickHandler,
) {
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  return useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / cellSize);
      const y = Math.floor((e.clientY - rect.top) / cellSize);

      if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight) {
        onClickRef.current({ x, y });
      }
    },
    [boardWidth, boardHeight, cellSize],
  );
}
