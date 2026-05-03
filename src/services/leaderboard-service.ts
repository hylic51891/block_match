import type { ILeaderboardService } from './types';
import type { IPlatformAdapter } from '@/platform/types';
import type { ChallengeDate } from '@/types/challenge';

export class LeaderboardService implements ILeaderboardService {
  private platform: IPlatformAdapter;

  constructor(platform: IPlatformAdapter) {
    this.platform = platform;
  }

  submitScore(date: ChallengeDate, score: number): void {
    this.platform.leaderboard.submitScore(date, score);
  }

  getTopN(n: number): Array<{ date: string; score: number; rank: number }> {
    return this.platform.leaderboard.getTopN(n);
  }
}
