import type { BattleResult } from '@/types/challenge';

export interface IShareService {
  shareResult(result: BattleResult): void;
}
