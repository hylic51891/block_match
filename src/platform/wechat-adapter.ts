import type { IPlatformAdapter } from './types';
import { WeChatStorageStub, WeChatShareStub, WeChatAdStub, WeChatLeaderboardStub, WeChatRemoteConfigStub } from './wechat-stubs';

/**
 * WeChat Mini Game adapter skeleton.
 * All wx.* calls are stubbed — real implementation will be filled
 * when building for the WeChat Mini Game target.
 */
export class WeChatMiniGameAdapter implements IPlatformAdapter {
  readonly type = 'wechat_minigame' as const;
  readonly storage = new WeChatStorageStub();
  readonly share = new WeChatShareStub();
  readonly ad = new WeChatAdStub();
  readonly leaderboard = new WeChatLeaderboardStub();
  readonly remoteConfig = new WeChatRemoteConfigStub();

  onShow(_callback: () => void): void {
    // wx.onShow(callback) in production
    console.log('[WeChatAdapter] onShow registered (stub)');
  }

  onHide(_callback: () => void): void {
    // wx.onHide(callback) in production
    console.log('[WeChatAdapter] onHide registered (stub)');
  }

  getSystemInfo() {
    // wx.getSystemInfoSync() in production
    return { platform: 'wechat_minigame', version: '0.0.1', screenWidth: 375, screenHeight: 667 };
  }
}
