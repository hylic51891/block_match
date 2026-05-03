import type { IStorageRepository } from '@/infra/storage/types';
import type { IShareService } from '@/infra/share/types';
import type { IAdService } from '@/infra/ad/types';
import type { ILeaderboardService } from '@/infra/leaderboard/types';
import type { IRemoteChallengeConfig } from '@/infra/remote-config/types';

export type PlatformType = 'web' | 'wechat_minigame';

export interface IPlatformAdapter {
  readonly type: PlatformType;
  readonly storage: IStorageRepository;
  readonly share: IShareService;
  readonly ad: IAdService;
  readonly leaderboard: ILeaderboardService;
  readonly remoteConfig: IRemoteChallengeConfig;
  onShow?(callback: () => void): void;
  onHide?(callback: () => void): void;
  getSystemInfo(): { platform: string; version: string; screenWidth: number; screenHeight: number };
}
