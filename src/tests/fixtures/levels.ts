import type { LevelConfig } from '@/types/level';

export const testLevelConfig: LevelConfig = {
  id: 'test-001',
  name: 'Test Level',
  width: 4,
  height: 4,
  tileTypes: ['A', 'B'],
  specialTypes: [],
  fillBoard: true,
  obstacles: [],
  pollution: { enabled: false, durationTurns: 0 },
  shuffleLimit: 3,
  target: { type: 'clear_all' },
};

export const testLevelWithPollution: LevelConfig = {
  id: 'test-002',
  name: 'Test Pollution',
  width: 4,
  height: 4,
  tileTypes: ['A', 'B'],
  specialTypes: [],
  fillBoard: true,
  obstacles: [],
  pollution: { enabled: true, durationTurns: 2 },
  shuffleLimit: 3,
  target: { type: 'clear_all' },
};
