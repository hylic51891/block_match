import type { BoardState } from '@/types/board';
import type { FailReason } from '@/types/game';
import { getActiveTiles } from '@/core/board/board-model';
import { isDeadlocked } from './deadlock-detector';

export function checkWin(board: BoardState): boolean {
  return getActiveTiles(board).length === 0;
}

export function checkLose(board: BoardState, shuffleRemaining: number): { lost: boolean; reason?: FailReason } {
  if (!checkWin(board) && isDeadlocked(board)) {
    if (shuffleRemaining <= 0) {
      return { lost: true, reason: 'deadlock' };
    }
    // Has deadlock but still can shuffle, not lost yet
  }
  return { lost: false };
}
