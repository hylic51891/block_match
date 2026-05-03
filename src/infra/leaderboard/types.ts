export interface ILeaderboardService {
  submitScore(date: string, score: number): void;
  getTopN(n: number): Array<{ date: string; score: number; rank: number }>;
}
