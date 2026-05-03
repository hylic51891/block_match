import { describe, it, expect } from 'vitest';
import { AuthService } from '@/services/auth-service';
import type { IPlatformAdapter } from '@/platform/types';

function createMockPlatform(): IPlatformAdapter {
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
    ad: { showRewardedAd: async () => true },
    leaderboard: { submitScore: () => {}, getTopN: () => [] },
    remoteConfig: { getDailyConfig: async () => null },
    getSystemInfo: () => ({ platform: 'test', version: '0', screenWidth: 100, screenHeight: 100 }),
  } as unknown as IPlatformAdapter;
}

describe('AuthService', () => {
  it('starts not logged in', () => {
    const service = new AuthService(createMockPlatform());
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getUserId()).toBeNull();
  });

  it('login sets userId and isLoggedIn', async () => {
    const service = new AuthService(createMockPlatform());
    const id = await service.login();
    expect(id).toBeTruthy();
    expect(service.isLoggedIn()).toBe(true);
    expect(service.getUserId()).toBe(id);
  });
});
