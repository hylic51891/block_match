import type { LevelConfig } from '@/types/level';
import { LEVEL_CONFIGS } from './level-data';

export function loadLevel(levelId: string): LevelConfig {
  const config = LEVEL_CONFIGS[levelId];
  if (!config) throw new Error(`Level not found: ${levelId}`);
  return config;
}

export function loadAllLevels(): LevelConfig[] {
  return Object.values(LEVEL_CONFIGS).sort((a, b) => {
    const numA = parseInt(a.id.replace('level-', ''), 10);
    const numB = parseInt(b.id.replace('level-', ''), 10);
    return numA - numB;
  });
}
