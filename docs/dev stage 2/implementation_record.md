# 二期开发实施记录

> 基于 `docs/dev stage 2/development_plan.md` 的 6 批次计划，修复已有代码与设计文档之间的功能性差距

## 前置状态

二期 6 个 Batch 的代码骨架已存在，TypeScript 编译通过，71 个测试全通过。但存在 10 项功能性差距需要修复。

---

## 修复清单

### 批次 A：核心纯函数修复

#### 1. purifyAroundPath 改为曼哈顿距离

- **文件:** `src/core/systems/pollution-system.ts`
- **问题:** 用 3x3 区域含对角线（8方向），PRD 要求"上下左右"（4方向曼哈顿距离）
- **改法:** 将 `dx/dy 双重循环` 替换为 `[{0,-1},{0,1},{-1,0},{1,0}]` 曼哈顿偏移；移除不再使用的 `radius` 参数

#### 2. 提取 hint-manager.ts 独立模块

- **新建:** `src/core/systems/hint-manager.ts`
- **问题:** 计划要求独立模块，当前 hint 逻辑内嵌在 game-engine.ts
- **改法:** 提取 `useHint(board, hintRemaining)` 和 `getHintPair(board)` 到新文件，game-engine 委托调用；清理 game-engine 中不再需要的 `findAnyValidPair` 直接 import

#### 3. 补充测试 fixture

- **文件:** `src/tests/fixtures/boards.ts`
- **新增:** `createPollutionBlockedBoard()` — 两个同类型图块被污染隔开，清除污染后可解的棋盘

---

### 批次 B：核心逻辑修复

#### 4. checkLose 细粒度失败原因

- **文件:** `src/core/systems/win-lose-checker.ts`
- **问题:** 只返回 `'deadlock'`，不区分 `'pollution_blocked'`
- **改法:** 死局+无重排时，用 `clearAllPollution` 检查：清污染后可解→`'pollution_blocked'`，仍死局→`'deadlock'`

#### 5. useShuffle 返回 `'no_shuffle'`

- **文件:** `src/core/engine/game-engine.ts`
- **问题:** 重排后仍死局+无重排次数时返回 `'deadlock'`，应为 `'no_shuffle'`
- **改法:** `failReason: 'deadlock'` → `failReason: 'no_shuffle'`

#### 6. T 图块净化触发条件放宽

- **文件:** `src/core/engine/game-engine.ts`
- **问题:** 要求双方都是 T 才净化，PRD 说"T图块匹配成功后"（至少一个T即可）
- **改法:** `&&` → `||`，即 `firstTile.specialType === 'T' || tile.specialType === 'T'`

---

### 批次 C：UI 修复

#### 7. 提示按钮移入 BattleHUD

- **文件:** `src/components/BattleHUD.tsx` + `src/scenes/BattleScene.tsx` + `src/store/game-store.ts`
- **问题:** 提示按钮在 canvas 下方独立元素，计划要求在 HUD 内
- **改法:**
  - game-store 新增 `hintHighlightPair: [string, string] | null` 状态
  - BattleHUD 添加提示按钮，触发 `useHint` 时设置 hintHighlightPair，2s 后清空
  - BattleScene 读取 `hintHighlightPair` 替代本地 `hintTiles` state，删除原独立按钮

#### 8. 教学消息显示

- **文件:** `src/scenes/BattleScene.tsx`
- **问题:** tutorial-provider 有 `tutorial: { title, message }` 字段，但 BattleScene 不渲染
- **改法:** 当 `mode === 'tutorial'` 时，在 canvas 上方显示教学提示框（橙色背景，含标题和消息）

#### 9. ResultScene 分享按钮 + 埋点

- **文件:** `src/scenes/ResultScene.tsx`
- **问题:** IShareService 已定义但未接入 UI，无分享按钮
- **改法:** 添加分享按钮，调用 `MockShareService.shareResult()`，追踪 `result_share_click` 埋点

#### 10. 补充 app_open 埋点

- **文件:** `src/app/main.tsx`
- **问题:** 缺少 `app_open` 事件
- **改法:** 在 `createRoot` 前调用 `telemetry.track('app_open', {})`

---

### 批次 D：测试补充

#### 新建测试文件

| 文件 | 用例数 | 覆盖内容 |
|------|-------|---------|
| `src/tests/unit/hint-manager.test.ts` | 5 | useHint 扣减、getHintPair 返回 ID、死局返回 null、无剩余返回 null |
| `src/tests/unit/challenge/challenge-record.test.ts` | 5 | saveDailyResult 首次/更新/不更新、getTodayBest 无记录、忽略 tutorial |

#### 更新测试文件

| 文件 | 变更 |
|------|------|
| `src/tests/unit/purify.test.ts` | 移除 radius 参数；新增对角线污染不清除（验证曼哈顿距离） |
| `src/tests/unit/win-lose-checker.test.ts` | 新增 pollution_blocked 场景测试 |

---

## 文件变更总览

### 新建文件（3）

```
src/core/systems/hint-manager.ts
src/tests/unit/hint-manager.test.ts
src/tests/unit/challenge/challenge-record.test.ts
```

### 修改文件（11）

```
src/core/systems/pollution-system.ts        — 曼哈顿距离 + 移除 radius 参数
src/core/systems/win-lose-checker.ts         — 细粒度失败原因（pollution_blocked）
src/core/engine/game-engine.ts               — T净化条件 + no_shuffle + hint委托 + 清理import
src/components/BattleHUD.tsx                  — 添加提示按钮
src/scenes/BattleScene.tsx                    — 教学消息 + hintHighlightPair + 删除独立提示按钮
src/scenes/ResultScene.tsx                    — 分享按钮 + result_share_click 埋点
src/store/game-store.ts                       — hintHighlightPair 状态 + useHint 高亮逻辑
src/app/main.tsx                              — app_open 埋点
src/tests/unit/purify.test.ts                 — 对角线测试 + 移除 radius
src/tests/unit/win-lose-checker.test.ts       — pollution_blocked 测试
src/tests/fixtures/boards.ts                  — createPollutionBlockedBoard
```

---

## 验证结果

| 项目 | 结果 |
|------|------|
| TypeScript 编译 | ✅ 通过 |
| 测试总数 | 83 通过（从 71 → 83，新增 12） |
| 生产构建 | ✅ 通过 |
| checkLose 返回 `'pollution_blocked'` | ✅ |
| checkLose 返回 `'deadlock'`（无污染时） | ✅ |
| useShuffle 返回 `'no_shuffle'` | ✅ |
| T+普通图块匹配触发净化 | ✅ |
| 对角线污染不被 purifyAroundPath 清除 | ✅ |
| 提示按钮在 HUD 内 | ✅ |
| 教学关显示提示消息 | ✅ |
| 结果页有分享按钮 | ✅ |
| app_open 埋点在启动时触发 | ✅ |
