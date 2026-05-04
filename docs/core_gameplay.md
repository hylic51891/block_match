# 回路连连看 — 核心玩法文档

> 本文档为项目开发基准，所有实现以此为准。

## 一、游戏概述

回路连连看是一款配对消除益智游戏，核心机制为**同型图块配对 + 有限转弯路径 + 污染封路**。

玩家在棋盘上选择两个相同类型的图块，若它们之间存在一条转弯次数受限的通路，则配对成功并消除。路径经过的空格会产生"污染"暂时封路，增加后续配对难度。游戏中还包含特殊图块提供增益效果。

## 二、棋盘与图块

### 2.1 棋盘结构

- 棋盘由 `width × height` 的网格组成
- 每个格子（Cell）有 5 种状态：
  - `empty` — 空格，可通行
  - `tile` — 有图块，不可通行
  - `obstacle` — 障碍物（岩石），永久不可通行
  - `pollution` — 污染，暂时不可通行
  - `spirit_trail` — 灵能轨迹，**可通行**（仅视觉效果）

### 2.2 图块

- 每个图块有一个类型标识（A/B/C/D/E/F/G/H）
- **所有图块必须成对出现**：总数为偶数，每种类型数量为偶数
- 图块状态：`active` → `selected` → `removing` → `removed`

### 2.3 特殊图块

| 类型 | 名称 | 匹配时路径效果 | 匹配后效果 |
|------|------|--------------|-----------|
| **S** | 相位灵能 | 可穿过污染格 + 允许 3 次转弯（普通图块最多 2 次） | 路径经过的空格留下灵能轨迹（粉红高亮，2 回合后消失），**不产生污染** |
| **T** | 净化灵能 | 正常路径规则（2 次转弯，不可穿污染） | 路径相邻的污染格被清除 |

- 混合配对（S+T）：使用 S 的路径能力（穿污染 + 3 弯）
- 特殊图块数量由难度决定（见 §6）

## 三、路径规则

### 3.1 基本规则

两个同类型图块可配对，当且仅当存在一条满足以下条件的路径：

1. 路径仅经过 `empty`、`spirit_trail` 格（普通图块）或额外允许 `pollution` 格（S 图块）
2. 路径不含图块格或障碍物格
3. 转弯次数 ≤ 最大转弯数

### 3.2 转弯限制

| 图块组合 | 最大转弯数 |
|---------|-----------|
| 普通 + 普通 | 2 |
| S + 任意 | 3 |
| T + T | 2 |

### 3.3 路径形式

- **0 弯**：直线连接
- **1 弯**：L 形（1 个拐角）
- **2 弯**：Z/U 形（2 个拐角）
- **3 弯**：仅 S 图块可用的复杂路径（3 个拐角）

## 四、污染机制

### 4.1 产生规则

- 普通图块或 T 图块配对成功后，路径经过的空格变为 `pollution`
- **S 图块配对不产生污染**，而是留下灵能轨迹 `spirit_trail`
- 图块自身所在的格子不会产生污染/轨迹

### 4.2 污染衰减

- 污染有持续回合数（由难度决定），到期后自动变为空格
- 灵能轨迹固定持续 2 回合后消失
- 每次匹配成功后触发衰减检查

### 4.3 污染效果

- `pollution` 格：**不可通行**，阻断路径
- `spirit_trail` 格：**可通行**，仅视觉效果（粉红虚线边框 + 半透明填充）

## 五、操作与道具

### 5.1 重排（Shuffle）

- 将棋盘上所有活跃图块随机重新排列
- **使用重排时清除棋盘上所有污染和灵能轨迹**
- 每局可用次数由难度决定

### 5.2 提示（Hint）

- 自动高亮一对可配对的图块
- 不消耗回合
- 每局可用次数由难度决定（普通/困难模式为 0）

### 5.3 复活（Revive）

- 仅限每日挑战模式，失败后可使用一次
- 流程：失败 → 提示复活 → 观看激励广告 → 确认复活（恢复游戏 + 60 秒 + 1 次重排） / 放弃
- 每局最多复活 1 次

## 六、参数配置

### 6.1 数据驱动

所有可调参数集中在 `src/core/config/game-balance.ts`，类型为 `GameParams`，可直接 JSON 序列化。微信小游戏后台可通过 remote config 下发 JSON 覆盖默认值，无需修改代码。

```typescript
type GameParams = {
  boardWidth: number;            // 棋盘宽度
  boardHeight: number;           // 棋盘高度
  tileTypes: string[];           // 图块类型池
  specialTypes: Array<'S'|'T'>;  // 特殊图块类型
  specialPairsPerType: number;   // 每种特殊图块对数
  obstacleRatio: number;         // 障碍物比例 [0, 1)
  pollutionEnabled: boolean;     // 污染开关
  pollutionDurationTurns: number;// 污染持续回合
  spiritTrailDurationTurns: number; // 灵能轨迹持续回合
  shuffleLimit: number;          // 重排次数
  shuffleClearsPollution: boolean;  // 重排清除污染
  hintLimit: number;             // 提示次数
  timeLimit: number;             // 限时（秒），0=不限
  reviveMaxPerGame: number;      // 复活上限
  reviveTimeBonus: number;       // 复活奖励时间
  reviveShuffleBonus: number;    // 复活奖励重排
};
```

### 6.2 默认参数

| 参数 | 教程 | 每日挑战 |
|------|------|---------|
| 棋盘尺寸 | 6×6 | 10×8 |
| 图块类型池 | A B C D | A B C D E F |
| 特殊图块对数/类型 | 1 | 2 |
| 障碍物比例 | 0% | 6% |
| 污染持续回合 | 2 | 3 |
| 灵能轨迹持续 | 2 | 2 |
| 重排次数 | 3 | 1 |
| 提示次数 | 99 | 0 |
| 时限（秒） | 0 | 180 |
| 复活 | 0 | 1 |

### 6.3 数值化难度

`computeDifficulty(params)` 从参数计算数值难度（0~100），综合考虑棋盘面积、图块种类、障碍比例、污染持续、限时、道具限制。值越大越难。

### 6.4 热更新接口

```typescript
import { applyDailyParams, applyTutorialParams } from '@/core/config/game-balance';

// 从微信后台 remote config 覆盖（缺失字段保留原值）
applyDailyParams(remoteJson);
applyTutorialParams(remoteJson);
```

## 七、胜负判定

### 7.1 胜利条件

棋盘上所有图块被消除（无活跃图块剩余）。

### 7.2 失败条件

| 原因 | 说明 |
|------|------|
| `deadlock` | 棋盘上无可配对路径，且无重排次数 |
| `no_shuffle` | 死局且重排次数耗尽 |
| `timeout` | 限时模式下超时 |
| `pollution_blocked` | 污染封路导致无法配对（诊断用） |

## 八、游戏模式

### 8.1 教程模式（Tutorial）

- 固定棋盘配置，引导学习基本操作
- 不限时，提示无限

### 8.2 每日挑战（Daily Challenge）

- 基于日期种子的随机棋盘
- 简单难度参数
- 支持复活和分享

## 九、关键实现文件

| 文件 | 职责 |
|------|------|
| `src/core/config/game-balance.ts` | 所有难度参数 |
| `src/core/board/board-generator.ts` | 棋盘生成（保证成对） |
| `src/core/rules/path-finder.ts` | 路径搜索（支持 0-3 弯） |
| `src/core/rules/match-resolver.ts` | 配对判定（S/T 特殊规则） |
| `src/core/systems/pollution-system.ts` | 污染/轨迹的产生、衰减、净化、清除 |
| `src/core/engine/game-engine.ts` | 游戏状态机与核心流程 |
| `src/types/board.ts` | 棋盘类型定义 |
