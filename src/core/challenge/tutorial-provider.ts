import type { LevelConfig } from '@/types/level';

/**
 * Provides a fixed tutorial level configuration.
 * Small board, few types, no obstacles, pollution for demo only.
 */
export function getTutorialLevelConfig(): LevelConfig {
  return {
    id: 'tutorial',
    name: '教学关',
    width: 6,
    height: 6,
    tileTypes: ['A', 'B', 'C', 'D'],
    specialTypes: ['S', 'T'],
    fillBoard: true,
    obstacles: [],
    pollution: { enabled: true, durationTurns: 2 },
    shuffleLimit: 3,
    hintLimit: 99,
    target: { type: 'clear_all' },
    tutorial: {
      title: '欢迎',
      message: '点击两个相同图块配对消除，路径最多2折。灵能图块S(粉红)可穿污染且多1折，T(翠绿)匹配后清除周围污染。',
    },
  };
}
