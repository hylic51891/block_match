import { useRef, useEffect, useState, useCallback } from 'react';
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
  const mode = useGameStore((s) => s.mode);
  const config = useGameStore((s) => s._config);
  const hintHighlightPair = useGameStore((s) => s.hintHighlightPair);
  const timeLimit = useGameStore((s) => s.timeLimit);
  const levelStartTime = useGameStore((s) => s.levelStartTime);
  const selectTileAction = useGameStore((s) => s.selectTile);
  const timeoutFailAction = useGameStore((s) => s.timeoutFail);
  const reviveState = useGameStore((s) => s.reviveState);

  // Remaining seconds for timed challenges
  const [remainingSeconds, setRemainingSeconds] = useState<number | undefined>(undefined);

  // Countdown timer
  useEffect(() => {
    if (status !== 'playing' || timeLimit <= 0) {
      if (timeLimit <= 0) setRemainingSeconds(undefined);
      return;
    }

    const updateRemaining = () => {
      const elapsed = Math.floor((Date.now() - levelStartTime) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);
      setRemainingSeconds(remaining);
      return remaining;
    };

    // Initial update
    const remaining = updateRemaining();
    if (remaining <= 0) {
      handleTimeout();
      return;
    }

    const interval = setInterval(() => {
      const r = updateRemaining();
      if (r <= 0) {
        clearInterval(interval);
        handleTimeout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, timeLimit, levelStartTime]);

  const handleTimeout = useCallback(() => {
    const store = useGameStore.getState();
    if (store.status === 'playing') {
      timeoutFailAction();
    }
  }, [timeoutFailAction]);

  // Get 2D context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext('2d');
  }, []);

  // Game loop for rendering
  useGameLoop(() => {
    const ctx = ctxRef.current;
    if (!ctx || board.width === 0) return;
    render(ctx, board, {
      cellSize: CELL_SIZE,
      selectedTileId,
      lastPath,
      highlightPath: lastPath.length > 0,
    });

    // Draw hint highlights
    if (hintHighlightPair) {
      for (const tid of hintHighlightPair) {
        const tile = board.tiles[tid];
        if (tile && tile.state === 'active') {
          ctx.strokeStyle = '#00E5FF';
          ctx.lineWidth = 3;
          ctx.setLineDash([4, 4]);
          const px = tile.x * CELL_SIZE + 3;
          const py = tile.y * CELL_SIZE + 3;
          const size = CELL_SIZE - 6;
          ctx.beginPath();
          ctx.moveTo(px + 6, py);
          ctx.lineTo(px + size - 6, py);
          ctx.quadraticCurveTo(px + size, py, px + size, py + 6);
          ctx.lineTo(px + size, py + size - 6);
          ctx.quadraticCurveTo(px + size, py + size, px + size - 6, py + size);
          ctx.lineTo(px + 6, py + size);
          ctx.quadraticCurveTo(px, py + size, px, py + size - 6);
          ctx.lineTo(px, py + 6);
          ctx.quadraticCurveTo(px, py, px + 6, py);
          ctx.closePath();
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
  }, true);

  // Navigate to result on win/lose (but not if revive is pending)
  useEffect(() => {
    if (status === 'success' || (status === 'failed' && reviveState === 'none')) {
      const timer = setTimeout(() => {
        useUIStore.getState().navigateTo('result');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, reviveState]);

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
      <BattleHUD remainingSeconds={remainingSeconds} />
      {mode === 'tutorial' && config?.tutorial?.message && (
        <div style={{
          padding: '8px 16px',
          background: '#FFF3E0',
          border: '1px solid #FFB74D',
          borderRadius: 8,
          color: '#E65100',
          fontSize: 13,
          maxWidth: board.width * CELL_SIZE,
          textAlign: 'center',
        }}>
          {config.tutorial.title && <strong>{config.tutorial.title}</strong>}
          <p style={{ margin: '4px 0 0' }}>{config.tutorial.message}</p>
        </div>
      )}
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
