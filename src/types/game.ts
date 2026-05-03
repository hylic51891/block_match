import type { Point } from './common';
import type { GameMode, ChallengeDate } from './challenge';

export type GameStatus =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'checking'
  | 'success'
  | 'failed';

export type FailReason = 'deadlock' | 'pollution_blocked' | 'no_shuffle' | 'timeout' | 'manual' | 'unknown';

export type ReviveState = 'none' | 'offered' | 'ad_watching' | 'revived';

export type PathFailReason =
  | 'no_path'
  | 'too_many_turns'
  | 'blocked_by_obstacle'
  | 'blocked_by_tile'
  | 'blocked_by_pollution'
  | 'different_types';

export type PathResult =
  | { found: true; path: Point[]; turns: number }
  | { found: false; reason: PathFailReason };

export type MatchAttemptResult =
  | { success: true; path: Point[]; turns: number; tileAId: string; tileBId: string }
  | { success: false; reason: PathFailReason | 'different_types' | 'not_active' };

export type GameRuntimeState = {
  levelId: string;
  board: import('./board').BoardState;
  selectedTileId: string | null;
  turn: number;
  shuffleRemaining: number;
  hintRemaining: number;
  matchCount: number;
  status: GameStatus;
  failReason?: FailReason;
  lastPath: Point[];
  levelStartTime: number;
  mode: GameMode;
  challengeDate?: ChallengeDate;
  /** Time limit in seconds (0 or undefined = no limit) */
  timeLimit: number;
  reviveState: ReviveState;
  reviveUsed: number;
};
