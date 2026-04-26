import type { Point } from '@/types/common';
import type { GameRuntimeState, GameStatus } from '@/types/game';
import type { LevelConfig } from '@/types/level';
import { createEmptyBoard, removeTile, setTileState } from '@/core/board/board-model';
import { generateBoard } from '@/core/board/board-generator';
import { loadLevel } from '@/core/level/level-loader';
import { resolveMatch } from '@/core/rules/match-resolver';
import { checkWin, checkLose } from '@/core/systems/win-lose-checker';
import { isDeadlocked } from '@/core/systems/deadlock-detector';
import { shuffle } from '@/core/systems/shuffle-manager';
import { applyPollution, decayPollution } from '@/core/systems/pollution-system';

export type GameStateWithConfig = GameRuntimeState & { _config?: LevelConfig };

export function createInitialState(): GameRuntimeState {
  return {
    levelId: '',
    board: createEmptyBoard(0, 0),
    selectedTileId: null,
    turn: 0,
    shuffleRemaining: 0,
    matchCount: 0,
    status: 'idle',
    lastPath: [],
    levelStartTime: 0,
  };
}

export function startLevel(_state: GameRuntimeState, levelId: string): GameStateWithConfig {
  const config = loadLevel(levelId);
  const board = generateBoard(config);

  return {
    levelId,
    board,
    selectedTileId: null,
    turn: 0,
    shuffleRemaining: config.shuffleLimit,
    matchCount: 0,
    status: 'playing',
    lastPath: [],
    levelStartTime: Date.now(),
    _config: config,
  };
}

export function selectTile(state: GameStateWithConfig, tileId: string): GameStateWithConfig {
  if (state.status !== 'playing') return state;

  const config = state._config;
  const tile = state.board.tiles[tileId];
  if (!tile || tile.state !== 'active') return state;

  // No tile selected yet -> select this one
  if (!state.selectedTileId) {
    return {
      ...state,
      selectedTileId: tileId,
      board: setTileState(state.board, tileId, 'selected'),
    };
  }

  // Clicked the same tile -> deselect
  if (state.selectedTileId === tileId) {
    return {
      ...state,
      selectedTileId: null,
      board: setTileState(state.board, tileId, 'active'),
    };
  }

  // Two tiles selected -> try to match
  // Reset first tile to active state for path finding (it was marked 'selected')
  const boardForMatch = setTileState(state.board, state.selectedTileId, 'active');
  const firstTile = boardForMatch.tiles[state.selectedTileId]!;
  const matchResult = resolveMatch(boardForMatch, firstTile, tile);

  if (!matchResult.success) {
    // Match failed: switch selection to new tile
    const board = setTileState(state.board, state.selectedTileId, 'active');
    return {
      ...state,
      selectedTileId: tileId,
      board: setTileState(board, tileId, 'selected'),
    };
  }

  // Match succeeded!
  let newBoard = state.board;

  // Deselect first tile
  newBoard = setTileState(newBoard, firstTile.id, 'active');

  // Remove both tiles
  newBoard = removeTile(newBoard, firstTile.id);
  newBoard = removeTile(newBoard, tile.id);

  // Apply pollution if enabled
  const currentTurn = state.turn;

  // Build full path including start and end for display
  const fullDisplayPath: Point[] = [
    { x: firstTile.x, y: firstTile.y },
    ...matchResult.path,
    { x: tile.x, y: tile.y },
  ];

  if (config?.pollution.enabled && matchResult.path.length > 0) {
    newBoard = applyPollution(newBoard, matchResult.path, currentTurn, config.pollution.durationTurns);
  }

  // Advance turn
  const nextTurn = currentTurn + 1;

  // Decay pollution
  if (config?.pollution.enabled) {
    newBoard = decayPollution(newBoard, nextTurn);
  }

  // Check win/lose
  const newMatchCount = state.matchCount + 1;
  let newStatus: GameStatus = 'playing';

  if (checkWin(newBoard)) {
    newStatus = 'success';
  } else {
    const loseCheck = checkLose(newBoard, state.shuffleRemaining);
    if (loseCheck.lost) {
      newStatus = 'failed';
    }
  }

  return {
    ...state,
    board: newBoard,
    selectedTileId: null,
    turn: nextTurn,
    matchCount: newMatchCount,
    status: newStatus,
    failReason: newStatus === 'failed' ? 'deadlock' : undefined,
    lastPath: fullDisplayPath,
  };
}

export function useShuffle(state: GameStateWithConfig): GameStateWithConfig {
  if (state.status !== 'playing') return state;
  if (state.shuffleRemaining <= 0) return state;

  const newBoard = shuffle(state.board);
  const newShuffleRemaining = state.shuffleRemaining - 1;

  // Check if still deadlocked after shuffle
  if (isDeadlocked(newBoard) && newShuffleRemaining <= 0) {
    return {
      ...state,
      board: newBoard,
      shuffleRemaining: newShuffleRemaining,
      status: 'failed',
      failReason: 'deadlock',
    };
  }

  return {
    ...state,
    board: newBoard,
    shuffleRemaining: newShuffleRemaining,
    selectedTileId: null,
  };
}

export function resetLevel(state: GameStateWithConfig): GameStateWithConfig {
  if (!state.levelId) return createInitialState();
  return startLevel(createInitialState(), state.levelId);
}
