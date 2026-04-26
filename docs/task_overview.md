# 总体任务总览（AI 进度管理版）

## 3.1 任务总览说明

本章节用于：
- 给 AI 做任务导航
- 给开发者做进度统计
- 给后续迭代做索引

任务编号采用：
- `G-` 前缀表示全局任务
- `MVP-` 前缀表示 MVP 专项任务
- `TEST-` 表示测试专项
- `OBS-` 表示可观测性专项

---

## 3.2 全局任务清单

| 编号 | 任务 | 状态 | 说明 |
|---|---|---|---|
| G-01 | 初始化工程 | 未开始 | React + TS + Vite + 基础工具链 |
| G-02 | 建立目录结构 | 未开始 | app/scenes/core/render/store/infra |
| G-03 | 定义基础类型 | 未开始 | Point/Cell/Tile/BoardState/LevelConfig |
| G-04 | 建立关卡配置系统 | 未开始 | 本地静态 level loader |
| G-05 | 建立棋盘生成器 | 未开始 | 根据 LevelConfig 生成初盘 |
| G-06 | 建立渲染器 | 未开始 | Canvas 棋盘渲染 |
| G-07 | 建立输入定位系统 | 未开始 | 点击格子/图块识别 |
| G-08 | 建立选中态系统 | 未开始 | 首次点击、取消、切换 |
| G-09 | 建立 PathFinder | 未开始 | 最多 2 折路径判定 |
| G-10 | 建立 MatchResolver | 未开始 | 同类图块匹配判定 |
| G-11 | 建立消除逻辑 | 未开始 | 图块移除与格子更新 |
| G-12 | 建立 WinLoseChecker | 未开始 | 通关/失败判定 |
| G-13 | 建立 DeadlockDetector | 未开始 | 死局检测 |
| G-14 | 建立 ShuffleManager | 未开始 | 重排并保证至少一组可解 |
| G-15 | 建立 PollutionSystem | 未开始 | 污染生成、衰减、阻挡 |
| G-16 | 建立游戏状态管理 | 未开始 | runtime/store/action |
| G-17 | 建立 HomeScene | 未开始 | 首页 |
| G-18 | 建立 BattleScene | 未开始 | 对局页 |
| G-19 | 建立 ResultScene | 未开始 | 结算页 |
| G-20 | 建立本地存档 | 未开始 | localStorage |
| G-21 | 建立调试面板 | 未开始 | dev only |
| G-22 | 建立基础提示系统 | 未开始 | hint |
| G-23 | 建立简单动画音效 | 未开始 | UI 打磨 |
| G-24 | 建立测试框架 | 未开始 | test infra |
| G-25 | 建立可观测性框架 | 未开始 | logger + telemetry |
| G-26 | 建立基础回归流程 | 未开始 | lint/test/play-check |
| G-27 | 建立未来 API 文档层 | 未开始 | backend contract |
| G-28 | 代码清理与重构 | 未开始 | 提升结构质量 |

---

## 3.3 子任务文档索引

| 子任务编号 | 子文档标题 | 说明 |
|---|---|---|
| G-09 | PathFinder 设计与实现 | 规则、算法、测试 |
| G-13 | DeadlockDetector 设计与实现 | 无解检测策略 |
| G-14 | ShuffleManager 设计与实现 | 重排逻辑 |
| G-15 | PollutionSystem 设计与实现 | 污染机制 |
| TEST-01 | 单元测试设计 | 所有核心逻辑测试 |
| OBS-01 | 可观测性与日志设计 | 事件与错误观测 |
