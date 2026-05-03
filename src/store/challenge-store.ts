import { create } from 'zustand';
import type { ChallengeDate, DailyChallengeRecord, BattleResult } from '@/types/challenge';
import { createStorage } from '@/infra/storage';
import { telemetry } from '@/infra/telemetry';

const storage = createStorage();

interface ChallengeStore {
  tutorialCompleted: boolean;
  lastChallengeDate?: ChallengeDate;
  dailyBest: Record<ChallengeDate, DailyChallengeRecord>;
  settings: { audioEnabled: boolean };

  // Actions
  loadProgress: () => void;
  markTutorialComplete: () => void;
  saveDailyResult: (result: BattleResult) => boolean; // returns true if best updated
  getTodayBest: () => DailyChallengeRecord | null;
  isTutorialCompleted: () => boolean;
}

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  tutorialCompleted: false,
  dailyBest: {},
  settings: { audioEnabled: true },

  loadProgress: () => {
    const progress = storage.getLocalProgress();
    set({
      tutorialCompleted: progress.tutorialCompleted,
      lastChallengeDate: progress.lastChallengeDate,
      dailyBest: progress.dailyBest ?? {},
      settings: progress.settings,
    });
  },

  markTutorialComplete: () => {
    set({ tutorialCompleted: true });
    const progress = storage.getLocalProgress();
    storage.setLocalProgress({
      tutorialCompleted: true,
      lastChallengeDate: progress.lastChallengeDate,
      dailyBest: progress.dailyBest,
      settings: progress.settings,
    });
    telemetry.track('tutorial_complete', {});
  },

  saveDailyResult: (result: BattleResult) => {
    if (result.mode !== 'daily_challenge' || !result.challengeDate) return false;

    const current = get().dailyBest;
    const existing = current[result.challengeDate];
    let isBestUpdate = false;

    // Update best if: no existing record, or new result is successful with better time
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

      // Persist
      const progress = storage.getLocalProgress();
      storage.setLocalProgress({
        tutorialCompleted: progress.tutorialCompleted,
        lastChallengeDate: result.challengeDate,
        dailyBest: newBest,
        settings: progress.settings,
      });

      if (result.success) {
        telemetry.track('daily_best_updated', { date: result.challengeDate, durationMs: result.durationMs });
      }
    }

    return isBestUpdate;
  },

  getTodayBest: () => {
    const today = new Date().toISOString().slice(0, 10);
    return get().dailyBest[today] ?? null;
  },

  isTutorialCompleted: () => {
    return get().tutorialCompleted;
  },
}));
