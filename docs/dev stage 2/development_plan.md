# 《回路连连看》二期开发计划 — 挑战制版本

> 基于：`docs/dev stage 2/prd.md`

---

## 核心变更概要

| 维度 | MVP 现状 | 二期目标 |
|------|---------|---------|
| 产品结构 | 20 关线性递进 | 教学关 + 每日挑战 |
| 灵能图块 | S/T 统一 (`special: boolean`) | S = 相位(穿透+1折), T = 净化(清污染) |
| 首页 | 关卡列表 | 今日挑战入口 + 教学状态 |
| 存档 | 关卡进度 (`unlockedLevelCount`) | 教学完成态 + 每日记录 |
| 结果页 | 成功/失败 + 下一关 | 挑战结果 + 最佳记录 + 重试 |
| 埋点 | level 事件 | challenge 区分事件 |

---

## 实施批次（4 阶段，6 批次）

### 阶段一：挑战制结构改造（Batch 1-2）

---

### Batch 1：类型 + Provider + 存档迁移

**目标：** 建立挑战制核心类型和数据供给层，迁移存档结构

| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `src/types/challenge.ts` | `GameMode`, `ChallengeDate`, `DailyChallengeRecord`, `LocalProgress`, `BattleResult` |
| 修改 | `src/types/board.ts` | `Tile.special: boolean` → `Tile.specialType?: 'S' \| 'T'` |
| 修改 | `src/types/game.ts` | `GameRuntimeState` 增加 `mode: GameMode`, `challengeDate?: ChallengeDate` |
| 修改 | `src/types/level.ts` | `LevelConfig.specialTypes: string[]` → `specialTypes: Array<'S' \| 'T'>` |
| 新增 | `src/core/challenge/tutorial-provider.ts` | `TutorialLevelProvider` — 返回固定教学关配置 |
| 新增 | `src/core/challenge/daily-provider.ts` | `DailyChallengeProvider` — 根据日期 seed 生成挑战配置 |
| 修改 | `src/infra/storage/types.ts` | 新增 `LocalProgress`, `DailyChallengeRecord` 相关接口方法；废弃 `UserProgress` |
| 修改 | `src/infra/storage/local-storage-repo.ts` | 实现新存档接口，兼容旧数据容错 |
| 新增 | `src/tests/unit/challenge/daily-provider.test.ts` | 日期确定性、同日同配置 |
| 新增 | `src/tests/unit/challenge/tutorial-provider.test.ts` | 教学关配置验证 |

**关键数据结构：**

```ts
// src/types/challenge.ts
export type GameMode = 'tutorial' | 'daily_challenge';
export type ChallengeDate = string; // YYYY-MM-DD

export type DailyChallengeRecord = {
  challengeDate: ChallengeDate;
  success: boolean;
  durationMs: number;
  shuffleUsed: number;
  reviveUsed: number;
  hintUsed: number;
  completedAt: number;
};

export type LocalProgress = {
  tutorialCompleted: boolean;
  lastChallengeDate?: ChallengeDate;
  dailyBest?: Record<ChallengeDate, DailyChallengeRecord>;
  settings: { audioEnabled: boolean };
};

export type BattleResult = {
  mode: GameMode;
  success: boolean;
  durationMs: number;
  shuffleUsed: number;
  reviveUsed: number;
  hintUsed: number;
  challengeDate?: ChallengeDate;
};
```

```ts
// Tile 类型变更
// Before: special: boolean
// After:  specialType?: 'S' | 'T'
```

**DailyChallengeProvider 核心逻辑：**
- 输入：`ChallengeDate` (YYYY-MM-DD)
- 将日期字符串做简单 hash → 从参数空间选取棋盘尺寸、种类数、障碍布局、污染参数
- 保证同日同配置（纯函数、无随机）
- 初始版本：基于 20 关素材池做日期映射 + seed 微调

**验收：**
- `npx tsc --noEmit` 通过
- DailyChallengeProvider: 同日期返回同一配置，不同日期返回不同配置
- TutorialLevelProvider: 返回固定 6x6 教学关配置
- 存档读写兼容旧数据（旧 `UserProgress` 可被容错读取）

---

### Batch 2：场景 + 引擎重构

**目标：** 首页/对局/结果三场景适配挑战制，GameEngine 支持模式

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `src/store/ui-store.ts` | Scene 增加可选 `mode` 上下文；`selectedLevelId` → `currentMode: GameMode` |
| 修改 | `src/store/game-store.ts` | `startLevel` → `startChallenge(mode, date?)`; 存档逻辑适配新结构；埋点补充 challenge 事件 |
| 修改 | `src/core/engine/game-engine.ts` | `startLevel` 支持 `GameMode`，从 Provider 获取配置而非 level-data |
| 修改 | `src/scenes/HomeScene.tsx` | 重构为：标题 + 今日挑战入口 + 最佳记录 + 教学状态按钮 + 设置 |
| 修改 | `src/scenes/BattleScene.tsx` | HUD 适配模式显示（教学关/每日挑战） |
| 修改 | `src/scenes/ResultScene.tsx` | 按 mode 区分展示：挑战结果 + 最佳记录 + 重试/分享/首页 |
| 修改 | `src/components/BattleHUD.tsx` | 显示模式、日期、回合、重排剩余 |
| 修改 | `src/core/level/level-data.ts` | 保留 20 关数据（用于素材池和调试），不删除 |
| 修改 | `src/core/level/level-loader.ts` | 保留但降级为调试用途 |
| 新增 | `src/store/challenge-store.ts` | 挑战相关状态：`tutorialCompleted`, `dailyBest`, `lastChallengeDate` |
| 新增 | `src/tests/integration/challenge-flow.test.ts` | 新用户流程：首页 → 教学 → 今日挑战 → 结果 → 重试 |

**首页逻辑：**
```
if (!tutorialCompleted) → 点击主按钮 → 进入教学关
if (tutorialCompleted)  → 点击主按钮 → 进入今日挑战
```

**对局页 HUD 信息：**
- 教学模式：显示 "教学关" + 步骤提示
- 每日挑战模式：显示日期 + 回合数 + 已消除数 + 重排剩余

**结果页展示：**
- 成功：通关用时 / 重排次数 / 最佳是否刷新 / 重试 / 首页
- 失败：失败原因 / 重试 / 首页
- "下一关" 按钮移除

**验收：**
- 首次进入 → 自动/手动触发教学关 → 完成后回首页 → 进入今日挑战
- 老用户直接进入今日挑战
- 每日挑战能成功/失败/重试
- 结果页按 mode 区分展示
- 旧 20 关数据仍保留，调试入口可选访问

---

### 阶段二：数据与记录（Batch 3）

---

### Batch 3：每日记录 + 埋点 + 最佳展示

**目标：** 完成每日挑战记录闭环，首页展示最佳，埋点补全

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `src/store/challenge-store.ts` | 读写 `DailyChallengeRecord`，计算/更新 `dailyBest` |
| 修改 | `src/scenes/HomeScene.tsx` | 展示今日最佳记录（用时、重排次数），无记录显示"尚未挑战" |
| 修改 | `src/scenes/ResultScene.tsx` | 成功时显示"刷新最佳!"标记；失败时显示今日最佳对比 |
| 修改 | `src/store/game-store.ts` | 补充埋点事件（见下表） |
| 新增 | `src/tests/unit/challenge/challenge-record.test.ts` | 记录读写、最佳计算 |

**补充埋点事件：**

| 事件名 | 触发时机 |
|--------|---------|
| `app_open` | 应用启动 |
| `home_view` | 首页渲染 |
| `tutorial_enter` | 进入教学 |
| `tutorial_complete` | 教学完成 |
| `daily_challenge_enter` | 进入今日挑战 |
| `daily_challenge_start` | 开始今日挑战 |
| `daily_success` | 每日挑战成功 |
| `daily_fail` | 每日挑战失败 |
| `daily_retry` | 重试今日挑战 |
| `daily_best_updated` | 刷新最佳 |
| `result_share_click` | 点击分享（预留） |

**验收：**
- 首页显示今日最佳记录
- 挑战成功后最佳记录更新
- 结果页显示最佳对比
- 埋点事件在控制台可查看

---

### 阶段三：玩法增强（Batch 4-5）

---

### Batch 4：S/T 差异化 + T 图块净化能力

**目标：** S/T 灵能图块真正差异化

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `src/core/rules/match-resolver.ts` | 根据两图块 `specialType` 传入不同路径选项 |
| 修改 | `src/core/rules/path-finder.ts` | `canPassPollution` 和 `extraTurns` 分离为独立选项 |
| 修改 | `src/core/engine/game-engine.ts` | T 图块匹配成功后，调用 `purifyAroundPath` 清除路径周围 1 格污染 |
| 修改 | `src/core/systems/pollution-system.ts` | 新增 `purifyAroundPath(board, path, radius)` 函数 |
| 修改 | `src/core/board/board-generator.ts` | 根据 `specialTypes: ['S', 'T']` 分配 `specialType` |
| 修改 | `src/render/tile-renderer.ts` | S/T 图块视觉差异化（不同边框颜色/标记） |
| 修改 | `src/assets/tile-colors.ts` | S/T 图块颜色配置 |
| 修改 | `src/tests/unit/path-finder.test.ts` | 新增：S 图块 +1折 + 穿污染；T 图块不穿污染 |
| 新增 | `src/tests/unit/purify.test.ts` | T 图块净化能力测试 |
| 修改 | `src/tests/fixtures/boards.ts` | 新增 S/T 差异化测试棋盘 |

**S/T 能力对照：**

| | S (相位灵能) | T (净化灵能) |
|---|---|---|
| 穿污染 | ✅ | ❌ |
| 额外 +1 折 | ✅ | ❌ |
| 匹配后净化 | ❌ | ✅ (路径周围 1 格) |

**findPath 选项变更：**
```ts
// Before
{ canPassPollution: boolean }

// After
{ canPassPollution: boolean; extraTurns: number }
```

**purifyAroundPath 逻辑：**
- 遍历 path 中每个点
- 对每个点取周围 1 格（上下左右）的污染格
- 将污染格恢复为空格

**验收：**
- S 图块：可穿污染 + 路径允许 3 折
- T 图块：不可穿污染 + 匹配后清除路径周围污染
- S/T 在棋盘上视觉可区分
- PathFinder 原有测试不回归

---

### Batch 5：提示系统 + 失败原因细化

**目标：** 增加受限提示功能，细化失败原因展示

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `src/core/systems/deadlock-detector.ts` | 导出 `findAnyValidPair` 已有，直接复用 |
| 新增 | `src/core/systems/hint-manager.ts` | `useHint(board)` → 返回一组可消图块 ID，扣减提示次数 |
| 修改 | `src/types/game.ts` | `GameRuntimeState` 增加 `hintRemaining: number`; `FailReason` 增加 `'pollution_blocked'` |
| 修改 | `src/core/engine/game-engine.ts` | 集成 hint；检测是否因污染封死导致死局 |
| 修改 | `src/core/systems/win-lose-checker.ts` | `checkLose` 返回更细粒度原因 |
| 修改 | `src/scenes/BattleScene.tsx` | HUD 增加提示按钮 |
| 修改 | `src/components/BattleHUD.tsx` | 显示提示按钮和剩余次数 |
| 修改 | `src/scenes/ResultScene.tsx` | 失败原因细粒度展示（无路可走/污染封死/重排用尽） |
| 新增 | `src/tests/unit/hint-manager.test.ts` | 提示功能测试 |

**提示机制：**
- 教学关：不限制提示
- 每日挑战：默认 0 次提示（首版不含提示，结构预留）
- 提示效果：高亮一组可消图块 2 秒

**失败原因细化：**
```ts
type FailReason =
  | 'deadlock'           // 通用死局
  | 'pollution_blocked'  // 污染封路导致死局
  | 'no_shuffle'         // 重排用尽
  | 'manual'             // 手动退出
  | 'unknown';
```

**验收：**
- 提示按钮可点击，高亮可消对
- 提示次数受限
- 失败原因能区分"污染封死" vs "普通死局"
- 结果页展示细粒度失败原因

---

### 阶段四：微信小游戏迁移预备（Batch 6）

---

### Batch 6：分享/广告/排行榜/远程配置 抽象

**目标：** 不接入真实微信 API，仅做接口抽象和预留

| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `src/infra/share/types.ts` | `IShareService` 接口：`shareResult(result: BattleResult)` |
| 新增 | `src/infra/share/mock-share.ts` | Mock 实现（console.log） |
| 新增 | `src/infra/ad/types.ts` | `IAdService` 接口：`showRewardedAd(): Promise<boolean>` |
| 新增 | `src/infra/ad/mock-ad.ts` | Mock 实现（直接 resolve(true)） |
| 新增 | `src/infra/leaderboard/types.ts` | `ILeaderboardService` 接口：`submitScore`, `getTopN` |
| 新增 | `src/infra/leaderboard/mock-leaderboard.ts` | Mock 实现 |
| 新增 | `src/infra/remote-config/types.ts` | `IRemoteChallengeConfig` 接口：`getDailyConfig(date)` |
| 新增 | `src/infra/remote-config/local-config.ts` | 本地实现（fallback to DailyChallengeProvider） |
| 修改 | `src/scenes/ResultScene.tsx` | 分享按钮调用 `IShareService` |
| 修改 | `src/core/challenge/daily-provider.ts` | 支持远程配置 fallback 到本地 |
| 新增 | `src/tests/unit/infra/share.test.ts` | 接口契约测试 |
| 新增 | `src/tests/unit/infra/ad.test.ts` | 接口契约测试 |

**接口抽象原则：**
- 业务层只依赖接口，不依赖实现
- 当前全部使用 Mock 实现
- 未来接入微信时只需替换实现类

**验收：**
- 分享按钮可点击，Mock 实现输出到控制台
- 广告/排行榜接口类型完整
- 远程配置 fallback 逻辑正确
- 现有功能无回归

---

## 测试覆盖汇总

### 新增单元测试

| 测试文件 | 覆盖 |
|---------|------|
| `daily-provider.test.ts` | 日期确定性、配置生成 |
| `tutorial-provider.test.ts` | 教学关配置验证 |
| `challenge-record.test.ts` | 记录读写、最佳计算 |
| `purify.test.ts` | T 图块净化能力 |
| `hint-manager.test.ts` | 提示功能 |
| `share.test.ts` | 分享接口契约 |
| `ad.test.ts` | 广告接口契约 |

### 新增集成测试

| 测试文件 | 覆盖 |
|---------|------|
| `challenge-flow.test.ts` | 新用户流程、老用户流程、重试、记录保存 |

### 需回归的现有测试

- `path-finder.test.ts` — PathFinder 正确性
- `match-resolver.test.ts` — 匹配判定
- `deadlock-detector.test.ts` — 死局检测
- `shuffle-manager.test.ts` — 重排保证可解
- `pollution-system.test.ts` — 污染衰减
- `battle-flow.test.ts` — 完整对局流程

---

## 文件变更总览

### 新增文件（~21）

```
src/types/challenge.ts
src/core/challenge/tutorial-provider.ts
src/core/challenge/daily-provider.ts
src/store/challenge-store.ts
src/core/systems/hint-manager.ts
src/infra/share/types.ts
src/infra/share/mock-share.ts
src/infra/ad/types.ts
src/infra/ad/mock-ad.ts
src/infra/leaderboard/types.ts
src/infra/leaderboard/mock-leaderboard.ts
src/infra/remote-config/types.ts
src/infra/remote-config/local-config.ts
src/tests/unit/challenge/daily-provider.test.ts
src/tests/unit/challenge/tutorial-provider.test.ts
src/tests/unit/challenge/challenge-record.test.ts
src/tests/unit/purify.test.ts
src/tests/unit/hint-manager.test.ts
src/tests/unit/infra/share.test.ts
src/tests/unit/infra/ad.test.ts
src/tests/integration/challenge-flow.test.ts
```

### 修改文件（~18）

```
src/types/board.ts          — Tile.specialType
src/types/game.ts           — GameMode, hintRemaining, FailReason
src/types/level.ts          — specialTypes 类型收窄
src/core/engine/game-engine.ts  — 模式支持、T净化、提示
src/core/rules/match-resolver.ts — S/T 差异化路径选项
src/core/rules/path-finder.ts   — extraTurns 选项
src/core/systems/pollution-system.ts — purifyAroundPath
src/core/systems/win-lose-checker.ts — 细粒度失败原因
src/core/board/board-generator.ts — specialType 分配
src/store/game-store.ts     — startChallenge, 埋点补全
src/store/ui-store.ts       — currentMode
src/scenes/HomeScene.tsx    — 挑战制首页
src/scenes/BattleScene.tsx  — 模式 HUD + 提示
src/scenes/ResultScene.tsx  — 挑战结果 + 分享
src/components/BattleHUD.tsx — 模式信息 + 提示按钮
src/render/tile-renderer.ts — S/T 视觉差异
src/assets/tile-colors.ts   — S/T 颜色
src/infra/storage/types.ts  — 新存档接口
src/infra/storage/local-storage-repo.ts — 新存档实现
```

---

## 端到端验证

1. `npm run dev` → 首页显示"今日挑战"入口 + 教学状态
2. 首次进入 → 自动进入教学关 → 完成 → 回首页 → 进入今日挑战
3. 老用户 → 首页直接进入今日挑战
4. 对局中 S 图块可穿污染 + 3 折；T 图块匹配后清污染
5. 挑战成功 → 结果页显示用时 + 最佳 → 重试/首页
6. 挑战失败 → 结果页显示失败原因 → 重试/首页
7. 首页显示今日最佳记录
8. 刷新页面 → 挑战记录保留
9. 分享按钮 → Mock 控制台输出
10. `npm run test` → 所有测试通过（含新增 + 回归）

---

## 风险与注意事项

1. **Tile.special → specialType 迁移**：所有创建 Tile 的地方（board-generator、test fixtures）需同步更新，否则 TypeScript 编译会报错
2. **存档兼容**：旧 `UserProgress` 数据需容错处理，不能因旧数据导致崩溃
3. **DailyChallengeProvider 确定性**：必须纯函数，同日期同配置，不能依赖 `Math.random()`
4. **PathFinder 选项扩展**：`extraTurns` 是新选项，默认 0，不影响现有 2 折逻辑
5. **20 关数据保留**：不删除 level-data.ts，仅从主流程移除
