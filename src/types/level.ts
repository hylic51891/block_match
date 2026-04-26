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
  /** Special tile types that can pass through pollution and get one extra turn */
  specialTypes: string[];
  fillBoard: boolean;
  obstacles: ObstacleConfig[];
  pollution: PollutionConfig;
  shuffleLimit: number;
  target: TargetConfig;
  tutorial?: {
    title?: string;
    message?: string;
  };
};
