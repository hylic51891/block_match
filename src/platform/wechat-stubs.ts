import type { IStorageRepository, UserProgress, LevelRecord, MatchLog, TelemetryEvent, LocalProgress } from '@/infra/storage/types';
import type { IShareService, SharePayload } from '@/infra/share/types';
import type { BattleResult } from '@/types/challenge';
import type { IAdService } from '@/infra/ad/types';
import type { ILeaderboardService } from '@/infra/leaderboard/types';
import type { IRemoteChallengeConfig } from '@/infra/remote-config/types';

/**
 * WeChat storage stub.
 * In production: delegates to wx.getStorageSync / wx.setStorageSync
 */
export class WeChatStorageStub implements IStorageRepository {
  private data = new Map<string, unknown>();

  getUserProgress(): UserProgress | null { return this.data.get('user_progress') as UserProgress | null; }
  setUserProgress(progress: UserProgress): void { this.data.set('user_progress', progress); }
  getLevelRecord(levelId: string): LevelRecord | null { return (this.data.get('level_records') as Record<string, LevelRecord> | undefined)?.[levelId] ?? null; }
  setLevelRecord(levelId: string, record: LevelRecord): void {
    const records = (this.data.get('level_records') as Record<string, LevelRecord>) ?? {};
    records[levelId] = record;
    this.data.set('level_records', records);
  }
  getAllLevelRecords(): Record<string, LevelRecord> { return (this.data.get('level_records') as Record<string, LevelRecord>) ?? {}; }
  addMatchLog(log: MatchLog): void { console.log('[WeChatStorage] addMatchLog', log); }
  getMatchLogs(_limit?: number): MatchLog[] { return []; }
  addEventLog(event: TelemetryEvent): void { console.log('[WeChatStorage] addEventLog', event); }
  getEventLogs(_limit?: number): TelemetryEvent[] { return []; }
  getSavedGame(): unknown | null { return this.data.get('saved_game'); }
  setSavedGame(state: unknown): void { this.data.set('saved_game', state); }
  clearSavedGame(): void { this.data.delete('saved_game'); }
  getLocalProgress(): LocalProgress { return (this.data.get('local_progress') as LocalProgress) ?? { tutorialCompleted: false, settings: { audioEnabled: true } }; }
  setLocalProgress(progress: LocalProgress): void { this.data.set('local_progress', progress); }
}

/**
 * WeChat share stub.
 * In production: delegates to wx.shareAppMessage / wx.onShareAppMessage
 */
export class WeChatShareStub implements IShareService {
  shareResult(result: BattleResult): void {
    console.log('[WeChatShare] shareResult', result);
  }
  sharePayload(payload: SharePayload): void {
    // wx.shareAppMessage({ title: payload.title, desc: payload.description, ... }) in production
    console.log('[WeChatShare] sharePayload', payload.title, payload.description);
  }
}

/**
 * WeChat ad stub.
 * In production: delegates to wx.createRewardedVideoAd
 */
export class WeChatAdStub implements IAdService {
  async showRewardedAd(): Promise<boolean> {
    // wx.createRewardedVideoAd({ adUnitId: 'xxx' }) in production
    console.log('[WeChatAd] showRewardedAd (stub, returning true)');
    return true;
  }
}

/**
 * WeChat leaderboard stub.
 * In production: delegates to open data domain
 */
export class WeChatLeaderboardStub implements ILeaderboardService {
  submitScore(date: string, score: number): void {
    console.log('[WeChatLeaderboard] submitScore', { date, score });
  }
  getTopN(n: number): Array<{ date: string; score: number; rank: number }> {
    return Array.from({ length: Math.min(n, 3) }, (_, i) => ({
      date: '2025-01-01', score: 100 - i * 10, rank: i + 1,
    }));
  }
}

/**
 * WeChat remote config stub.
 * In production: delegates to cloud function or HTTP
 */
export class WeChatRemoteConfigStub implements IRemoteChallengeConfig {
  async getDailyConfig(date: string): Promise<import('@/types/level').LevelConfig | null> {
    console.log('[WeChatRemoteConfig] getDailyConfig (stub, returning null)', date);
    return null;
  }
}
