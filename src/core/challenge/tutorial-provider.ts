import type { LevelConfig } from '@/types/level';
import { getTutorialParams } from '@/core/config/game-balance';

/**
 * Provides a fixed tutorial level configuration.
 * Uses game-balance parameters for consistent tuning.
 */
export function getTutorialLevelConfig(): LevelConfig {
  const p = getTutorialParams();

  return {
    id: 'tutorial',
    name: '教学关',
    width: p.boardWidth,
    height: p.boardHeight,
    tileTypes: [...p.tileTypes],
    specialTypes: [...p.specialTypes],
    specialPairsPerType: p.specialPairsPerType,
    fillBoard: true,
    obstacles: [],
    pollution: { enabled: p.pollutionEnabled, durationTurns: p.pollutionDurationTurns },
    shuffleLimit: p.shuffleLimit,
    hintLimit: p.hintLimit,
    timeLimit: p.timeLimit > 0 ? p.timeLimit : undefined,
    target: { type: 'clear_all' },
    tutorial: {
      title: '欢迎',
      message: '点击两个相同图块配对消除，路径最多2折。灵能图块S(粉红)可穿污染且多1折，T(翠绿)匹配后清除周围污染。',
    },
  };
}
