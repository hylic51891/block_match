import type { IGameService } from './types';
import type { IPlatformAdapter } from '@/platform/types';
import { ChallengeService } from './challenge-service';
import { RewardAdService } from './reward-ad-service';
import { ShareService } from './share-service';
import { AuthService } from './auth-service';
import { LeaderboardService } from './leaderboard-service';

let gameService: IGameService | null = null;

export function createGameService(platform: IPlatformAdapter): IGameService {
  if (gameService) return gameService;

  gameService = {
    challenge: new ChallengeService(platform),
    rewardAd: new RewardAdService(platform),
    share: new ShareService(platform),
    auth: new AuthService(platform),
    leaderboard: new LeaderboardService(platform),
  };

  return gameService;
}

export function getGameService(): IGameService {
  if (!gameService) {
    throw new Error('GameService not initialized. Call createGameService first.');
  }
  return gameService;
}

export function resetGameService(): void {
  gameService = null;
}

export type { IGameService, IChallengeService, IRewardAdService, IShareService, IAuthService, ILeaderboardService } from './types';
