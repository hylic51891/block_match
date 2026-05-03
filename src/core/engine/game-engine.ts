import type { Point } from '@/types/common';
import type { GameRuntimeState, GameStatus } from '@/types/game';
import type { LevelConfig } from '@/types/level';
import type { GameMode, ChallengeDate } from '@/types/challenge';
import { createEmptyBoard, removeTile, setTileState } from '@/core/board/board-model';
import { generateBoard } from '@/core/board/board-generator';
import { loadLevel } from '@/core/level/level-loader';
import { getTutorialLevelConfig } from '@/core/challenge/tutorial-provider';
import { getDailyChallengeConfig } from '@/core/challenge/daily-provider';
import { resolveMatch } from '@/core/rules/match-resolver';
import { checkWin, checkLose } from '@/core/systems/win-lose-checker';
import { isDeadlocked } from '@/core/systems/deadlock-detector';
import { shuffle } from '@/core/systems/shuffle-manager';
import { applyPollution, decayPollution, purifyAroundPath } from '@/core/systems/pollution-system';
import { useHint as hintManagerUseHint, getHintPair as hintManagerGetHintPair } from '@/core/systems/hint-manager';

export type GameStateWithConfig = GameRuntimeState & { _config?: LevelConfig };

export function createInitialState(): GameRuntimeState {
  return {
    levelId: '',
    board: createEmptyBoard(0, 0),
    selectedTileId: null,
    turn: 0,
    shuffleRemaining: 0,
    hintRemaining: 0,
    matchCount: 0,
    status: 'idle',
    lastPath: [],
    levelStartTime: 0,
    mode: 'daily_challenge',
    timeLimit: 0,
    reviveState: 'none',
    reviveUsed: 0,
  };
}

function loadConfigForMode(mode: GameMode, date?: ChallengeDate): LevelConfig {
  if (mode === 'tutorial') {
    return getTutorialLevelConfig();
  }
  const challengeDate = date ?? new Date().toISOString().slice(0, 10);
  return getDailyChallengeConfig(challengeDate);
}

export function startChallenge(_state: GameRuntimeState, mode: GameMode, date?: ChallengeDate): GameStateWithConfig {
  const config = loadConfigForMode(mode, date);
  const board = generateBoard(config);

  return {
    levelId: config.id,
    board,
    selectedTileId: null,
    turn: 0,
    shuffleRemaining: config.shuffleLimit,
    hintRemaining: config.hintLimit ?? 0,
    matchCount: 0,
    status: 'playing',
    lastPath: [],
    levelStartTime: Date.now(),
    mode,
    challengeDate: mode === 'daily_challenge' ? (date ?? new Date().toISOString().slice(0, 10)) : undefined,
    timeLimit: config.timeLimit ?? 0,
    reviveState: 'none',
    reviveUsed: 0,
    _config: config,
  };
}

// Legacy: keep startLevel for backward compatibility with 20-level data
export function startLevel(_state: GameRuntimeState, levelId: string): GameStateWithConfig {
  const config = loadLevel(levelId);
  const board = generateBoard(config);

  return {
    levelId,
    board,
    selectedTileId: null,
    turn: 0,
    shuffleRemaining: config.shuffleLimit,
    hintRemaining: config.hintLimit ?? 0,
    matchCount: 0,
    status: 'playing',
    lastPath: [],
    levelStartTime: Date.now(),
    mode: 'daily_challenge',
    timeLimit: config.timeLimit ?? 0,
    reviveState: 'none',
    reviveUsed: 0,
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

  // Build full display path
  const fullDisplayPath: Point[] = [
    { x: firstTile.x, y: firstTile.y },
    ...matchResult.path,
    { x: tile.x, y: tile.y },
  ];

  // Apply pollution if enabled (S tiles can pass through pollution, so their paths don't create it)
  const currentTurn = state.turn;
  const hasPhaseTile = firstTile.specialType === 'S' || tile.specialType === 'S';

  if (config?.pollution.enabled && matchResult.path.length > 0 && !hasPhaseTile) {
    newBoard = applyPollution(newBoard, matchResult.path, currentTurn, config.pollution.durationTurns);
  }

  // T tile purification: after match, clear pollution around path (at least one T)
  if ((firstTile.specialType === 'T' || tile.specialType === 'T') && matchResult.path.length > 0) {
    newBoard = purifyAroundPath(newBoard, matchResult.path);
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
  let failReason: import('@/types/game').FailReason | undefined;

  if (checkWin(newBoard)) {
    newStatus = 'success';
  } else {
    const loseCheck = checkLose(newBoard, state.shuffleRemaining);
    if (loseCheck.lost) {
      newStatus = 'failed';
      failReason = loseCheck.reason ?? 'deadlock';
    }
  }

  return {
    ...state,
    board: newBoard,
    selectedTileId: null,
    turn: nextTurn,
    matchCount: newMatchCount,
    status: newStatus,
    failReason,
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
      failReason: 'no_shuffle',
    };
  }

  return {
    ...state,
    board: newBoard,
    shuffleRemaining: newShuffleRemaining,
    selectedTileId: null,
  };
}

export function useHint(state: GameStateWithConfig): GameStateWithConfig {
  if (state.status !== 'playing') return state;

  const result = hintManagerUseHint(state.board, state.hintRemaining);
  if (!result.pair) return state;

  return {
    ...state,
    hintRemaining: result.hintRemaining,
  };
}

export function getHintPair(state: GameStateWithConfig): [string, string] | null {
  return hintManagerGetHintPair(state.board);
}

export function resetLevel(state: GameStateWithConfig): GameStateWithConfig {
  if (state.mode === 'tutorial') {
    return startChallenge(createInitialState(), 'tutorial');
  }
  if (state.mode === 'daily_challenge' && state.challengeDate) {
    return startChallenge(createInitialState(), 'daily_challenge', state.challengeDate);
  }
  // Legacy
  if (state.levelId) {
    return startLevel(createInitialState(), state.levelId);
  }
  return createInitialState();
}

export function offerRevive(state: GameStateWithConfig): GameStateWithConfig {
  // Only offer revive for failed daily_challenge, at most once per game
  if (state.status !== 'failed') return state;
  if (state.reviveUsed >= 1) return state;
  if (state.mode !== 'daily_challenge') return state;
  if (state.failReason === 'manual') return state;
  return { ...state, reviveState: 'offered' };
}

export function confirmRevive(state: GameStateWithConfig): GameStateWithConfig {
  if (state.reviveState !== 'ad_watching') return state;
  return {
    ...state,
    status: 'playing',
    failReason: undefined,
    reviveState: 'revived',
    reviveUsed: state.reviveUsed + 1,
    shuffleRemaining: state.shuffleRemaining + 1,
    timeLimit: 60,
    levelStartTime: Date.now(),
  };
}

export function declineRevive(state: GameStateWithConfig): GameStateWithConfig {
  if (state.reviveState !== 'offered') return state;
  return { ...state, reviveState: 'none' };
}
