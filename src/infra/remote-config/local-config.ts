import type { IRemoteChallengeConfig } from './types';
import type { LevelConfig } from '@/types/level';
import { getDailyChallengeConfig } from '@/core/challenge/daily-provider';

/**
 * Local implementation that falls back to DailyChallengeProvider.
 * When remote config is available, this can be replaced.
 */
export class LocalChallengeConfig implements IRemoteChallengeConfig {
  async getDailyConfig(date: string): Promise<LevelConfig | null> {
    return getDailyChallengeConfig(date);
  }
}
