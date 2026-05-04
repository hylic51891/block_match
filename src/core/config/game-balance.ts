/**
 * 游戏参数配置 — 数据驱动，支持 JSON 热更新
 *
 * 所有可调参数集中在此，可由微信后台 remote config 覆盖。
 * 不再使用"简单/普通/困难"档位，改为数值化难度。
 */

import type { SpecialType } from '@/types/board';

// ─── 参数类型 ────────────────────────────────────────────

/** 一份完整的游戏参数，可直接 JSON 序列化/反序列化 */
export type GameParams = {
  /** 棋盘宽度（格数） */
  boardWidth: number;
  /** 棋盘高度（格数） */
  boardHeight: number;
  /** 图块类型池，如 ["A","B","C","D","E","F"] */
  tileTypes: string[];
  /** 特殊图块类型，如 ["S","T"] */
  specialTypes: Array<SpecialType>;
  /** 每种特殊图块的对数 */
  specialPairsPerType: number;
  /** 障碍物占棋盘面积比例 [0, 1) */
  obstacleRatio: number;
  /** 污染是否开启 */
  pollutionEnabled: boolean;
  /** 污染持续回合数 */
  pollutionDurationTurns: number;
  /** 灵能轨迹持续回合数（视觉） */
  spiritTrailDurationTurns: number;
  /** 重排次数 */
  shuffleLimit: number;
  /** 重排是否清除全部污染 */
  shuffleClearsPollution: boolean;
  /** 提示次数 */
  hintLimit: number;
  /** 限时（秒），0 = 不限时 */
  timeLimit: number;
  /** 复活最大次数 */
  reviveMaxPerGame: number;
  /** 复活后奖励时间（秒） */
  reviveTimeBonus: number;
  /** 复活后奖励重排次数 */
  reviveShuffleBonus: number;
};

// ─── 默认参数 ────────────────────────────────────────────

/** 教程默认参数 */
export const DEFAULT_TUTORIAL_PARAMS: GameParams = {
  boardWidth: 6,
  boardHeight: 6,
  tileTypes: ['A', 'B', 'C', 'D'],
  specialTypes: ['S', 'T'],
  specialPairsPerType: 1,
  obstacleRatio: 0,
  pollutionEnabled: true,
  pollutionDurationTurns: 2,
  spiritTrailDurationTurns: 2,
  shuffleLimit: 3,
  shuffleClearsPollution: true,
  hintLimit: 99,
  timeLimit: 0,
  reviveMaxPerGame: 0,
  reviveTimeBonus: 60,
  reviveShuffleBonus: 1,
};

/** 每日挑战默认参数 */
export const DEFAULT_DAILY_PARAMS: GameParams = {
  boardWidth: 10,
  boardHeight: 16,
  tileTypes: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
  specialTypes: ['S', 'T'],
  specialPairsPerType: 6,
  obstacleRatio: 0.06,
  pollutionEnabled: true,
  pollutionDurationTurns: 3,
  spiritTrailDurationTurns: 2,
  shuffleLimit: 1,
  shuffleClearsPollution: true,
  hintLimit: 0,
  timeLimit: 300,
  reviveMaxPerGame: 1,
  reviveTimeBonus: 60,
  reviveShuffleBonus: 1,
};

// ─── 难度计算 ────────────────────────────────────────────

/**
 * 从 GameParams 计算数值难度。
 *
 * 综合考虑：棋盘面积、图块种类数、障碍比例、污染持续、限时、道具限制。
 * 返回值越大越难，范围大约 [0, 100]。
 */
export function computeDifficulty(p: GameParams): number {
  const area = p.boardWidth * p.boardHeight;

  // 棋盘面积贡献 (0~25)
  const areaScore = Math.min(area / 120 * 25, 25);

  // 图块种类贡献：种类越多，同种越少，越难找配对 (0~15)
  const typeScore = Math.min(p.tileTypes.length / 10 * 15, 15);

  // 障碍比例贡献 (0~10)
  const obstacleScore = p.obstacleRatio * 10 / 0.15 * 10;

  // 污染贡献 (0~15)
  const pollutionScore = p.pollutionEnabled
    ? Math.min(p.pollutionDurationTurns / 5 * 15, 15)
    : 0;

  // 道具惩罚：重排/提示越少越难 (0~20)
  const toolPenalty = (3 - Math.min(p.shuffleLimit, 3)) / 3 * 10
    + (2 - Math.min(p.hintLimit, 2)) / 2 * 10;

  // 限时惩罚 (0~15)：时间越短越难
  let timePenalty = 0;
  if (p.timeLimit > 0) {
    timePenalty = Math.max(0, 15 - p.timeLimit / 300 * 15);
  }

  return Math.round(
    areaScore + typeScore + obstacleScore + pollutionScore + toolPenalty + timePenalty,
  );
}

// ─── 当前生效参数 ────────────────────────────────────────

let _tutorialParams: GameParams = { ...DEFAULT_TUTORIAL_PARAMS };
let _dailyParams: GameParams = { ...DEFAULT_DAILY_PARAMS };

/** 获取教程参数 */
export function getTutorialParams(): GameParams {
  return _tutorialParams;
}

/** 获取每日挑战参数 */
export function getDailyParams(): GameParams {
  return _dailyParams;
}

/**
 * 从 JSON 对象更新教程参数（用于 remote config 覆盖）。
 * 缺失字段保留原值，不会破坏完整性。
 */
export function applyTutorialParams(override: Partial<GameParams>): void {
  _tutorialParams = { ..._tutorialParams, ...override };
}

/**
 * 从 JSON 对象更新每日挑战参数（用于 remote config 覆盖）。
 * 缺失字段保留原值，不会破坏完整性。
 */
export function applyDailyParams(override: Partial<GameParams>): void {
  _dailyParams = { ..._dailyParams, ...override };
}

/** 重置为默认参数（测试用） */
export function resetParams(): void {
  _tutorialParams = { ...DEFAULT_TUTORIAL_PARAMS };
  _dailyParams = { ...DEFAULT_DAILY_PARAMS };
}
