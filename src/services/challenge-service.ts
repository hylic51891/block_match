import type { IChallengeService } from './types';
import type { IPlatformAdapter } from '@/platform/types';
import type { BattleResult, ChallengeDate, LocalProgress, DailyChallengeRecord } from '@/types/challenge';
import type { LevelConfig } from '@/types/level';
import { getTutorialLevelConfig } from '@/core/challenge/tutorial-provider';
import { getDailyChallengeConfig, getTodayDate } from '@/core/challenge/daily-provider';
import { telemetry } from '@/infra/telemetry';

export class ChallengeService implements IChallengeService {
  private platform: IPlatformAdapter;

  constructor(platform: IPlatformAdapter) {
    this.platform = platform;
  }

  async getDailyConfig(date: ChallengeDate): Promise<LevelConfig> {
    const remote = await this.platform.remoteConfig.getDailyConfig(date);
    if (remote) return remote;
    return getDailyChallengeConfig(date);
  }

  getTutorialConfig(): LevelConfig {
    return getTutorialLevelConfig();
  }

  saveResult(result: BattleResult): boolean {
    const progress = this.platform.storage.getLocalProgress();

    if (result.mode === 'tutorial' && result.success) {
      this.platform.storage.setLocalProgress({
        ...progress,
        tutorialCompleted: true,
      });
    }

    if (result.mode === 'daily_challenge' && result.challengeDate) {
      const existing = progress.dailyBest?.[result.challengeDate];
      let isBest = false;

      if (!existing) {
        isBest = true;
      } else if (result.success && (!existing.success || result.durationMs < existing.durationMs)) {
        isBest = true;
      }

      if (isBest) {
        const record: DailyChallengeRecord = {
          challengeDate: result.challengeDate,
          success: result.success,
          durationMs: result.durationMs,
          shuffleUsed: result.shuffleUsed,
          reviveUsed: result.reviveUsed,
          hintUsed: result.hintUsed,
          completedAt: Date.now(),
        };
        this.platform.storage.setLocalProgress({
          ...progress,
          dailyBest: { ...progress.dailyBest, [result.challengeDate]: record },
          lastChallengeDate: result.challengeDate,
        });

        if (result.success) {
          telemetry.track('daily_best_updated', { date: result.challengeDate, durationMs: result.durationMs });
        }
      }
      return isBest;
    }
    return false;
  }

  getLocalProgress(): LocalProgress {
    return this.platform.storage.getLocalProgress();
  }

  setLocalProgress(progress: LocalProgress): void {
    this.platform.storage.setLocalProgress(progress);
  }

  getTodayBest(): DailyChallengeRecord | null {
    const today = getTodayDate();
    const progress = this.platform.storage.getLocalProgress();
    return progress.dailyBest?.[today] ?? null;
  }

  isTutorialCompleted(): boolean {
    return this.platform.storage.getLocalProgress().tutorialCompleted;
  }

  markTutorialComplete(): void {
    const progress = this.platform.storage.getLocalProgress();
    this.platform.storage.setLocalProgress({
      ...progress,
      tutorialCompleted: true,
    });
    telemetry.track('tutorial_complete', {});
  }
}
