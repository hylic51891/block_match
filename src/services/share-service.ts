import type { IShareService as IBusinessShareService } from './types';
import type { IPlatformAdapter } from '@/platform/types';
import type { BattleResult, GameMode } from '@/types/challenge';
import type { SharePayload } from '@/infra/share/types';

const TITLE_TEMPLATES: Record<GameMode, { success: string; fail: string }> = {
  tutorial: { success: '我学会了回路连连看！', fail: '教学关失败' },
  daily_challenge: { success: '回路连连看 - 今日通关！', fail: '今天的挑战有点难' },
};

const DESC_TEMPLATES: Record<GameMode, { success: string; fail: string }> = {
  tutorial: { success: '路径配对+污染封路，来试试？', fail: '再来一次！' },
  daily_challenge: { success: '用时{duration}秒，你能更快吗？', fail: '回路连连看，你行你来？' },
};

export class ShareService implements IBusinessShareService {
  private platform: IPlatformAdapter;

  constructor(platform: IPlatformAdapter) {
    this.platform = platform;
  }

  shareResult(result: BattleResult): void {
    const payload = this.buildPayload(result);
    this.platform.share.sharePayload(payload);
  }

  private buildPayload(result: BattleResult): SharePayload {
    const durationSec = Math.round(result.durationMs / 1000);
    const key = result.success ? 'success' : 'fail';
    const title = TITLE_TEMPLATES[result.mode][key];
    const descTemplate = DESC_TEMPLATES[result.mode][key];
    const description = descTemplate.replace('{duration}', String(durationSec));

    return {
      title,
      description,
      result,
      challengeDate: result.challengeDate,
      mode: result.mode,
    };
  }
}
