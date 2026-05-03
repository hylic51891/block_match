import { create } from 'zustand';
import type { ChallengeDate, DailyChallengeRecord, BattleResult } from '@/types/challenge';
import { getGameService } from '@/services';

interface ChallengeStore {
  tutorialCompleted: boolean;
  lastChallengeDate?: ChallengeDate;
  dailyBest: Record<ChallengeDate, DailyChallengeRecord>;
  settings: { audioEnabled: boolean };

  // Actions
  loadProgress: () => void;
  markTutorialComplete: () => void;
  saveDailyResult: (result: BattleResult) => boolean;
  getTodayBest: () => DailyChallengeRecord | null;
  isTutorialCompleted: () => boolean;
}

function getTodayDateStr(): ChallengeDate {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  tutorialCompleted: false,
  dailyBest: {},
  settings: { audioEnabled: true },

  loadProgress: () => {
    const gameService = getGameService();
    const progress = gameService.challenge.getLocalProgress();
    set({
      tutorialCompleted: progress.tutorialCompleted,
      lastChallengeDate: progress.lastChallengeDate,
      dailyBest: progress.dailyBest ?? {},
      settings: progress.settings,
    });
  },

  markTutorialComplete: () => {
    set({ tutorialCompleted: true });
    const gameService = getGameService();
    gameService.challenge.markTutorialComplete();
  },

  saveDailyResult: (result: BattleResult) => {
    if (result.mode !== 'daily_challenge' || !result.challengeDate) return false;

    const current = get().dailyBest;
    const existing = current[result.challengeDate];
    let isBestUpdate = false;

    if (!existing) {
      isBestUpdate = true;
    } else if (result.success && (!existing.success || result.durationMs < existing.durationMs)) {
      isBestUpdate = true;
    }

    if (isBestUpdate) {
      const record: DailyChallengeRecord = {
        challengeDate: result.challengeDate,
        success: result.success,
        durationMs: result.durationMs,
        shuffleUsed: result.shuffleUsed,
        reviveUsed: result.reviveUsed,
        hintUsed: result.hintUsed,
        completedAt: Date.now(),
      };
      const newBest = { ...current, [result.challengeDate]: record };
      set({ dailyBest: newBest, lastChallengeDate: result.challengeDate });

      // Persist via service
      try {
        const gameService = getGameService();
        gameService.challenge.saveResult(result);
      } catch {
        // GameService not initialized in test environment, that's OK
      }
    }

    return isBestUpdate;
  },

  getTodayBest: () => {
    const today = getTodayDateStr();
    return get().dailyBest[today] ?? null;
  },

  isTutorialCompleted: () => {
    return get().tutorialCompleted;
  },
}));
