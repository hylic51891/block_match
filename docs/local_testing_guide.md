# 本地测试与游玩指南

## 环境要求

- Node.js 20+
- npm

## 启动开发服务器

```bash
npm install
npm run dev
```

浏览器打开终端输出的地址（默认 `http://localhost:5173`）。

## 游玩流程

### 新用户
1. 首页点击 **"开始教学"** → 进入教学关（6×6，4 种图块，含 1 对灵能图块 S）
2. 教学关通关后回到首页，主按钮变为 **"今日挑战"**
3. 点击进入当日挑战（8×8 或 10×8，含污染机制 + S/T 灵能图块）

### 老用户
1. 首页直接点击 **"今日挑战"**
2. 首页显示今日最佳记录

### 对局操作
- **选图块：** 点击一个图块选中（高亮），再点另一个同类图块尝试配对
- **消除：** 两图块间存在合法路径（最多 2 折，灵能图块 S 允许 3 折且可穿污染格）则消除
- **重排：** 点击 HUD 中的"重排"按钮重新分配剩余图块位置
- **提示：** 点击 HUD 中的"提示"按钮高亮一组可消图块（2 秒）
- **退出：** 点击"退出"返回首页

### 灵能图块
| 类型 | 能力 |
|------|------|
| S（粉红，金色边框） | 可穿过污染格 + 路径允许 3 折 |
| T（翠绿，青色边框） | 匹配后清除路径周围污染格 |

### 结果页
- 通关：显示用时/重排次数，每日挑战对比最佳记录
- 失败：显示失败原因（无路可走 / 污染封路 / 重排用尽）
- 可选：重试、分享（Mock 控制台输出）、返回首页

### 调试面板
开发环境下首页底部显示 DebugPanel，可查看游戏状态、强制重排、清除污染、导出埋点等。

---

## 运行测试

```bash
# 运行全部测试
npm run test

# 监听模式（开发时推荐）
npm run test:watch
```

### 测试结构

```
src/tests/
  unit/                          # 单元测试
    path-finder.test.ts          # 路径判定（10 用例）
    match-resolver.test.ts       # 匹配判定（5 用例）
    deadlock-detector.test.ts    # 死局检测（5 用例）
    shuffle-manager.test.ts      # 重排逻辑（6 用例）
    pollution-system.test.ts     # 污染系统（6 用例）
    purify.test.ts               # T 图块净化（4 用例）
    win-lose-checker.test.ts     # 胜负判定（6 用例）
    hint-manager.test.ts         # 提示系统（5 用例）
    challenge/
      daily-provider.test.ts     # 每日挑战生成（4 用例）
      tutorial-provider.test.ts  # 教学关配置（4 用例）
      challenge-record.test.ts   # 挑战记录读写（5 用例）
    infra/
      services.test.ts           # 分享/广告/排行榜 Mock（7 用例）
  integration/                   # 集成测试
    battle-flow.test.ts          # 完整对局流程（4 用例）
    challenge-flow.test.ts       # 挑战制流程（8 用例）
    level-loading.test.ts        # 关卡加载（4 用例）
  fixtures/                      # 测试辅助
    boards.ts                    # 预构造棋盘
    levels.ts                    # 测试用关卡配置
```

---

## 类型检查与构建

```bash
# TypeScript 类型检查
npm run lint

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

---

## 手动冒烟测试清单

每次改动后建议执行：

1. `npm run test` — 全部测试通过
2. `npm run dev` — 启动后首页正常显示
3. 首次进入 → 教学关可通关
4. 今日挑战 → 可成功/失败/重试
5. 污染格：消除后观察路径空白格变污染，回合推进后污染衰减
6. T 图块：匹配后观察路径周围污染被清除
7. 死局 → 提示按钮不可用 → 重排 → 继续
8. 重排用尽 → 失败 → 结果页显示失败原因
9. 刷新页面 → 进度保留
10. 控制台可见埋点事件输出
