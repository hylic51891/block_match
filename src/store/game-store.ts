import { create } from 'zustand';
import { createInitialState, startLevel, selectTile, useShuffle, resetLevel } from '@/core/engine/game-engine';
import type { GameStateWithConfig } from '@/core/engine/game-engine';
import { telemetry } from '@/infra/telemetry';
import { createStorage } from '@/infra/storage';

interface GameStore extends GameStateWithConfig {
  startLevel: (levelId: string) => void;
  selectTile: (tileId: string) => void;
  useShuffle: () => void;
  resetLevel: () => void;
}

const storage = createStorage();

function saveProgress(state: GameStateWithConfig) {
  // Save current game state for resume
  storage.setSavedGame({
    levelId: state.levelId,
    board: state.board,
    turn: state.turn,
    shuffleRemaining: state.shuffleRemaining,
    matchCount: state.matchCount,
    status: state.status,
    _config: state._config,
  });

  // Update level record on win/lose
  if (state.status === 'success' || state.status === 'failed') {
    const existing = storage.getLevelRecord(state.levelId);
    const record = {
      levelId: state.levelId,
      bestScore: Math.max(existing?.bestScore ?? 0, state.matchCount),
      bestStar: Math.max(existing?.bestStar ?? 0, state.status === 'success' ? 1 : 0),
      successCount: (existing?.successCount ?? 0) + (state.status === 'success' ? 1 : 0),
      failCount: (existing?.failCount ?? 0) + (state.status === 'failed' ? 1 : 0),
      lastPlayAt: new Date().toISOString(),
    };
    storage.setLevelRecord(state.levelId, record);
    storage.clearSavedGame();

    storage.addMatchLog({
      levelId: state.levelId,
      result: state.status === 'success' ? 'success' : 'failed',
      durationMs: Date.now() - state.levelStartTime,
      moveCount: state.matchCount,
      shuffleUsed: (state._config?.shuffleLimit ?? 0) - state.shuffleRemaining,
      createdAt: new Date().toISOString(),
    });
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),
  _config: undefined,

  startLevel: (levelId: string) => {
    const newState = startLevel(createInitialState(), levelId);
    set(newState);
    telemetry.track('level_loaded', { levelId });
  },

  selectTile: (tileId: string) => {
    const state = get();
    if (state.status !== 'playing') return;
    const prevStatus = state.status;
    const prevState = state;
    const newState = selectTile(state, tileId);
    set(newState);

    // Track events
    if (newState.selectedTileId === tileId) {
      telemetry.track('tile_selected', { tileId });
    }
    if (newState.matchCount > prevState.matchCount) {
      telemetry.track('match_success', { tileA: prevState.selectedTileId, tileB: tileId });
    }

    // Save on state changes
    if (newState.status !== prevStatus || newState.matchCount !== prevState.matchCount) {
      saveProgress(newState);
    }
  },

  useShuffle: () => {
    const state = get();
    const newState = useShuffle(state);
    set(newState);
    telemetry.track('shuffle_used', { remaining: newState.shuffleRemaining });
    if (newState.status === 'failed') {
      telemetry.track('level_failed', { reason: newState.failReason });
    }
  },

  resetLevel: () => {
    const state = get();
    const newState = resetLevel(state);
    set(newState);
  },
}));

// Check for saved game on load
export function tryRestoreGame(): boolean {
  const saved = storage.getSavedGame() as GameStateWithConfig | null;
  if (saved && saved.status === 'playing') {
    useGameStore.setState(saved);
    telemetry.track('storage_loaded', { levelId: saved.levelId });
    return true;
  }
  if (saved) {
    storage.clearSavedGame();
  }
  return false;
}

export { storage };
