import { create } from 'zustand';
import { createInitialState, startChallenge, startLevel, selectTile, useShuffle, resetLevel, useHint, getHintPair, offerRevive, confirmRevive, declineRevive } from '@/core/engine/game-engine';
import type { GameStateWithConfig } from '@/core/engine/game-engine';
import type { GameMode, ChallengeDate, BattleResult } from '@/types/challenge';
import { telemetry } from '@/infra/telemetry';
import { getPlatform } from '@/platform';
import { getGameService } from '@/services';

interface GameStore extends GameStateWithConfig {
  hintHighlightPair: [string, string] | null;
  startChallenge: (mode: GameMode, date?: ChallengeDate) => void;
  startLevel: (levelId: string) => void;
  selectTile: (tileId: string) => void;
  useShuffle: () => void;
  useHint: () => void;
  getHintPair: () => [string, string] | null;
  resetLevel: () => void;
  timeoutFail: () => void;
  offerReviveAction: () => void;
  confirmReviveAction: () => void;
  declineReviveAction: () => void;
}

function getStorage() {
  return getPlatform().storage;
}

function buildBattleResult(state: GameStateWithConfig): BattleResult {
  const config = state._config;
  return {
    mode: state.mode,
    success: state.status === 'success',
    durationMs: Date.now() - state.levelStartTime,
    shuffleUsed: (config?.shuffleLimit ?? 0) - state.shuffleRemaining,
    reviveUsed: state.reviveUsed,
    hintUsed: (config?.hintLimit ?? 0) - state.hintRemaining,
    challengeDate: state.challengeDate,
  };
}

function saveProgress(state: GameStateWithConfig) {
  const storage = getStorage();
  storage.setSavedGame({
    levelId: state.levelId,
    board: state.board,
    turn: state.turn,
    shuffleRemaining: state.shuffleRemaining,
    hintRemaining: state.hintRemaining,
    matchCount: state.matchCount,
    status: state.status,
    mode: state.mode,
    challengeDate: state.challengeDate,
    _config: state._config,
  });

  if (state.status === 'success' || (state.status === 'failed' && state.reviveState === 'none')) {
    const result = buildBattleResult(state);
    const gameService = getGameService();

    if (state.mode === 'tutorial' && state.status === 'success') {
      gameService.challenge.markTutorialComplete();
    }
    if (state.mode === 'daily_challenge') {
      gameService.challenge.saveResult(result);
    }

    storage.clearSavedGame();

    if (state.mode !== 'tutorial') {
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

      storage.addMatchLog({
        levelId: state.levelId,
        result: state.status === 'success' ? 'success' : 'failed',
        durationMs: Date.now() - state.levelStartTime,
        moveCount: state.matchCount,
        shuffleUsed: result.shuffleUsed,
        createdAt: new Date().toISOString(),
      });
    }

    if (state.mode === 'daily_challenge') {
      telemetry.track(state.status === 'success' ? 'daily_success' : 'daily_fail', {
        date: state.challengeDate,
        durationMs: result.durationMs,
        shuffleUsed: result.shuffleUsed,
      });
    }
  }
}

function handleStatusChange(newState: GameStateWithConfig) {
  // Auto-offer revive on failure
  if (newState.status === 'failed' && newState.reviveState === 'none' && newState.reviveUsed < 1 && newState.mode === 'daily_challenge' && newState.failReason !== 'manual') {
    const revived = offerRevive(newState);
    if (revived.reviveState === 'offered') {
      useGameStore.setState({ reviveState: 'offered' });
      telemetry.track('revive_offer_shown', { date: newState.challengeDate, reason: newState.failReason });
      return;
    }
  }
  saveProgress(newState);
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),
  _config: undefined,
  hintHighlightPair: null,

  startChallenge: (mode: GameMode, date?: ChallengeDate) => {
    const newState = startChallenge(createInitialState(), mode, date);
    set({ ...newState, hintHighlightPair: null });
    telemetry.track(mode === 'tutorial' ? 'tutorial_enter' : 'daily_challenge_start', { mode, date });
  },

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

    // Track match attempt when second tile is selected
    if (state.selectedTileId && state.selectedTileId !== tileId) {
      telemetry.track('match_attempt', { tileA: state.selectedTileId, tileB: tileId });
    }

    const newState = selectTile(state, tileId);
    set(newState);

    if (newState.selectedTileId === tileId) {
      telemetry.track('tile_selected', { tileId });
    }
    if (newState.matchCount > prevState.matchCount) {
      telemetry.track('match_success', { tileA: prevState.selectedTileId, tileB: tileId });
    } else if (prevState.selectedTileId && prevState.selectedTileId !== tileId && newState.selectedTileId === tileId) {
      // Second tile selected but no match — match failed
      telemetry.track('match_fail', { tileA: prevState.selectedTileId, tileB: tileId });
    }

    if (newState.status !== prevStatus || newState.matchCount !== prevState.matchCount) {
      handleStatusChange(newState);
    }
  },

  useShuffle: () => {
    const state = get();
    const newState = useShuffle(state);
    set(newState);
    telemetry.track('shuffle_used', { remaining: newState.shuffleRemaining });
    if (newState.status === 'failed') {
      telemetry.track('daily_fail', { reason: newState.failReason });
      handleStatusChange(newState);
    }
  },

  useHint: () => {
    const state = get();
    if (state.status !== 'playing' || state.hintRemaining <= 0) return;
    const newState = useHint(state);
    const pair = getHintPair(state);
    if (pair) {
      set({ ...newState, hintHighlightPair: pair });
      setTimeout(() => useGameStore.setState({ hintHighlightPair: null }), 2000);
    } else {
      set(newState);
    }
    telemetry.track('hint_used', { remaining: newState.hintRemaining });
  },

  getHintPair: () => {
    const state = get();
    return getHintPair(state);
  },

  resetLevel: () => {
    const state = get();
    const newState = resetLevel(state);
    set(newState);
    telemetry.track('daily_retry', { mode: state.mode, date: state.challengeDate });
  },

  timeoutFail: () => {
    const state = get();
    if (state.status !== 'playing') return;
    const newState = { ...state, status: 'failed' as const, failReason: 'timeout' as const };
    set(newState);
    telemetry.track('daily_fail', { reason: 'timeout' });
    handleStatusChange(newState);
  },

  offerReviveAction: () => {
    const state = get();
    const newState = offerRevive(state);
    set(newState);
    if (newState.reviveState === 'offered') {
      telemetry.track('revive_offer_shown', { date: state.challengeDate, reason: state.failReason });
    }
  },

  confirmReviveAction: () => {
    const state = get();
    // Set to ad_watching first, then confirm
    const watchingState = { ...state, reviveState: 'ad_watching' as const };
    const newState = confirmRevive(watchingState);
    set(newState);
    if (newState.reviveState === 'revived') {
      telemetry.track('revive_used', { date: newState.challengeDate });
    }
  },

  declineReviveAction: () => {
    const state = get();
    const newState = declineRevive(state);
    set(newState);
    // Now actually save the failed progress
    if (newState.reviveState === 'none' && newState.status === 'failed') {
      saveProgress(newState);
    }
  },
}));

export function tryRestoreGame(): boolean {
  const storage = getStorage();
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
