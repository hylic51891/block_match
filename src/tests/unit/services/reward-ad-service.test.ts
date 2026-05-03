import { describe, it, expect } from 'vitest';
import { RewardAdService } from '@/services/reward-ad-service';
import type { IPlatformAdapter } from '@/platform/types';

function createMockPlatform(adResult: boolean = true): IPlatformAdapter {
  return {
    type: 'web',
    storage: {
      getLocalProgress: () => ({ tutorialCompleted: false, settings: { audioEnabled: true } }),
      setLocalProgress: () => {},
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
    ad: { showRewardedAd: async () => adResult },
    leaderboard: { submitScore: () => {}, getTopN: () => [] },
    remoteConfig: { getDailyConfig: async () => null },
    getSystemInfo: () => ({ platform: 'test', version: '0', screenWidth: 100, screenHeight: 100 }),
  } as unknown as IPlatformAdapter;
}

describe('RewardAdService', () => {
  it('delegates to platform ad service', async () => {
    const service = new RewardAdService(createMockPlatform(true));
    const result = await service.showRewardedAd();
    expect(result).toBe(true);
  });

  it('returns false when ad fails', async () => {
    const service = new RewardAdService(createMockPlatform(false));
    const result = await service.showRewardedAd();
    expect(result).toBe(false);
  });
});
