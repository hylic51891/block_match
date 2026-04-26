# 测试框架设计

## 7.1 测试目标

测试框架要解决的不是"形式上有测试"，而是确保：

1. 路径判定不会悄悄坏掉
2. 重排不会生成无解盘面
3. 污染机制不会出现异常阻塞
4. AI 修改代码后能快速发现回归问题

---

## 7.2 测试分层

### 7.2.1 单元测试
工具：`Vitest`

测试对象：
- PathFinder
- MatchResolver
- DeadlockDetector
- ShuffleManager
- PollutionSystem
- WinLoseChecker

### 7.2.2 集成测试
工具：`Vitest` 或 `React Testing Library`

测试对象：
- 加载关卡
- 点击一对可消图块
- 棋盘更新
- 进入 success/failed

### 7.2.3 端到端测试
工具：`Playwright`（可后置）

目标：
- 模拟启动应用
- 进入 BattleScene
- 完成若干点击
- 验证页面状态切换

### 7.2.4 手动冒烟测试
必须保留一份固定 checklist：
- 关卡 1 是否能通关
- 关卡 3 是否正确引入障碍
- 关卡 11 是否正确引入污染
- 死局时是否可重排
- 重排用尽后是否失败

---

## 7.3 测试目录建议

```text
src/tests/
  unit/
    pathfinder.test.ts
    match-resolver.test.ts
    deadlock-detector.test.ts
    shuffle-manager.test.ts
    pollution-system.test.ts
    winlose-checker.test.ts

  integration/
    battle-flow.test.ts
    level-loading.test.ts

  fixtures/
    boards/
    levels/
```

---

## 7.4 核心测试用例要求

### PathFinder
- 直连成功
- 一折成功
- 两折成功
- 三折失败
- 障碍阻挡失败
- active tile 阻挡失败
- 污染阻挡失败

### DeadlockDetector
- 存在一组可解
- 完全无解
- 仅同类图块存在但路径不可达

### ShuffleManager
- 重排后图块数量不变
- 不覆盖障碍
- 重排后至少一组可解
- 尝试上限内完成

### PollutionSystem
- 路径中的空格被污染
- 起点终点不污染
- 回合推进后衰减
- 过期自动清除

### WinLoseChecker
- 全清成功
- 无解且无重排失败
- 有重排则不判失败

---

## 7.5 测试执行流程

### 每次核心逻辑改动后必须执行
```bash
npm run test
npm run lint
```

### 每次阶段性提交前必须执行
1. 自动测试全通过
2. 手动试玩 3 关
3. 手动验证一次死局 + 重排
4. 手动验证一次污染阻挡

---

## 7.6 AI 测试执行准则

AI 每次提交核心模块代码时必须同时：
- 提交实现
- 提交对应测试
- 说明覆盖的场景
- 说明未覆盖的边界
