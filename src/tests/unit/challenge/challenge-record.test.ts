import { describe, it, expect, beforeEach } from 'vitest';
import { useChallengeStore } from '@/store/challenge-store';
import type { BattleResult } from '@/types/challenge';

describe('challenge-record', () => {
  beforeEach(() => {
    useChallengeStore.setState({ dailyBest: {}, tutorialCompleted: false });
  });

  it('saves first daily result and returns true', () => {
    const result: BattleResult = {
      mode: 'daily_challenge',
      success: true,
      durationMs: 60000,
      shuffleUsed: 1,
      reviveUsed: 0,
      hintUsed: 0,
      challengeDate: '2025-06-15',
    };
    const updated = useChallengeStore.getState().saveDailyResult(result);
    expect(updated).toBe(true);
    expect(useChallengeStore.getState().dailyBest['2025-06-15']).toBeDefined();
    expect(useChallengeStore.getState().dailyBest['2025-06-15']!.success).toBe(true);
  });

  it('updates best when new time is faster', () => {
    const first: BattleResult = {
      mode: 'daily_challenge', success: true, durationMs: 120000,
      shuffleUsed: 2, reviveUsed: 0, hintUsed: 0, challengeDate: '2025-06-15',
    };
    useChallengeStore.getState().saveDailyResult(first);

    const better: BattleResult = {
      mode: 'daily_challenge', success: true, durationMs: 60000,
      shuffleUsed: 1, reviveUsed: 0, hintUsed: 0, challengeDate: '2025-06-15',
    };
    const updated = useChallengeStore.getState().saveDailyResult(better);
    expect(updated).toBe(true);
    expect(useChallengeStore.getState().dailyBest['2025-06-15']!.durationMs).toBe(60000);
  });

  it('does not update when existing record is better', () => {
    const first: BattleResult = {
      mode: 'daily_challenge', success: true, durationMs: 30000,
      shuffleUsed: 0, reviveUsed: 0, hintUsed: 0, challengeDate: '2025-06-15',
    };
    useChallengeStore.getState().saveDailyResult(first);

    const worse: BattleResult = {
      mode: 'daily_challenge', success: true, durationMs: 60000,
      shuffleUsed: 1, reviveUsed: 0, hintUsed: 0, challengeDate: '2025-06-15',
    };
    const updated = useChallengeStore.getState().saveDailyResult(worse);
    expect(updated).toBe(false);
    expect(useChallengeStore.getState().dailyBest['2025-06-15']!.durationMs).toBe(30000);
  });

  it('getTodayBest returns null when no record', () => {
    const best = useChallengeStore.getState().getTodayBest();
    expect(best).toBeNull();
  });

  it('ignores tutorial results', () => {
    const result: BattleResult = {
      mode: 'tutorial', success: true, durationMs: 30000,
      shuffleUsed: 0, reviveUsed: 0, hintUsed: 0,
    };
    const updated = useChallengeStore.getState().saveDailyResult(result);
    expect(updated).toBe(false);
  });
});
