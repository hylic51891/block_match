import type { Tile } from '@/types/board';
import { TILE_COLORS, TILE_TEXT_COLORS, SELECTED_BORDER_COLOR, SPECIAL_S_GLOW, SPECIAL_T_GLOW } from '@/assets/tile-colors';

export function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: Tile,
  cellSize: number,
  isSelected: boolean,
): void {
  const px = tile.x * cellSize;
  const py = tile.y * cellSize;
  const padding = 3;
  const radius = 6;

  const color = TILE_COLORS[tile.type] ?? '#CCCCCC';
  const textColor = TILE_TEXT_COLORS[tile.type] ?? '#333333';

  // Draw glow for special tiles
  const glowColor = tile.specialType === 'S' ? SPECIAL_S_GLOW : tile.specialType === 'T' ? SPECIAL_T_GLOW : null;
  if (glowColor) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8;
  }

  // Draw rounded rectangle
  ctx.fillStyle = color;
  roundRect(ctx, px + padding, py + padding, cellSize - padding * 2, cellSize - padding * 2, radius);
  ctx.fill();

  // Reset shadow
  if (glowColor) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  // Draw special marker border
  if (glowColor) {
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2;
    roundRect(ctx, px + padding, py + padding, cellSize - padding * 2, cellSize - padding * 2, radius);
    ctx.stroke();

    // Draw special type indicator in top-right corner
    ctx.fillStyle = glowColor;
    ctx.font = `bold ${cellSize * 0.2}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(tile.specialType!, px + cellSize - padding - 2, py + padding + 2);
  }

  // Draw tile type letter
  ctx.fillStyle = textColor;
  ctx.font = `bold ${cellSize * 0.38}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tile.type, px + cellSize / 2, py + cellSize / 2);

  // Selected highlight
  if (isSelected) {
    ctx.strokeStyle = SELECTED_BORDER_COLOR;
    ctx.lineWidth = 3;
    roundRect(ctx, px + padding, py + padding, cellSize - padding * 2, cellSize - padding * 2, radius);
    ctx.stroke();
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
