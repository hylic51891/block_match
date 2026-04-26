import type { LevelConfig } from '@/types/level';

function makeLevel(
  id: number,
  name: string,
  width: number,
  height: number,
  tileTypes: string[],
  specialTypes: string[],
  obstacles: LevelConfig['obstacles'],
  pollution: LevelConfig['pollution'],
  shuffleLimit: number,
  tutorial?: LevelConfig['tutorial'],
): LevelConfig {
  return {
    id: `level-${String(id).padStart(3, '0')}`,
    name, width, height, tileTypes, specialTypes, fillBoard: true,
    obstacles, pollution, shuffleLimit, target: { type: 'clear_all' }, tutorial,
  };
}

export const LEVEL_CONFIGS: Record<string, LevelConfig> = {
  // Levels 1-3: 6x6, 4 types, no obstacle, no pollution
  'level-001': makeLevel(1, '初识连线', 6, 6, ['A', 'B', 'C', 'D'], [], [], { enabled: false, durationTurns: 0 }, 3, { title: '欢迎', message: '点击两个相同图块，如果可以连通则消除' }),
  'level-002': makeLevel(2, '简单配对', 6, 6, ['A', 'B', 'C', 'D'], [], [], { enabled: false, durationTurns: 0 }, 3),
  'level-003': makeLevel(3, '初试身手', 6, 6, ['A', 'B', 'C', 'D'], [], [], { enabled: false, durationTurns: 0 }, 3),

  // Levels 4-5: 6x8, 5 types, no obstacle
  'level-004': makeLevel(4, '扩大战场', 6, 8, ['A', 'B', 'C', 'D', 'E'], [], [], { enabled: false, durationTurns: 0 }, 3),
  'level-005': makeLevel(5, '更多配对', 6, 8, ['A', 'B', 'C', 'D', 'E'], [], [], { enabled: false, durationTurns: 0 }, 3),

  // Levels 6-7: 8x8, 5 types, with obstacles
  'level-006': makeLevel(6, '障碍初现', 8, 8, ['A', 'B', 'C', 'D', 'E'], [], [{ x: 3, y: 3, type: 'rock' }, { x: 4, y: 4, type: 'rock' }], { enabled: false, durationTurns: 0 }, 3),
  'level-007': makeLevel(7, '绕路而行', 8, 8, ['A', 'B', 'C', 'D', 'E'], [], [{ x: 1, y: 1, type: 'rock' }, { x: 6, y: 6, type: 'rock' }, { x: 4, y: 3, type: 'rock' }], { enabled: false, durationTurns: 0 }, 3),

  // Levels 8-10: 8x8, 6 types, more obstacles
  'level-008': makeLevel(8, '步步为营', 8, 8, ['A', 'B', 'C', 'D', 'E', 'F'], [], [{ x: 0, y: 0, type: 'rock' }, { x: 7, y: 7, type: 'rock' }, { x: 3, y: 4, type: 'rock' }], { enabled: false, durationTurns: 0 }, 2),
  'level-009': makeLevel(9, '迷宫初成', 8, 8, ['A', 'B', 'C', 'D', 'E', 'F'], [], [{ x: 2, y: 2, type: 'rock' }, { x: 5, y: 5, type: 'rock' }, { x: 4, y: 1, type: 'rock' }, { x: 1, y: 6, type: 'rock' }], { enabled: false, durationTurns: 0 }, 2),
  'level-010': makeLevel(10, '策略之始', 8, 8, ['A', 'B', 'C', 'D', 'E', 'F'], [], [{ x: 0, y: 3, type: 'rock' }, { x: 7, y: 4, type: 'rock' }, { x: 3, y: 0, type: 'rock' }, { x: 4, y: 7, type: 'rock' }], { enabled: false, durationTurns: 0 }, 2),

  // Levels 11-12: 8x8, 6 types, pollution enabled
  'level-011': makeLevel(11, '污染来袭', 8, 8, ['A', 'B', 'C', 'D', 'E', 'F'], [], [{ x: 2, y: 2, type: 'rock' }, { x: 5, y: 5, type: 'rock' }], { enabled: true, durationTurns: 2 }, 2, { title: '新机制', message: '消除路径上的空格会被污染，2回合后恢复' }),
  'level-012': makeLevel(12, '封路挑战', 8, 8, ['A', 'B', 'C', 'D', 'E', 'F'], [], [{ x: 1, y: 1, type: 'rock' }, { x: 6, y: 6, type: 'rock' }, { x: 3, y: 4, type: 'rock' }], { enabled: true, durationTurns: 2 }, 2),

  // Levels 13-14: 8x8, 6 types, with special tiles (S)
  'level-013': makeLevel(13, '灵能初现', 8, 8, ['A', 'B', 'C', 'D', 'E', 'F'], ['S'], [{ x: 0, y: 0, type: 'rock' }, { x: 7, y: 7, type: 'rock' }, { x: 3, y: 3, type: 'rock' }], { enabled: true, durationTurns: 2 }, 2, { title: '灵能图块', message: 'S图块可以穿过污染格，且连线可多拐一次弯' }),
  'level-014': makeLevel(14, '灵能进阶', 8, 8, ['A', 'B', 'C', 'D', 'E', 'F'], ['S'], [{ x: 1, y: 2, type: 'rock' }, { x: 6, y: 5, type: 'rock' }, { x: 4, y: 0, type: 'rock' }], { enabled: true, durationTurns: 2 }, 2),

  // Levels 15-16: 10x8, 6 types, special + more obstacles
  'level-015': makeLevel(15, '大型战场', 10, 8, ['A', 'B', 'C', 'D', 'E', 'F'], ['S'], [{ x: 4, y: 3, type: 'rock' }, { x: 5, y: 4, type: 'rock' }, { x: 0, y: 0, type: 'rock' }, { x: 9, y: 7, type: 'rock' }], { enabled: true, durationTurns: 2 }, 2),
  'level-016': makeLevel(16, '步步惊心', 10, 8, ['A', 'B', 'C', 'D', 'E', 'F'], ['S'], [{ x: 2, y: 1, type: 'rock' }, { x: 7, y: 6, type: 'rock' }, { x: 3, y: 4, type: 'rock' }, { x: 6, y: 3, type: 'rock' }], { enabled: true, durationTurns: 2 }, 1),

  // Levels 17-18: 10x10, 7 types, special
  'level-017': makeLevel(17, '深入迷局', 10, 10, ['A', 'B', 'C', 'D', 'E', 'F', 'G'], ['S'], [{ x: 4, y: 4, type: 'rock' }, { x: 5, y: 5, type: 'rock' }, { x: 0, y: 9, type: 'rock' }, { x: 9, y: 0, type: 'rock' }, { x: 2, y: 7, type: 'rock' }], { enabled: true, durationTurns: 2 }, 1),
  'level-018': makeLevel(18, '艰难突围', 10, 10, ['A', 'B', 'C', 'D', 'E', 'F', 'G'], ['S', 'T'], [{ x: 1, y: 1, type: 'rock' }, { x: 8, y: 8, type: 'rock' }, { x: 3, y: 5, type: 'rock' }, { x: 6, y: 2, type: 'rock' }, { x: 5, y: 7, type: 'rock' }], { enabled: true, durationTurns: 3 }, 1),

  // Levels 19-20: 12x10, 8 types, 2 special types, hardest
  'level-019': makeLevel(19, '终极迷阵', 12, 10, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], ['S', 'T'], [{ x: 5, y: 4, type: 'rock' }, { x: 6, y: 5, type: 'rock' }, { x: 0, y: 0, type: 'rock' }, { x: 11, y: 9, type: 'rock' }, { x: 3, y: 7, type: 'rock' }, { x: 8, y: 2, type: 'rock' }], { enabled: true, durationTurns: 3 }, 1),
  'level-020': makeLevel(20, '最终挑战', 12, 10, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], ['S', 'T'], [{ x: 1, y: 0, type: 'rock' }, { x: 10, y: 9, type: 'rock' }, { x: 0, y: 5, type: 'rock' }, { x: 11, y: 4, type: 'rock' }, { x: 5, y: 5, type: 'rock' }, { x: 6, y: 4, type: 'rock' }], { enabled: true, durationTurns: 3 }, 1),
};
