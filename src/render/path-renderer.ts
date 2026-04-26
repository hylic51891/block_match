import type { Point } from '@/types/common';
import type { BoardState } from '@/types/board';
import { PATH_COLOR, SELECTED_BORDER_COLOR } from '@/assets/tile-colors';

export function drawPath(
  ctx: CanvasRenderingContext2D,
  path: Point[],
  cellSize: number,
  _board: BoardState,
): void {
  if (path.length < 2) return;

  ctx.strokeStyle = SELECTED_BORDER_COLOR;
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 4]);

  ctx.beginPath();
  const first = path[0]!;
  ctx.moveTo(first.x * cellSize + cellSize / 2, first.y * cellSize + cellSize / 2);
  for (let i = 1; i < path.length; i++) {
    const p = path[i]!;
    ctx.lineTo(p.x * cellSize + cellSize / 2, p.y * cellSize + cellSize / 2);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw path dots
  ctx.fillStyle = PATH_COLOR;
  for (const p of path) {
    ctx.beginPath();
    ctx.arc(p.x * cellSize + cellSize / 2, p.y * cellSize + cellSize / 2, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
