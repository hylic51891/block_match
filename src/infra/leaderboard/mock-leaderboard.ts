import type { ILeaderboardService } from './types';

export class MockLeaderboardService implements ILeaderboardService {
  submitScore(date: string, score: number): void {
    console.log('[MockLeaderboard] submit score:', { date, score });
  }

  getTopN(n: number): Array<{ date: string; score: number; rank: number }> {
    return Array.from({ length: Math.min(n, 5) }, (_, i) => ({
      date: '2025-01-01',
      score: 100 - i * 10,
      rank: i + 1,
    }));
  }
}
