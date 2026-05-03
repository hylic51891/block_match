import { describe, it, expect, beforeEach } from 'vitest';
import { ChallengeService } from '@/services/challenge-service';
import type { IPlatformAdapter } from '@/platform/types';
import type { BattleResult, LocalProgress } from '@/types/challenge';

function createMockPlatform(): IPlatformAdapter {
  let localProgress: LocalProgress = { tutorialCompleted: false, settings: { audioEnabled: true } };
  return {
    type: 'web',
    storage: {
      getLocalProgress: () => localProgress,
      setLocalProgress: (p: LocalProgress) => { localProgress = p; },
      getUserProgress: () => null,
      setUserProgress: () => {},
      getLevelRecord: () => null,
      setLevelRecord: () => {},
      getAllLevelRecords: () => ({}),
      addMatchLog: () => {},
      getMatchLogs: () => [],
      addEventLog: () => {},
      getEventLogs: () => [],
      getSavedGame: () => null,
      setSavedGame: () => {},
      clearSavedGame: () => {},
    },
    share: { shareResult: () => {}, sharePayload: () => {} },
    ad: { showRewardedAd: async () => true },
    leaderboard: { submitScore: () => {}, getTopN: () => [] },
    remoteConfig: { getDailyConfig: async () => null },
    getSystemInfo: () => ({ platform: 'test', version: '0', screenWidth: 100, screenHeight: 100 }),
  } as unknown as IPlatformAdapter;
}

describe('ChallengeService', () => {
  let service: ChallengeService;
  let platform: IPlatformAdapter;

  beforeEach(() => {
    platform = createMockPlatform();
    service = new ChallengeService(platform);
  });

  it('getTutorialConfig returns valid config', () => {
    const config = service.getTutorialConfig();
    expect(config.id).toBe('tutorial');
    expect(config.width).toBe(6);
  });

  it('getDailyConfig returns valid config for a date', async () => {
    const config = await service.getDailyConfig('2025-06-15');
    expect(config.id).toBe('daily-2025-06-15');
    expect(config.width).toBeGreaterThan(0);
  });

  it('markTutorialComplete persists', () => {
    service.markTutorialComplete();
    expect(platform.storage.getLocalProgress().tutorialCompleted).toBe(true);
  });

  it('saveResult saves daily best for daily_challenge', () => {
    const result: BattleResult = {
      mode: 'daily_challenge', success: true, durationMs: 60000,
      shuffleUsed: 1, reviveUsed: 0, hintUsed: 0, challengeDate: '2025-06-15',
    };
    const updated = service.saveResult(result);
    expect(updated).toBe(true);
    const progress = platform.storage.getLocalProgress();
    expect(progress.dailyBest?.['2025-06-15']).toBeDefined();
  });

  it('saveResult does not update when existing is better', () => {
    const first: BattleResult = {
      mode: 'daily_challenge', success: true, durationMs: 30000,
      shuffleUsed: 0, reviveUsed: 0, hintUsed: 0, challengeDate: '2025-06-15',
    };
    service.saveResult(first);
    const worse: BattleResult = {
      mode: 'daily_challenge', success: true, durationMs: 60000,
      shuffleUsed: 1, reviveUsed: 0, hintUsed: 0, challengeDate: '2025-06-15',
    };
    const updated = service.saveResult(worse);
    expect(updated).toBe(false);
  });

  it('getTodayBest returns null when no record', () => {
    const best = service.getTodayBest();
    expect(best).toBeNull();
  });

  it('isTutorialCompleted reflects storage', () => {
    expect(service.isTutorialCompleted()).toBe(false);
    service.markTutorialComplete();
    expect(service.isTutorialCompleted()).toBe(true);
  });

  it('handles dailyBest undefined in progress', () => {
    const progress = platform.storage.getLocalProgress();
    expect(progress.dailyBest).toBeUndefined();
    // saveResult should not throw
    const result: BattleResult = {
      mode: 'daily_challenge', success: true, durationMs: 60000,
      shuffleUsed: 0, reviveUsed: 0, hintUsed: 0, challengeDate: '2025-06-15',
    };
    expect(() => service.saveResult(result)).not.toThrow();
  });
});
