import { useRef, useEffect } from 'react';
import { useGameStore } from '@/store/game-store';
import { useUIStore } from '@/store/ui-store';
import { render } from '@/render/canvas-renderer';
import { useGameLoop } from '@/hooks/use-game-loop';
import { useClickHandler } from '@/hooks/use-click-handler';
import { getTileAt } from '@/core/board/board-model';
import { BattleHUD } from '@/components/BattleHUD';
import { CELL_SIZE } from '@/assets/tile-colors';

export function BattleScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const board = useGameStore((s) => s.board);
  const selectedTileId = useGameStore((s) => s.selectedTileId);
  const lastPath = useGameStore((s) => s.lastPath);
  const status = useGameStore((s) => s.status);
  const selectTileAction = useGameStore((s) => s.selectTile);

  // Get 2D context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext('2d');
  }, []);

  // Game loop for rendering - always render to show path on win/lose
  useGameLoop(() => {
    const ctx = ctxRef.current;
    if (!ctx || board.width === 0) return;
    render(ctx, board, {
      cellSize: CELL_SIZE,
      selectedTileId,
      lastPath,
      highlightPath: lastPath.length > 0,
    });
  }, true);

  // Navigate to result on win/lose - delay to show the last path
  useEffect(() => {
    if (status === 'success' || status === 'failed') {
      const timer = setTimeout(() => {
        useUIStore.getState().navigateTo('result');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Click handler
  const handleClick = useClickHandler(board.width, board.height, CELL_SIZE, (point) => {
    const tile = getTileAt(board, point.x, point.y);
    if (tile && tile.state === 'active') {
      selectTileAction(tile.id);
    }
  });

  if (board.width === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <BattleHUD />
      <canvas
        ref={canvasRef}
        width={board.width * CELL_SIZE}
        height={board.height * CELL_SIZE}
        onClick={handleClick}
        style={{ border: '2px solid #ccc', borderRadius: 8, cursor: 'pointer', background: '#fff' }}
      />
      {status === 'success' && <div style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: 24 }}>通关!</div>}
      {status === 'failed' && <div style={{ color: '#F44336', fontWeight: 'bold', fontSize: 24 }}>失败!</div>}
    </div>
  );
}
