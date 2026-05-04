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
1. 首页点击 **"开始教学"** → 进入教学关（6×6，4 种图块，含 1 对 S + 1 对 T）
2. 教学关通关后回到首页，主按钮变为 **"今日挑战"**
3. 点击进入当日挑战

### 老用户
1. 首页直接点击 **"今日挑战"**
2. 首页显示今日最佳记录

### 对局操作
- **选图块**：点击一个图块选中（高亮），再点另一个同类图块尝试配对
- **消除**：两图块间存在合法路径则消除（普通图块最多 2 折）
- **重排**：点击 HUD 中的"重排"按钮重新分配剩余图块位置，**同时清除所有污染和灵能轨迹**
- **提示**：点击 HUD 中的"提示"按钮高亮一组可消图块
- **退出**：点击"退出"返回首页

### 灵能图块
| 类型 | 连线能力 | 匹配后效果 |
|------|---------|-----------|
| S（粉红，金色边框） | 可穿污染格 + 3 折 | 路径留灵能轨迹，不产生污染 |
| T（翠绿，青色边框） | 可穿污染格 + 2 折 | 清除路径周围污染，不产生污染 |

关键：**任一方是 S/T 即可穿污染；任一方是特殊图块，匹配后不产生路径污染**

### 结果页
- 通关：显示用时/重排次数，每日挑战对比最佳记录
- 失败：显示失败原因（无路可走 / 污染封路 / 重排用尽 / 超时）
- 失败后可复活（每日挑战，看激励广告 → 恢复 + 奖励时间 + 奖励重排）
- 可选：重试、分享、返回首页

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

### 当前测试结构（120 用例，23 文件）

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
    engine/
      revive-flow.test.ts        # 复活流程纯函数（8 用例）
    platform/
      web-adapter.test.ts        # Web 适配器（4 用例）
      wechat-adapter.test.ts     # 微信适配器 stub（7 用例）
    services/
      challenge-service.test.ts  # 挑战服务（8 用例）
      reward-ad-service.test.ts  # 广告服务（2 用例）
      share-service.test.ts      # 分享服务（3 用例）
      auth-service.test.ts       # 认证服务（2 用例）
    storage/
      migration.test.ts          # 存档迁移（3 用例）
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
npx tsc --noEmit

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
6. S 图块：连线穿过污染格，路径留粉色轨迹，不产生新污染
7. T 图块：连线穿过污染格，匹配后清除周围污染，不产生新污染
8. 死局 → 提示按钮不可用 → 重排 → 污染和轨迹全部清除 → 继续
9. 重排用尽 → 失败 → 复活弹窗（每日挑战） → 看广告复活
10. 刷新页面 → 进度保留
11. 控制台可见埋点事件输出
