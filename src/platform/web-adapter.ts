import type { IPlatformAdapter } from './types';
import { LocalStorageRepository } from '@/infra/storage/local-storage-repo';
import { MockShareService } from '@/infra/share/mock-share';
import { MockAdService } from '@/infra/ad/mock-ad';
import { MockLeaderboardService } from '@/infra/leaderboard/mock-leaderboard';
import { LocalChallengeConfig } from '@/infra/remote-config/local-config';

export class WebAdapter implements IPlatformAdapter {
  readonly type = 'web' as const;
  readonly storage = new LocalStorageRepository();
  readonly share = new MockShareService();
  readonly ad = new MockAdService();
  readonly leaderboard = new MockLeaderboardService();
  readonly remoteConfig = new LocalChallengeConfig();

  onShow(callback: () => void): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') callback();
    });
  }

  onHide(callback: () => void): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') callback();
    });
  }

  getSystemInfo() {
    return {
      platform: navigator.userAgent,
      version: 'web-dev',
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    };
  }
}
