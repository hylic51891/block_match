import type { IShareService, SharePayload } from './types';
import type { BattleResult } from '@/types/challenge';

export class MockShareService implements IShareService {
  shareResult(result: BattleResult): void {
    console.log('[MockShare] share result:', result);
  }

  sharePayload(payload: SharePayload): void {
    console.log('[MockShare] share payload:', payload.title, payload.description);
  }
}
