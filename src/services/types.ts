import type { BattleResult, ChallengeDate, LocalProgress, DailyChallengeRecord } from '@/types/challenge';
import type { LevelConfig } from '@/types/level';

export interface IChallengeService {
  getDailyConfig(date: ChallengeDate): Promise<LevelConfig>;
  getTutorialConfig(): LevelConfig;
  saveResult(result: BattleResult): boolean;
  getLocalProgress(): LocalProgress;
  setLocalProgress(progress: LocalProgress): void;
  getTodayBest(): DailyChallengeRecord | null;
  isTutorialCompleted(): boolean;
  markTutorialComplete(): void;
}

export interface IRewardAdService {
  showRewardedAd(): Promise<boolean>;
}

export interface IShareService {
  shareResult(result: BattleResult): void;
}

export interface IAuthService {
  isLoggedIn(): boolean;
  getUserId(): string | null;
  login(): Promise<string>;
}

export interface ILeaderboardService {
  submitScore(date: ChallengeDate, score: number): void;
  getTopN(n: number): Array<{ date: string; score: number; rank: number }>;
}

export interface IGameService {
  challenge: IChallengeService;
  rewardAd: IRewardAdService;
  share: IShareService;
  auth: IAuthService;
  leaderboard: ILeaderboardService;
}
