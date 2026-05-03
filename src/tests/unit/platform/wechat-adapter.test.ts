import { describe, it, expect } from 'vitest';
import { WeChatMiniGameAdapter } from '@/platform/wechat-adapter';

describe('WeChatMiniGameAdapter', () => {
  it('implements IPlatformAdapter with type wechat_minigame', () => {
    const adapter = new WeChatMiniGameAdapter();
    expect(adapter.type).toBe('wechat_minigame');
  });

  it('has all required service instances', () => {
    const adapter = new WeChatMiniGameAdapter();
    expect(adapter.storage).toBeDefined();
    expect(adapter.share).toBeDefined();
    expect(adapter.ad).toBeDefined();
    expect(adapter.leaderboard).toBeDefined();
    expect(adapter.remoteConfig).toBeDefined();
  });

  it('storage getLocalProgress returns default without error', () => {
    const adapter = new WeChatMiniGameAdapter();
    const progress = adapter.storage.getLocalProgress();
    expect(progress.tutorialCompleted).toBe(false);
  });

  it('storage setLocalProgress and getLocalProgress roundtrip', () => {
    const adapter = new WeChatMiniGameAdapter();
    adapter.storage.setLocalProgress({ tutorialCompleted: true, settings: { audioEnabled: false } });
    const progress = adapter.storage.getLocalProgress();
    expect(progress.tutorialCompleted).toBe(true);
  });

  it('ad showRewardedAd resolves to true', async () => {
    const adapter = new WeChatMiniGameAdapter();
    const result = await adapter.ad.showRewardedAd();
    expect(result).toBe(true);
  });

  it('share sharePayload does not throw', () => {
    const adapter = new WeChatMiniGameAdapter();
    expect(() => adapter.share.sharePayload({
      title: 'test', description: 'desc', result: {
        mode: 'tutorial', success: true, durationMs: 1000,
        shuffleUsed: 0, reviveUsed: 0, hintUsed: 0,
      }, mode: 'tutorial',
    })).not.toThrow();
  });

  it('getSystemInfo returns wechat info', () => {
    const adapter = new WeChatMiniGameAdapter();
    const info = adapter.getSystemInfo();
    expect(info.platform).toBe('wechat_minigame');
  });
});
