import type { BattleResult, GameMode } from '@/types/challenge';

export type SharePayload = {
  title: string;
  description: string;
  imageUrl?: string;
  result: BattleResult;
  challengeDate?: string;
  mode: GameMode;
  wechat?: {
    templateId?: string;
    path?: string;
    imageUrl?: string;
  };
};

export interface IShareService {
  shareResult(result: BattleResult): void;
  sharePayload(payload: SharePayload): void;
}
