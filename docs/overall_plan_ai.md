# 总体方案（AI 开发者版）

## 2.1 AI 开发目标声明

你正在开发《回路连连看》的微信小游戏正式化版本。项目已完成 MVP（一期）和挑战制改造（二期），当前目标已升级为：

> 开发一个 **完整的、可在微信小游戏运行** 的项目，保留"教学关 + 每日挑战"的挑战制产品形态，并建立跨平台适配架构。

你必须遵守以下总目标：

1. 保留现有核心玩法能力（路径判定、污染机制、灵能图块、限时机制）
2. 主流程保持挑战制（教学关 + 每日挑战）
3. 新增微信小游戏适配层
4. 保留 Web 环境用于调试和测试
5. 为分享、广告、登录、排行榜预留清晰接口
6. 文档、架构、任务拆分全部围绕"微信小游戏完整项目"组织

---

## 2.2 AI 开发硬约束

### 2.2.1 架构约束
- 核心玩法逻辑必须继续位于 `core/`
- 平台差异必须通过 adapter / platform 层收敛
- 不允许把微信 API 直接散落到核心规则代码中
- Web 与微信小游戏必须共用主要玩法逻辑
- 挑战制逻辑必须显式建模为模式系统，而不是在页面中硬编码

### 2.2.2 代码约束
- TypeScript 严格模式
- 尽量避免 `any`
- 每个模块单一职责
- 新增平台能力必须有降级或 mock 方案
- 文件改动要优先局部、可验证、可回归

### 2.2.3 测试约束
必须确保以下两类测试都能持续运行：

- **核心逻辑测试**：继续在 Web/Node 环境跑
- **平台适配验证**：提供 mock 或最小运行验证

以下模块必须保持测试可运行：
- PathFinder
- MatchResolver
- DeadlockDetector
- ShuffleManager
- PollutionSystem
- WinLoseChecker
- HintManager
- DailyChallengeProvider
- TutorialLevelProvider
- LocalProgress migration

### 2.2.4 可观测性约束
以下事件必须可记录，并区分模式：
- app_open
- tutorial_enter / tutorial_complete
- daily_challenge_enter / daily_challenge_start
- match_attempt / match_success / match_fail
- shuffle_used / hint_used
- daily_success / daily_fail / daily_retry
- result_share_click
- timeout（限时超时）

---

## 2.3 当前开发范围边界

### 本阶段必须做
- 微信小游戏平台适配方案
- 巩固挑战制产品结构
- Web + 微信小游戏双环境开发策略
- 第三期任务拆分

### 本阶段建议做
- 分享 payload 抽象
- 激励广告触发点设计
- 微信登录/开放数据域/排行榜协议预留
- 每日挑战远端配置协议

### 本阶段不强制一次做完
- 完整后端
- 复杂活动系统
- 强社交系统
- 复杂付费系统

---

## 2.4 产品主结构

### 主流程
```text
首次进入 -> 教学关 -> 今日挑战 -> 结果页 -> 重试/分享
后续进入 -> 今日挑战 -> 结果页 -> 重试/分享
```

### 非主流程
- 旧 20 关不作为主入口
- 旧 20 关保留为测试/练习/回归素材池

---

## 2.5 技术架构目标

### 2.5.1 当前已实现架构
```text
src/
  app/                # 启动、路由
  scenes/             # Home / Battle / Result
  core/
    board/            # 棋盘模型 + 生成器
    challenge/        # 教学关/每日挑战 Provider
    level/            # 关卡加载 + 20关数据
    rules/            # PathFinder + MatchResolver
    systems/          # Deadlock / Shuffle / Pollution / Hint / WinLose
    engine/           # GameEngine（状态机驱动）
  render/             # Canvas 渲染器
  store/              # game-store + challenge-store + ui-store
  infra/
    storage/          # localStorage 存档
    share/ad/leaderboard/remote-config  # 接口抽象 + Mock
    logger / telemetry / error-reporter
  hooks/              # Canvas / Click / GameLoop
  components/         # BattleHUD / LevelCard / DebugPanel
  types/              # 全局类型
  assets/             # 颜色配置
  tests/              # 83 个测试用例
```

### 2.5.2 三期目标架构
```text
src/
  app/                # 启动、路由、模式切换
  scenes/             # Home / Tutorial / DailyChallenge / Result
  core/               # 纯玩法逻辑（不变）
  platform/           # Web / WeChat Mini Game 适配层
  services/           # challenge、storage、share、ad、auth 抽象服务
  store/              # runtime 与 UI 状态
  infra/              # logger、telemetry、error-reporter
  tests/              # 核心逻辑与集成测试
```

### 关键原则
- `core/` 不依赖平台
- `platform/` 负责输入、存储、分享、广告、登录等差异能力
- `services/` 负责业务抽象，避免 scene 直接依赖平台 API

### 平台分层

#### WebAdapter
- 浏览器调试
- 本地测试
- localStorage 存档
- 假分享/假广告/假登录

#### WeChatMiniGameAdapter
- wx 生命周期适配
- wx 存储
- wx 分享
- wx 激励广告
- wx 登录能力接入
- 后续开放数据域与排行榜能力预留

---

## 2.6 产品模式建模

```ts
type GameMode = 'tutorial' | 'daily_challenge' | 'practice';
```

说明：
- `tutorial`：教学关（6×6，含 S + T 灵能图块教学）
- `daily_challenge`：主玩法（10×8 或 12×10，限时 180 秒，S/T 各 2 对，污染 3~4 回合）
- `practice`：旧 20 关可迁移为非主模式，当前可只保留内部使用

---

## 2.7 数据模型（当前已实现）

### Tile
```ts
type Tile = {
  id: string;
  type: string;
  x: number;
  y: number;
  state: 'active' | 'selected' | 'removing' | 'removed';
  specialType?: 'S' | 'T';  // S=相位灵能, T=净化灵能
};
```

### LevelConfig
```ts
type LevelConfig = {
  id: string;
  name: string;
  width: number;
  height: number;
  tileTypes: string[];
  specialTypes: Array<'S' | 'T'>;
  specialPairsPerType?: number;  // 每种灵能图块的对数，默认 1
  fillBoard: boolean;
  obstacles: ObstacleConfig[];
  pollution: { enabled: boolean; durationTurns: number };
  shuffleLimit: number;
  target: { type: 'clear_all' };
  hintLimit?: number;
  timeLimit?: number;  // 限时秒数，undefined=无限制
  tutorial?: { title?: string; message?: string };
};
```

### GameRuntimeState
```ts
type GameRuntimeState = {
  levelId: string;
  board: BoardState;
  selectedTileId: string | null;
  turn: number;
  shuffleRemaining: number;
  hintRemaining: number;
  matchCount: number;
  status: 'idle' | 'loading' | 'playing' | 'checking' | 'success' | 'failed';
  failReason?: 'deadlock' | 'pollution_blocked' | 'no_shuffle' | 'timeout' | 'manual' | 'unknown';
  lastPath: Point[];
  levelStartTime: number;
  mode: GameMode;
  challengeDate?: ChallengeDate;
  timeLimit: number;
};
```

### BattleResult
```ts
type BattleResult = {
  mode: GameMode;
  success: boolean;
  durationMs: number;
  shuffleUsed: number;
  reviveUsed: number;
  hintUsed: number;
  challengeDate?: ChallengeDate;
};
```

### LocalProgress
```ts
type LocalProgress = {
  tutorialCompleted: boolean;
  lastChallengeDate?: ChallengeDate;
  dailyBest?: Record<ChallengeDate, DailyChallengeRecord>;
  settings: { audioEnabled: boolean };
};
```

---

## 2.8 核心规则（当前已实现）

### PathFinder
- 默认最多 2 次转折，灵能图块 S 允许 3 折
- 不穿越障碍、active tile
- 灵能图块 S 可穿越污染格，普通图块和 T 不行
- 不出棋盘

### MatchResolver
- 只允许同类型图块匹配
- S 图块匹配时路径不产生污染
- T 图块匹配后触发净化

### PollutionSystem
- 匹配成功后对路径中间空格施加污染（S 匹配除外）
- T 图块净化：清除路径周围曼哈顿距离 1 格内的污染
- 回合推进时衰减污染
- 死局检测可区分"污染封路"和"通用死局"

### DeadlockDetector
- 检查当前是否至少有一组合法匹配
- 支持灵能图块的特殊路径选项

### ShuffleManager
- 重新分配剩余 active tile 位置
- 不改变图块类型分布
- 重排后必须至少存在一组合法匹配

### HintManager
- 消耗提示次数，返回一组可消图块 ID
- 教学关不限制，每日挑战默认 0 次

### WinLoseChecker
- 全清 = 胜利
- 死局 + 无重排 = 失败（区分 pollution_blocked / deadlock / no_shuffle）
- 限时超时 = 失败（timeout）

---

## 2.9 状态机

### 顶层状态
```text
idle -> loading -> playing -> checking -> success/failed
```

### playing 子流程
```text
select A -> select B -> resolve match
  -> success: remove -> pollution(skip if S) -> purify(if T) -> decay -> turn+1 -> checking
  -> fail: feedback -> continue playing
```

### 失败原因
```text
deadlock          -- 通用死局（清除污染后仍无解）
pollution_blocked -- 污染封路（清除污染后可解）
no_shuffle        -- 重排用尽后仍死局
timeout           -- 限时超时
manual            -- 手动退出
```

---

## 2.10 第三期产品能力目标

### P0
- 微信小游戏平台适配层
- 文档全量同步（overall_plan 融合更新）

### P1
- 分享数据结构
- 广告触发点设计
- 登录与挑战结果协议预留

### P2
- 每日挑战远端下发
- 排行榜
- 广告真实接入
- 开放数据域适配

---

## 2.11 测试框架要求

### 单元测试
继续保留当前核心规则测试（83 用例），并新增：
- 平台 service mock 测试

### 集成测试
需要新增：
- 微信小游戏适配层编译验证
- 平台接口调用不污染核心规则模块

### 回归测试
要求 AI 在修改核心逻辑后必须执行：
- `npm run test`
- 对关键场景至少手工试玩

---

## 2.12 可观测性要求

### 必埋事件
- app_open
- tutorial_enter / tutorial_complete
- daily_challenge_enter / daily_challenge_start
- tile_selected / match_success / match_fail
- shuffle_used / hint_used
- daily_success / daily_fail / daily_retry
- result_share_click

### 错误观测
必须区分：
- 核心逻辑错误
- 平台适配错误
- 存档解析错误
- 挑战配置加载错误

---

## 2.13 AI 的交付要求

你在第三期中输出的内容必须至少包括：

1. 更新后的 docs 总览文档
2. 第三期 PRD 文档
3. 第三期开发计划文档
4. 如果涉及平台改造，必须说明新增/修改文件边界
5. 若改造了存档结构，必须说明迁移方案
6. 若设计了微信小游戏能力，必须区分：
   - 当前实现
   - 接口预留
   - 后续接入
