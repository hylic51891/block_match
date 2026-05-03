import type { SpecialType } from './board';

export type ObstacleConfig = {
  x: number;
  y: number;
  type: 'rock';
};

export type PollutionConfig = {
  enabled: boolean;
  durationTurns: number;
};

export type TargetConfig = {
  type: 'clear_all';
};

export type LevelConfig = {
  id: string;
  name: string;
  width: number;
  height: number;
  tileTypes: string[];
  /** Special tile types: S = phase, T = purify */
  specialTypes: Array<SpecialType>;
  /** Number of pairs per special type (default: 1) */
  specialPairsPerType?: number;
  fillBoard: boolean;
  obstacles: ObstacleConfig[];
  pollution: PollutionConfig;
  shuffleLimit: number;
  target: TargetConfig;
  hintLimit?: number;
  /** Time limit in seconds (undefined = no limit) */
  timeLimit?: number;
  tutorial?: {
    title?: string;
    message?: string;
  };
};
