# 子任务拆分索引

## 10.1 基础工程子任务

### ST-01 初始化前端工程
输出：
- React + TS + Vite
- ESLint / Prettier / Vitest

### ST-02 建立目录结构
输出：
- app/scenes/core/render/store/infra/tests

### ST-03 基础类型定义
输出：
- common.ts
- board.ts
- level.ts
- game.ts
- api.ts

---

## 10.2 核心玩法子任务

### ST-04 LevelLoader
### ST-05 BoardGenerator
### ST-06 CanvasRenderer
### ST-07 Tile hit testing
### ST-08 Selection manager
### ST-09 PathFinder
### ST-10 MatchResolver
### ST-11 Remove tiles
### ST-12 WinLoseChecker
### ST-13 DeadlockDetector
### ST-14 ShuffleManager
### ST-15 PollutionSystem

---

## 10.3 场景与流程子任务

### ST-16 HomeScene
### ST-17 BattleScene
### ST-18 ResultScene
### ST-19 BattleHUD
### ST-20 LocalStorage persistence

---

## 10.4 测试子任务

### TEST-01 PathFinder unit tests
### TEST-02 DeadlockDetector unit tests
### TEST-03 ShuffleManager unit tests
### TEST-04 PollutionSystem unit tests
### TEST-05 WinLoseChecker unit tests
### TEST-06 Battle flow integration tests
### TEST-07 Manual smoke checklist

---

## 10.5 可观测性子任务

### OBS-01 logger.ts
### OBS-02 telemetry.ts
### OBS-03 error-reporter.ts
### OBS-04 debug-panel.tsx
### OBS-05 telemetry validation flow

---

## 11 推荐交付顺序

### 第一批
- ST-01
- ST-02
- ST-03
- ST-04
- ST-05

### 第二批
- ST-06
- ST-07
- ST-08
- ST-09
- TEST-01

### 第三批
- ST-10
- ST-11
- ST-12
- ST-13
- TEST-02
- TEST-05

### 第四批
- ST-14
- ST-15
- TEST-03
- TEST-04

### 第五批
- ST-16
- ST-17
- ST-18
- ST-19
- ST-20

### 第六批
- OBS-01
- OBS-02
- OBS-03
- OBS-04
- TEST-06
- TEST-07

---

## 13 AI 执行指令模板

### 13.1 单任务执行模板

```md
你现在要完成《回路连连看》项目中的一个子任务。

任务编号：{TASK_ID}
任务名称：{TASK_NAME}

项目背景：
- 这是一个 React + TypeScript + Vite + Canvas 2D 的本地试玩小游戏
- 核心玩法是同图块配对消除，路径最多 2 折
- 路径不能穿越障碍、active tile、污染格
- 当前阶段不依赖微信平台，不强依赖后端

本任务输入：
- {INPUTS}

本任务输出：
- {OUTPUTS}

必须遵守：
1. 核心逻辑不得写进 React 组件
2. 使用 TypeScript 严格类型
3. 若本任务属于核心逻辑模块，必须补充 Vitest 测试
4. 不要修改无关文件
5. 输出变更文件列表
6. 输出验收说明

验收标准：
- {ACCEPTANCE_CRITERIA}
```

### 13.2 重构任务模板

```md
请对《回路连连看》当前代码做一次局部重构。

目标模块：
- {MODULES}

要求：
1. 保持功能不变
2. 提升模块边界清晰度
3. 清理重复逻辑
4. 不引入新的框架依赖
5. 确保测试继续通过
6. 输出重构前后结构说明
```
