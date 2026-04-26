# 《回路连连看》MVP 实施计划

## 关键设计决策

**SQLite 方案：** 采用 Storage 抽象层 + localStorage 首版实现。原因：
- 纯浏览器环境，sql.js WASM 包 1MB 会拖慢首屏
- 游戏存档数据量极小，localStorage 够用
- Repository 接口对齐 SQLite schema，未来可无缝迁移
- 预留 `SqlJsRepository` 实现占位

---

## 实施批次（共 10 批，约 44 个文件）

### Batch A-1：工程骨架 + 类型定义

| 文件 | 职责 |
|------|------|
| `package.json` | 依赖：react, zustand, vitest 等 |
| `tsconfig.json` | strict: true, @/ 别名 |
| `vite.config.ts` | React 插件 + alias |
| `src/types/common.ts` | Point, Direction |
| `src/types/board.ts` | Cell, CellKind, Tile, TileState, BoardState |
| `src/types/game.ts` | GameRuntimeState, GameStatus, PathResult, MatchAttemptResult |
| `src/types/level.ts` | LevelConfig, PollutionConfig |
| `src/types/api.ts` | 未来 API 契约类型 |

**验收：** `npx tsc --noEmit` 通过

### Batch A-2：棋盘模型 + 关卡配置

| 文件 | 职责 |
|------|------|
| `src/core/board/board-model.ts` | createEmptyBoard, getCell, setCell, getActiveTiles, removeTile, isCellPassable |
| `src/core/board/board-generator.ts` | 根据 LevelConfig 生成 BoardState，验证可解 |
| `src/core/level/level-loader.ts` | loadLevel, loadAllLevels |
| `src/core/level/level-data.ts` | 20 关静态配置 |

**验收：** 单元测试 createEmptyBoard, generateBoard, loadLevel 通过

### Batch A-3：PathFinder + MatchResolver + 测试

| 文件 | 职责 |
|------|------|
| `src/core/rules/path-finder.ts` | 最多 2 折路径判定（直连→一折→两折逐步搜索） |
| `src/core/rules/match-resolver.ts` | 同类型图块匹配判定 |
| `src/tests/unit/path-finder.test.ts` | 10+ 用例：直连/一折/两折/三折/阻挡 |

**验收：** PathFinder 全部测试通过

### Batch B-1：渲染 + 输入

| 文件 | 职责 |
|------|------|
| `src/render/canvas-renderer.ts` | 主渲染器：网格+障碍+污染+图块+路径 |
| `src/render/tile-renderer.ts` | 图块绘制（纯色方块+字母标识） |
| `src/render/path-renderer.ts` | 路径高亮绘制 |
| `src/render/animation-renderer.ts` | 消除/污染动画 |
| `src/hooks/use-canvas.ts` | Canvas 2D context 管理 |
| `src/hooks/use-click-handler.ts` | 点击坐标→格子映射 |
| `src/hooks/use-game-loop.ts` | rAF 游戏循环 |
| `src/assets/tile-colors.ts` | 图块类型→颜色映射 |

**验收：** 浏览器中看到棋盘

### Batch B-2：游戏引擎 + 状态管理

| 文件 | 职责 |
|------|------|
| `src/core/engine/game-engine.ts` | 状态机驱动，串联 PathFinder/Match/Pollution/Deadlock/Shuffle |
| `src/store/game-store.ts` | Zustand store: GameRuntimeState + actions |
| `src/store/ui-store.ts` | UI 状态：scene, debugOpen |

**验收：** 点击图块可选中，可消除

### Batch B-3：判定 + 死局 + 重排 + 污染 + 测试

| 文件 | 职责 |
|------|------|
| `src/core/systems/win-lose-checker.ts` | checkWin, checkLose |
| `src/core/systems/deadlock-detector.ts` | isDeadlocked, findAnyValidPair |
| `src/core/systems/shuffle-manager.ts` | shuffle（Fisher-Yates + 可解验证） |
| `src/core/systems/pollution-system.ts` | applyPollution, decayPollution |
| `src/tests/unit/match-resolver.test.ts` | 5 用例 |
| `src/tests/unit/deadlock-detector.test.ts` | 4 用例 |
| `src/tests/unit/shuffle-manager.test.ts` | 6 用例 |
| `src/tests/unit/pollution-system.test.ts` | 6 用例 |
| `src/tests/unit/win-lose-checker.test.ts` | 4 用例 |
| `src/tests/fixtures/boards.ts` | 预构造测试棋盘 |

**验收：** 所有核心逻辑单元测试通过

### Batch C-1：场景实现

| 文件 | 职责 |
|------|------|
| `src/app/main.tsx` | 入口挂载 |
| `src/app/App.tsx` | 根组件，场景切换 |
| `src/app/router.ts` | 极简场景导航 |
| `src/scenes/HomeScene.tsx` | 首页关卡列表 |
| `src/scenes/BattleScene.tsx` | Canvas + HUD + 交互 |
| `src/scenes/ResultScene.tsx` | 成功/失败结算 |
| `src/components/BattleHUD.tsx` | 关卡号/回合/重排按钮 |
| `src/components/LevelCard.tsx` | 关卡卡片 |

**验收：** 完整打一局游戏（首页→对局→结算）

### Batch C-2：本地存档

| 文件 | 职责 |
|------|------|
| `src/infra/storage/types.ts` | IStorageRepository 接口 |
| `src/infra/storage/local-storage-repo.ts` | localStorage 实现 |
| `src/infra/storage/index.ts` | 工厂函数 |

**验收：** 刷新页面进度保留，断点续玩

### Batch D-1：可观测性

| 文件 | 职责 |
|------|------|
| `src/infra/logger.ts` | debug/info/warn/error 分级日志 |
| `src/infra/telemetry.ts` | track, getRecent, exportAll |
| `src/infra/error-reporter.ts` | 统一异常上报 |
| `src/components/DebugPanel.tsx` | 状态展示 + 操作按钮 |

**验收：** 控制台可见结构化日志和埋点，调试面板可用

### Batch D-2：集成测试

| 文件 | 职责 |
|------|------|
| `src/tests/integration/battle-flow.test.ts` | 完整对局流程测试 |
| `src/tests/integration/level-loading.test.ts` | 关卡加载验证 |
| `src/tests/fixtures/levels.ts` | 测试用关卡配置 |

**验收：** 集成测试全通过

---

## 20 关配置概要

| 关卡 | 棋盘 | 种类 | 每种数 | 障碍 | 污染 | 重排 |
|------|------|------|--------|------|------|------|
| 1-3 | 4x4 | 2 | 4 | 0 | 否 | 3 |
| 4-5 | 4x6 | 2 | 6 | 0 | 否 | 3 |
| 6-7 | 6x6 | 3 | 4 | 2 | 否 | 3 |
| 8-10 | 6x6 | 3 | 6 | 3 | 否 | 2 |
| 11-12 | 6x6 | 3 | 6 | 2 | 是(2) | 2 |
| 13-14 | 6x8 | 4 | 4 | 3 | 是(2) | 2 |
| 15-16 | 6x8 | 4 | 6 | 4 | 是(2) | 1 |
| 17-18 | 8x8 | 4 | 8 | 5 | 是(2) | 1 |
| 19-20 | 8x8 | 5 | 6 | 6 | 是(2) | 1 |

---

## 端到端验收清单

1. `npm run dev` → 浏览器打开，首页显示 20 关
2. 点击关卡 1 → 进入对局 → 点击配对图块 → 成功消除
3. 打完关卡 1 → 结算页显示成功 → 返回首页
4. 进入关卡 11 → 消除后观察污染格生成 → 等回合推进后污染衰减
5. 触发死局 → 使用重排 → 继续
6. 刷新页面 → 进度保留
7. `npm run test` → 所有测试通过
8. 开发环境调试面板可用
