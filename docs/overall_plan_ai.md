# 回路连连看 — 项目总览

> 本文档为项目唯一入口，链接到各阶段详细文档。

## 当前状态

**三期开发已完成**，120 测试通过，Web 环境可运行。

## 核心文档

| 文档 | 说明 |
|------|------|
| [核心玩法文档](./core_gameplay.md) | 游戏规则、图块能力、参数配置 — **开发基准** |
| [本地测试指南](./local_testing_guide.md) | 环境搭建、游玩流程、测试运行、冒烟清单 |

## 历史文档

| 文档 | 阶段 | 说明 |
|------|------|------|
| [MVP 文档](./mvp/) | 一期 | MVP 规划与实施记录（历史归档） |
| [二期文档](./dev%20stage%202/) | 二期 | 挑战制改造 PRD + 开发计划 + 实施记录 |
| [三期文档](./dev%20stage%203/) | 三期 | 微信小游戏正式化 PRD + 开发计划 + 实施记录 |

## 参考文档

| 文档 | 说明 |
|------|------|
| [数据库/API 设计](./db_api_design.md) | 后端契约预留（未实施） |

## 技术栈

React + TypeScript + Vite + Canvas 2D + Zustand + Vitest

## 项目结构

```
src/
  app/                # 入口、路由
  scenes/             # Home / Battle / Result
  core/
    board/            # 棋盘模型 + 生成器（保证成对 + 验证）
    challenge/        # 教学关/每日挑战 Provider（seeded RNG 随机障碍）
    config/           # GameParams 数据驱动参数（支持远程热更新）
    level/            # 关卡加载 + 20关数据
    rules/            # PathFinder + MatchResolver（S/T 穿污染规则）
    systems/          # Deadlock / Shuffle / Pollution / Hint / WinLose
    engine/           # GameEngine（状态机 + 复活流程）
  platform/           # IPlatformAdapter + WebAdapter + WeChatMiniGameAdapter
  services/           # challenge / share / ad / auth / leaderboard 业务抽象
  render/             # Canvas 渲染器（含 spirit_trail 粉红轨迹）
  store/              # game-store + challenge-store + ui-store
  infra/              # storage / share / ad / leaderboard / remote-config / telemetry / error-reporter
  hooks/              # Canvas / Click / GameLoop
  components/         # BattleHUD / LevelCard / DebugPanel / ReviveDialog
  types/              # 全局类型
  tests/              # 120 用例，23 文件
```
