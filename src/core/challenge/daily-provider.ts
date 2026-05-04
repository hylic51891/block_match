import type { LevelConfig } from '@/types/level';
import type { ChallengeDate } from '@/types/challenge';
import type { ObstacleConfig } from '@/types/level';
import { getDailyParams } from '@/core/config/game-balance';

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

/**
 * Generate obstacle positions using seeded RNG and obstacleRatio.
 * Guarantees obstacle count is even so that remaining slots can be fully
 * filled with paired tiles.
 */
function generateObstacles(
  width: number,
  height: number,
  obstacleRatio: number,
  rng: () => number,
): ObstacleConfig[] {
  const total = width * height;
  let count = Math.floor(total * obstacleRatio);
  // Ensure even count: odd → round down to even
  if (count % 2 !== 0) count--;

  if (count <= 0) return [];

  // Build shuffled position list using seeded RNG
  const positions: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      positions.push({ x, y });
    }
  }

  // Fisher-Yates shuffle with seeded RNG
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j]!, positions[i]!];
  }

  const obstacles: ObstacleConfig[] = [];
  for (let i = 0; i < count; i++) {
    const pos = positions[i]!;
    obstacles.push({ x: pos.x, y: pos.y, type: 'rock' });
  }

  return obstacles;
}

/**
 * Generates a daily challenge LevelConfig based on the date.
 * Uses game-balance parameters (can be overridden via remote config).
 */
export function getDailyChallengeConfig(date: ChallengeDate): LevelConfig {
  const p = getDailyParams();
  const hash = hashDate(date);
  const rng = seededRandom(hash);

  const width = p.boardWidth;
  const height = p.boardHeight;

  // Generate obstacles from ratio + seeded RNG (even count guaranteed)
  const obstacles = generateObstacles(width, height, p.obstacleRatio, rng);

  // Pollution duration with daily variation
  const durationVariants = [p.pollutionDurationTurns, p.pollutionDurationTurns + 1];
  const pollutionDurationTurns = durationVariants[Math.floor(rng() * durationVariants.length)]!;

  return {
    id: `daily-${date}`,
    name: `今日挑战 ${date}`,
    width,
    height,
    tileTypes: [...p.tileTypes],
    specialTypes: [...p.specialTypes],
    specialPairsPerType: p.specialPairsPerType,
    fillBoard: true,
    obstacles,
    pollution: { enabled: p.pollutionEnabled, durationTurns: pollutionDurationTurns },
    shuffleLimit: p.shuffleLimit,
    hintLimit: p.hintLimit,
    timeLimit: p.timeLimit > 0 ? p.timeLimit : undefined,
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
