import type { BoardState } from '@/types/board';
import type { Point } from '@/types/common';
import {
  CELL_SIZE,
  GRID_COLOR,
  OBSTACLE_COLOR,
  POLLUTION_COLOR,
  BG_COLOR,
} from '@/assets/tile-colors';
import { drawTile } from './tile-renderer';
import { drawPath } from './path-renderer';

export type RenderOptions = {
  cellSize?: number;
  selectedTileId: string | null;
  lastPath: Point[];
  highlightPath: boolean;
  animatingTileIds?: Set<string>;
};

export function render(
  ctx: CanvasRenderingContext2D,
  board: BoardState,
  options: RenderOptions,
): void {
  const cellSize = options.cellSize ?? CELL_SIZE;
  const width = board.width * cellSize;
  const height = board.height * cellSize;

  // Clear
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, width, height);

  // Draw grid
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 1;
  for (let x = 0; x <= board.width; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, height);
    ctx.stroke();
  }
  for (let y = 0; y <= board.height; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(width, y * cellSize);
    ctx.stroke();
  }

  // Draw cells
  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      const cell = board.cells[y]![x]!;
      const px = x * cellSize;
      const py = y * cellSize;

      if (cell.kind === 'obstacle') {
        ctx.fillStyle = OBSTACLE_COLOR;
        ctx.fillRect(px + 2, py + 2, cellSize - 4, cellSize - 4);
      } else if (cell.kind === 'pollution') {
        ctx.fillStyle = POLLUTION_COLOR;
        ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
        // Draw poison icon
        ctx.fillStyle = 'rgba(128, 0, 128, 0.6)';
        ctx.font = `${cellSize * 0.4}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☠', px + cellSize / 2, py + cellSize / 2);
      }
    }
  }

  // Draw tiles
  for (const tile of Object.values(board.tiles)) {
    if (tile.state === 'removed') continue;
    const isSelected = tile.id === options.selectedTileId;
    drawTile(ctx, tile, cellSize, isSelected);
  }

  // Draw path
  if (options.highlightPath && options.lastPath.length > 0) {
    drawPath(ctx, options.lastPath, cellSize, board);
  }
}
