export type GameMode = 'tutorial' | 'daily_challenge';

export type ChallengeDate = string; // YYYY-MM-DD

export type DailyChallengeRecord = {
  challengeDate: ChallengeDate;
  success: boolean;
  durationMs: number;
  shuffleUsed: number;
  reviveUsed: number;
  hintUsed: number;
  completedAt: number;
};

export type LocalProgress = {
  tutorialCompleted: boolean;
  lastChallengeDate?: ChallengeDate;
  dailyBest?: Record<ChallengeDate, DailyChallengeRecord>;
  settings: { audioEnabled: boolean };
};

export type BattleResult = {
  mode: GameMode;
  success: boolean;
  durationMs: number;
  shuffleUsed: number;
  reviveUsed: number;
  hintUsed: number;
  challengeDate?: ChallengeDate;
};
