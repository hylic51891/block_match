import type { IStorageRepository, UserProgress, LevelRecord, MatchLog, TelemetryEvent } from './types';

const PREFIX = 'cl_';
const MAX_LOGS = 1000;

export class LocalStorageRepository implements IStorageRepository {
  private get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private set(key: string, value: unknown): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('[Storage] Failed to write', key, e);
    }
  }

  getUserProgress(): UserProgress | null {
    return this.get<UserProgress>('user_progress');
  }

  setUserProgress(progress: UserProgress): void {
    this.set('user_progress', progress);
  }

  getLevelRecord(levelId: string): LevelRecord | null {
    const records = this.get<Record<string, LevelRecord>>('level_records') ?? {};
    return records[levelId] ?? null;
  }

  setLevelRecord(levelId: string, record: LevelRecord): void {
    const records = this.get<Record<string, LevelRecord>>('level_records') ?? {};
    records[levelId] = record;
    this.set('level_records', records);
  }

  getAllLevelRecords(): Record<string, LevelRecord> {
    return this.get<Record<string, LevelRecord>>('level_records') ?? {};
  }

  addMatchLog(log: MatchLog): void {
    const logs = this.get<MatchLog[]>('match_logs') ?? [];
    logs.push(log);
    if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
    this.set('match_logs', logs);
  }

  getMatchLogs(limit: number = 50): MatchLog[] {
    const logs = this.get<MatchLog[]>('match_logs') ?? [];
    return logs.slice(-limit);
  }

  addEventLog(event: TelemetryEvent): void {
    const logs = this.get<TelemetryEvent[]>('event_logs') ?? [];
    logs.push(event);
    if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
    this.set('event_logs', logs);
  }

  getEventLogs(limit: number = 50): TelemetryEvent[] {
    const logs = this.get<TelemetryEvent[]>('event_logs') ?? [];
    return logs.slice(-limit);
  }

  getSavedGame(): unknown | null {
    return this.get('saved_game');
  }

  setSavedGame(state: unknown): void {
    this.set('saved_game', state);
  }

  clearSavedGame(): void {
    localStorage.removeItem(PREFIX + 'saved_game');
  }
}
