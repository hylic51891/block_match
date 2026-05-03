import { describe, it, expect } from 'vitest';
import { MockShareService } from '@/infra/share/mock-share';
import { MockAdService } from '@/infra/ad/mock-ad';
import { MockLeaderboardService } from '@/infra/leaderboard/mock-leaderboard';
import { LocalChallengeConfig } from '@/infra/remote-config/local-config';

describe('Share Mock', () => {
  it('has shareResult method', () => {
    const service = new MockShareService();
    expect(typeof service.shareResult).toBe('function');
  });

  it('does not throw on shareResult', () => {
    const service = new MockShareService();
    expect(() => service.shareResult({
      mode: 'daily_challenge',
      success: true,
      durationMs: 1000,
      shuffleUsed: 0,
      reviveUsed: 0,
      hintUsed: 0,
      challengeDate: '2025-06-15',
    })).not.toThrow();
  });
});

describe('Ad Mock', () => {
  it('has showRewardedAd method', () => {
    const service = new MockAdService();
    expect(typeof service.showRewardedAd).toBe('function');
  });

  it('resolves to true', async () => {
    const service = new MockAdService();
    const result = await service.showRewardedAd();
    expect(result).toBe(true);
  });
});

describe('Leaderboard Mock', () => {
  it('has submitScore and getTopN methods', () => {
    const service = new MockLeaderboardService();
    expect(typeof service.submitScore).toBe('function');
    expect(typeof service.getTopN).toBe('function');
  });

  it('getTopN returns array', () => {
    const service = new MockLeaderboardService();
    const top = service.getTopN(3);
    expect(top.length).toBe(3);
    expect(top[0]!.rank).toBe(1);
  });
});

describe('RemoteConfig Local', () => {
  it('returns a valid config for a date', async () => {
    const config = new LocalChallengeConfig();
    const result = await config.getDailyConfig('2025-06-15');
    expect(result).not.toBeNull();
    expect(result!.width).toBeGreaterThanOrEqual(8);
    expect(result!.specialTypes).toContain('S');
    expect(result!.specialTypes).toContain('T');
  });
});
