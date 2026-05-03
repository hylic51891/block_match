import type { LevelConfig } from '@/types/level';
import type { ChallengeDate } from '@/types/challenge';
import type { ObstacleConfig } from '@/types/level';

/**
 * Simple deterministic hash from date string.
 * Same date → same config (pure function, no randomness).
 */
function hashDate(date: ChallengeDate): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    const ch = date.charCodeAt(i)!;
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return Math.abs(hash);
}

/**
 * Seeded pseudo-random number generator (LCG).
 * Returns a function that produces numbers in [0, 1).
 */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

/** Predefined obstacle layout patterns for variety */
const OBSTACLE_PATTERNS: Array<Array<ObstacleConfig>> = [
  [{ x: 3, y: 3, type: 'rock' }, { x: 4, y: 4, type: 'rock' }, { x: 5, y: 5, type: 'rock' }],
  [{ x: 1, y: 1, type: 'rock' }, { x: 6, y: 6, type: 'rock' }, { x: 3, y: 4, type: 'rock' }],
  [{ x: 2, y: 2, type: 'rock' }, { x: 5, y: 5, type: 'rock' }, { x: 4, y: 1, type: 'rock' }, { x: 1, y: 6, type: 'rock' }],
  [{ x: 0, y: 3, type: 'rock' }, { x: 7, y: 4, type: 'rock' }, { x: 3, y: 0, type: 'rock' }, { x: 4, y: 7, type: 'rock' }],
  [{ x: 2, y: 1, type: 'rock' }, { x: 7, y: 6, type: 'rock' }, { x: 3, y: 4, type: 'rock' }],
  [{ x: 4, y: 3, type: 'rock' }, { x: 5, y: 4, type: 'rock' }, { x: 0, y: 0, type: 'rock' }, { x: 9, y: 7, type: 'rock' }],
  [{ x: 3, y: 2, type: 'rock' }, { x: 6, y: 5, type: 'rock' }, { x: 9, y: 3, type: 'rock' }, { x: 2, y: 8, type: 'rock' }, { x: 7, y: 1, type: 'rock' }],
  [{ x: 1, y: 4, type: 'rock' }, { x: 8, y: 2, type: 'rock' }, { x: 5, y: 7, type: 'rock' }, { x: 4, y: 9, type: 'rock' }, { x: 9, y: 5, type: 'rock' }],
];

const TILE_TYPE_POOLS = [
  ['A', 'B', 'C', 'D', 'E', 'F'],
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
];

/**
 * Generates a daily challenge LevelConfig based on the date.
 * Pure function: same date always returns same config.
 */
export function getDailyChallengeConfig(date: ChallengeDate): LevelConfig {
  const hash = hashDate(date);
  const rng = seededRandom(hash);

  // Pick board size: 10x8 or 12x10
  const sizes: Array<[number, number]> = [[10, 8], [12, 10]];
  const [width, height] = sizes[Math.floor(rng() * sizes.length)]!;

  // Pick tile type pool (6~8 types)
  const tileTypes = TILE_TYPE_POOLS[Math.floor(rng() * TILE_TYPE_POOLS.length)]!;

  // Pick obstacle pattern (adjust coords if needed for board size)
  const obstacleBase = OBSTACLE_PATTERNS[Math.floor(rng() * OBSTACLE_PATTERNS.length)]!;
  const obstacles = obstacleBase.filter((o) => o.x < width && o.y < height);

  // Pollution: always enabled, duration 3~4 turns
  const durationTurns = rng() > 0.5 ? 3 : 4;

  // Special types: always include both S and T, 2 pairs each
  const specialTypes: Array<'S' | 'T'> = ['S', 'T'];
  const specialPairsPerType = 2;

  return {
    id: `daily-${date}`,
    name: `今日挑战 ${date}`,
    width,
    height,
    tileTypes,
    specialTypes,
    specialPairsPerType,
    fillBoard: true,
    obstacles,
    pollution: { enabled: true, durationTurns },
    shuffleLimit: 1,
    hintLimit: 0,
    timeLimit: 180,
    target: { type: 'clear_all' },
  };
}

/** Get today's date in YYYY-MM-DD format */
export function getTodayDate(): ChallengeDate {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
