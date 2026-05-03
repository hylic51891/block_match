import type { LevelConfig } from '@/types/level';

export interface IRemoteChallengeConfig {
  getDailyConfig(date: string): Promise<LevelConfig | null>;
}
