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

export interface IStorageRepository {
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
}
