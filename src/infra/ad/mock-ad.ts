import type { IAdService } from './types';

export class MockAdService implements IAdService {
  async showRewardedAd(): Promise<boolean> {
    console.log('[MockAd] showing rewarded ad, auto-resolving true');
    return true;
  }
}
