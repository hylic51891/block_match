import { describe, it, expect, beforeEach } from 'vitest';
import { ShareService } from '@/services/share-service';
import type { IPlatformAdapter } from '@/platform/types';
import type { SharePayload } from '@/infra/share/types';

let lastPayload: SharePayload | null = null;

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
    share: {
      shareResult: () => {},
      sharePayload: (p: SharePayload) => { lastPayload = p; },
    },
    ad: { showRewardedAd: async () => true },
    leaderboard: { submitScore: () => {}, getTopN: () => [] },
    remoteConfig: { getDailyConfig: async () => null },
    getSystemInfo: () => ({ platform: 'test', version: '0', screenWidth: 100, screenHeight: 100 }),
  } as unknown as IPlatformAdapter;
}

describe('ShareService', () => {
  beforeEach(() => { lastPayload = null; });

  it('generates correct payload for daily challenge success', () => {
    const service = new ShareService(createMockPlatform());
    service.shareResult({
      mode: 'daily_challenge', success: true, durationMs: 120000,
      shuffleUsed: 1, reviveUsed: 0, hintUsed: 0, challengeDate: '2025-06-15',
    });
    expect(lastPayload).not.toBeNull();
    expect(lastPayload!.title).toContain('今日通关');
    expect(lastPayload!.mode).toBe('daily_challenge');
  });

  it('generates correct payload for daily challenge failure', () => {
    const service = new ShareService(createMockPlatform());
    service.shareResult({
      mode: 'daily_challenge', success: false, durationMs: 60000,
      shuffleUsed: 2, reviveUsed: 0, hintUsed: 0, challengeDate: '2025-06-15',
    });
    expect(lastPayload).not.toBeNull();
    expect(lastPayload!.title).toContain('有点难');
  });

  it('generates correct payload for tutorial success', () => {
    const service = new ShareService(createMockPlatform());
    service.shareResult({
      mode: 'tutorial', success: true, durationMs: 30000,
      shuffleUsed: 0, reviveUsed: 0, hintUsed: 0,
    });
    expect(lastPayload).not.toBeNull();
    expect(lastPayload!.title).toContain('学会了');
  });
});
