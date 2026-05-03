import type { ChallengeDate, DailyChallengeRecord } from '@/types/challenge';

export type UserProgress = {
  currentLevelId: string;
  unlockedLevelCount: number;
  totalStar: number;
  updatedAt: string;
};

export type LevelRecord = {
  levelId: string;
  bestScore: number;
  bestStar: number;
  successCount: number;
  failCount: number;
  lastPlayAt: string | null;
};

export type MatchLog = {
  levelId: string;
  result: 'success' | 'failed';
  durationMs: number;
  moveCount: number;
  shuffleUsed: number;
  createdAt: string;
};

export type TelemetryEvent = {
  event: string;
  timestamp: number;
  payload?: Record<string, unknown>;
};

export type LocalProgress = {
  tutorialCompleted: boolean;
  lastChallengeDate?: ChallengeDate;
  dailyBest?: Record<ChallengeDate, DailyChallengeRecord>;
  settings: { audioEnabled: boolean };
};

export interface IStorageRepository {
  // Legacy (kept for compatibility)
  getUserProgress(): UserProgress | null;
  setUserProgress(progress: UserProgress): void;

  getLevelRecord(levelId: string): LevelRecord | null;
  setLevelRecord(levelId: string, record: LevelRecord): void;
  getAllLevelRecords(): Record<string, LevelRecord>;

  addMatchLog(log: MatchLog): void;
  getMatchLogs(limit?: number): MatchLog[];

  addEventLog(event: TelemetryEvent): void;
  getEventLogs(limit?: number): TelemetryEvent[];

  getSavedGame(): unknown | null;
  setSavedGame(state: unknown): void;
  clearSavedGame(): void;

  // New: challenge-based progress
  getLocalProgress(): LocalProgress;
  setLocalProgress(progress: LocalProgress): void;
}
