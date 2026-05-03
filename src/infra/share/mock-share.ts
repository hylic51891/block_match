import type { IShareService } from './types';
import type { BattleResult } from '@/types/challenge';

export class MockShareService implements IShareService {
  shareResult(result: BattleResult): void {
    console.log('[MockShare] share result:', result);
  }
}
