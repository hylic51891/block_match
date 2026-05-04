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

- 每个图块有一个类型标识（如 A/B/C/D/... ）
- **所有图块必须成对出现**：总数为偶数，每种类型数量为偶数
- 障碍物数量也必须为偶数，确保非障碍格总数为偶数，图块可全部成对填满
- 图块状态：`active` → `selected` → `removing` → `removed`

### 2.3 障碍物生成

- 障碍物按 `obstacleRatio` 比例生成，数量向下取整到偶数
- 位置由 seeded RNG 随机确定（每日挑战基于日期种子），不再硬编码
- 保证同一天同一日期种子生成相同布局

### 2.4 特殊图块

| 类型 | 名称 | 匹配时路径效果 | 匹配后效果 |
|------|------|--------------|-----------|
| **S** | 相位灵能 | 可穿过污染格 + 允许 3 次转弯 | 路径经过的空格留下灵能轨迹（粉红高亮，2 回合后消失），**不产生污染** |
| **T** | 净化灵能 | 可穿过污染格 + 2 次转弯 | 路径相邻的污染格被清除，**不产生污染** |

关键规则：
- **任一方是 S/T**，连线即可穿过污染格（`canPassPollution = true`）
- **任一方是 S**，额外允许 3 弯（`extraTurns = 1`）；T 不加弯
- **任一方是特殊图块**（S 或 T），匹配后路径不产生污染
- 混合配对（S+T）：穿污染 + 3 弯（取 S 的加弯能力）

## 三、路径规则

### 3.1 基本规则

两个同类型图块可配对，当且仅当存在一条满足以下条件的路径：

1. 路径仅经过 `empty`、`spirit_trail` 格（普通图块）或额外允许 `pollution` 格（特殊图块 S/T）
2. 路径不含图块格或障碍物格
3. 转弯次数 ≤ 最大转弯数

### 3.2 转弯限制

| 图块组合 | 最大转弯数 | 可穿污染 |
|---------|-----------|---------|
| 普通 + 普通 | 2 | 否 |
| 任一方是 S | 3 | 是 |
| 任一方是 T（无 S） | 2 | 是 |

### 3.3 路径形式

- **0 弯**：直线连接
- **1 弯**：L 形（1 个拐角）
- **2 弯**：Z/U 形（2 个拐角）
- **3 弯**：仅 S 图块参与时可用（3 个拐角）

## 四、污染机制

### 4.1 产生规则

- **普通图块**配对成功后，路径经过的空格变为 `pollution`
- **S 或 T 图块**配对不产生污染（任一方是特殊图块即不产生）
- S 图块匹配留下灵能轨迹 `spirit_trail`
- 图块自身所在的格子不会产生污染/轨迹

### 4.2 污染衰减

- 污染有持续回合数（由参数配置决定），到期后自动变为空格
- 灵能轨迹持续回合数可配置（默认 2 回合）
- 每次匹配成功后触发衰减检查

### 4.3 污染效果

- `pollution` 格：**不可通行**（普通图块），阻断路径
- `spirit_trail` 格：**可通行**，仅视觉效果（粉红虚线边框 + 半透明填充）
- S/T 图块连线可穿过 `pollution` 格

## 五、操作与道具

### 5.1 重排（Shuffle）

- 将棋盘上所有活跃图块随机重新排列
- **使用重排时清除棋盘上所有污染和灵能轨迹**
- 每局可用次数由参数配置决定

### 5.2 提示（Hint）

- 自动高亮一对可配对的图块
- 不消耗回合
- 每局可用次数由参数配置决定

### 5.3 复活（Revive）

- 仅限每日挑战模式，失败后可使用一次
- 流程：失败 → 提示复活 → 观看激励广告 → 确认复活（恢复游戏 + 奖励时间 + 奖励重排） / 放弃
- 每局最多复活次数由参数配置决定

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
| 棋盘尺寸 | 6×6 | 10×16 |
| 图块类型池 | A B C D | A~R (18种) |
| 特殊图块对数/类型 | 1 | 6 |
| 障碍物比例 | 0% | 6% |
| 污染持续回合 | 2 | 3 |
| 灵能轨迹持续 | 2 | 2 |
| 重排次数 | 3 | 1 |
| 提示次数 | 99 | 0 |
| 时限（秒） | 0 | 300 |
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
- 无复活

### 8.2 每日挑战（Daily Challenge）

- 基于日期种子的随机棋盘（障碍位置、污染持续每日微变）
- 参数由 GameParams 控制，可远程热更新
- 支持复活和分享

## 九、棋盘生成保证

- 所有图块成对：总数偶数，每种类型偶数个
- 障碍数偶数：保证非障碍格总数偶数，图块可填满
- 若障碍导致空位奇数，自动移除一个障碍
- 100% 填充率验证：`validateBoard()` 检查空位数、每类偶数

## 十、关键实现文件

| 文件 | 职责 |
|------|------|
| `src/core/config/game-balance.ts` | GameParams 定义 + 默认值 + 难度计算 + 热更新 |
| `src/core/board/board-generator.ts` | 棋盘生成（保证成对 + validateBoard 验证） |
| `src/core/rules/path-finder.ts` | 路径搜索（0-3 弯，canPassPollution + extraTurns） |
| `src/core/rules/match-resolver.ts` | 配对判定（S/T 穿污染 + S 加弯规则） |
| `src/core/systems/pollution-system.ts` | 污染/轨迹的产生、衰减、净化、清除 |
| `src/core/engine/game-engine.ts` | 游戏状态机与核心流程 |
| `src/core/challenge/daily-provider.ts` | 每日挑战生成（seeded RNG + 随机障碍） |
| `src/types/board.ts` | 棋盘类型定义 |
