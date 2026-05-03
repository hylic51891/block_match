import type { IRewardAdService } from './types';
import type { IPlatformAdapter } from '@/platform/types';
import { telemetry } from '@/infra/telemetry';

export class RewardAdService implements IRewardAdService {
  private platform: IPlatformAdapter;

  constructor(platform: IPlatformAdapter) {
    this.platform = platform;
  }

  async showRewardedAd(): Promise<boolean> {
    telemetry.track('rewarded_ad_offer_shown', {});
    try {
      const result = await this.platform.ad.showRewardedAd();
      telemetry.track(result ? 'rewarded_ad_complete' : 'rewarded_ad_fail', {});
      return result;
    } catch (e) {
      telemetry.track('rewarded_ad_fail', { error: String(e) });
      return false;
    }
  }
}
