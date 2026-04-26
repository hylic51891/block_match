# 《回路连连看》AI 开发总文档

## 文档说明

本文档以单一 `.md` 大文档形式组织，面向 AI 开发与人类协作开发。  
结构上等价于以下文档集合，但合并在一个文件中：

- 总体方案（人类开发者版）
- 总体方案（AI 开发者版）
- 总体任务总览（AI 进度管理版）
- MVP 子目录文档集合
    - MVP 方案
    - MVP 任务总览
- 测试框架设计
- 可观测性框架设计
- 验证与验收流程
- 子任务拆分索引

本文档目标是让你可以直接把它交给 AI 编程助手，作为：
- 总体设计依据
- 任务拆分依据
- 进度跟踪依据
- 测试与可观测性补全依据

---

# 一、总体方案（人类开发者版）

## 1.1 项目背景

《回路连连看》是一款面向微信小游戏方向演化的轻度休闲益智游戏。  
当前阶段不直接面向微信平台上线，而是先做一个：

- 能在本地浏览器中运行
- 可试玩
- 核心玩法完整
- 架构清晰
- 可被 AI 高效持续开发

的人机协作开发版本。

你的人类开发者角色，不是自己手写全部代码，而是：

1. 为 AI 提供稳定的开发环境
2. 为 AI 提供清晰的目标和边界
3. 审阅关键设计与关键代码
4. 在玩法、产品、取舍、验证上做决策
5. 控制版本节奏，避免 AI 发散

---

## 1.2 当前阶段目标

当前阶段是 **MVP 本地试玩版**，目标明确为：

- 在本地浏览器可运行
- 核心玩法可玩
- 具备基础关卡
- 具备路径判定
- 具备消除逻辑
- 具备失败/成功判定
- 具备污染机制
- 具备重排机制
- 具备最基础的本地存档
- 不依赖微信平台能力
- 不强依赖后端

### 当前阶段不追求
- 复杂美术
- 微信登录
- 广告接入
- 排行榜
- 服务端联机
- 商业化
- 大规模运营活动

---

## 1.3 人类开发者的核心职责

### 1.3.1 搭建开发环境
你需要保证 AI 所工作的环境是稳定的：

- Node.js 20+
- npm 或 pnpm
- TypeScript 5+
- React + Vite 工程
- Git
- 可执行测试
- 可运行浏览器预览

### 1.3.2 固定开发规范
你要给 AI 一个不会频繁变化的规则集：

- 文件命名规范
- 目录结构规范
- TypeScript 严格模式
- 测试必须覆盖核心逻辑
- UI 层不写核心算法
- 关卡配置必须可配置化
- 重要模块必须纯函数优先

### 1.3.3 控制开发顺序
必须控制 AI 先做什么、后做什么。  
正确顺序应当是：

1. 类型定义
2. 棋盘模型
3. 关卡配置
4. 路径判定
5. 匹配与消除
6. 通关/失败判定
7. 重排
8. 污染系统
9. UI 与交互
10. 存档
11. 测试与调试
12. 可观测性

### 1.3.4 做关键决策
以下事情不要交给 AI 自行发散决定：

- MVP 是否支持棋盘外绕行
- 路径转折上限是否固定为 2
- 污染持续回合数
- 首版关卡难度
- 首版是否引入锁链图块
- 首版是否加入时间/步数限制

当前建议统一为：

- 不支持棋盘外绕行
- 最多 2 次转折
- 污染持续 2 回合
- 首版只做污染，不做锁链
- 首版不加时间/步数限制

---

## 1.4 产品定义

### 1.4.1 产品名称
回路连连看

### 1.4.2 产品定位
基于“同图块配对消除 + 有限转折路径连接 + 污染封路机制”的休闲益智小游戏。

### 1.4.3 产品核心卖点
1. 上手快：规则简单
2. 有策略：清除顺序重要
3. 差异化：不是传统连连看，也不是羊了个羊式堆叠三消
4. 易扩展：后续可增加障碍、道具、活动和微信小游戏能力

### 1.4.4 目标用户
- 喜欢轻益智游戏的用户
- 喜欢消除、连线、配对类玩法的用户
- 追求碎片时间轻娱乐的用户

---

## 1.5 核心玩法定义

### 1.5.1 基础规则
- 玩家点击两个相同图块
- 若两者可通过合法路径连接，则消除
- 棋盘全部清空则通关
- 若棋盘进入死局且没有重排次数，则失败

### 1.5.2 路径规则
- 路径只能水平或垂直移动
- 最多允许 2 次转折
- 路径不能穿过障碍
- 路径不能穿过其他 active 图块
- 路径不能穿过污染格
- MVP 内路径不允许绕出棋盘外

### 1.5.3 差异化机制：污染地块
- 每次成功连线后，路径经过的空白格会变为污染格
- 污染格在接下来若干回合内不可被穿过
- 污染格会随回合衰减并恢复为空白格

### 1.5.4 失败条件
- 当前盘面无可消除图块对
- 且剩余重排次数为 0

### 1.5.5 通关条件
- 所有图块被消除

---

## 1.6 技术路线

### 1.6.1 当前阶段推荐技术栈
- React
- TypeScript
- Vite
- Canvas 2D
- Zustand 或轻量状态管理
- Vitest
- ESLint
- Prettier

### 1.6.2 为什么这样选
因为当前目标是：
- AI 高效参与
- 本地快速试玩
- 核心玩法优先
- 可快速验证和修改

### 1.6.3 不建议当前阶段使用
- Unity
- Cocos Creator（首版可以不选）
- 后端优先开发
- 重度状态机框架
- 重 UI 组件库

---

## 1.7 后端定位

当前阶段后端不作为必须项。  
但为了未来迁移，应预留以下能力设计：

- 用户系统
- 关卡配置下发
- 进度同步
- 结算上报
- 排行榜
- 埋点数据上报
- 活动系统

当前只做接口和表设计，不强制实现。

---

## 1.8 数据库 / API 设计（概览）

### 1.8.1 数据库未来建议
- MySQL
- Redis（未来）
- 对象存储（未来素材）

### 1.8.2 核心表
- users
- user_progress
- level_configs
- user_level_records
- match_logs
- daily_challenge_records

### 1.8.3 核心接口
- `/api/v1/auth/login`
- `/api/v1/progress`
- `/api/v1/levels`
- `/api/v1/levels/{levelId}`
- `/api/v1/levels/{levelId}/settlement`
- `/api/v1/events/batch`

---

## 1.9 测试与可观测性要求

当前版本必须从一开始就内建：
- 单元测试
- 基础集成测试
- 调试日志
- 开发态调试面板
- 最小行为埋点接口抽象
- 错误收集入口

原因是：
- 游戏逻辑多，Bug 容易隐藏
- AI 生成代码如果没有测试护栏，后续极易漂移
- 可观测性不足时，很难定位“无解但不该无解”的问题

---

## 1.10 人类开发者验收标准

你最终不是看“代码写了多少”，而是验收：

1. 本地是否能一键启动
2. 至少 20 个关卡是否可玩
3. 路径判定是否稳定
4. 死局与重排是否正确
5. 污染机制是否生效
6. 核心测试是否通过
7. 调试与日志是否可用
8. 代码结构是否清晰，后续是否适合继续交给 AI

---

# 二、总体方案（AI 开发者版）

## 2.1 AI 开发目标声明

你正在开发一个名为《回路连连看》的益智小游戏 MVP。  
你必须遵守以下核心目标：

1. 先做本地可玩版本
2. 不依赖微信小游戏平台能力
3. 不强依赖后端
4. 核心玩法逻辑必须先于 UI 完成
5. 所有核心逻辑必须可测试
6. 项目必须具备后续迁移到微信小游戏的潜力

---

## 2.2 AI 开发硬约束

### 2.2.1 架构约束
- 核心玩法逻辑必须位于 `core/`
- 路径判定不得写在 React 组件中
- Canvas 渲染不得修改核心游戏状态
- 关卡必须配置化
- 所有核心规则模块优先纯函数实现

### 2.2.2 代码约束
- TypeScript 严格模式
- 尽量避免 `any`
- 每个文件单一职责
- 每个核心模块必须有明确输入输出
- 函数式逻辑优先
- 不允许在 UI 组件中混杂复杂业务流程

### 2.2.3 测试约束
以下模块必须有单元测试：
- PathFinder
- MatchResolver
- DeadlockDetector
- ShuffleManager
- PollutionSystem
- WinLoseChecker

### 2.2.4 可观测性约束
以下事件必须可记录：
- level_loaded
- tile_selected
- match_attempt
- match_success
- match_fail
- shuffle_used
- level_success
- level_failed
- pollution_applied
- deadlock_detected

---

## 2.3 AI 开发优先级

### P0
- 类型定义
- 棋盘模型
- 关卡配置
- 路径判定
- 匹配消除
- 通关失败判定

### P1
- 重排
- 污染系统
- 场景切换
- 本地存档
- 调试面板

### P2
- 提示系统
- 动画
- 音效
- 基础埋点
- 可观测性增强

---

## 2.4 AI 开发范围边界

### 本阶段要做
- Web 端本地可试玩
- 最少 20 个关卡
- 核心差异化机制：污染
- 调试能力
- 测试框架
- 可观测性框架最小版本

### 本阶段不做
- 微信登录
- 分享
- 激励广告
- 排行榜
- 服务端真实实现
- 商业化
- 复杂皮肤系统

---

## 2.5 技术架构

## 2.5.1 前端架构分层

### app 层
负责：
- 启动
- 路由
- 全局配置

### scenes 层
负责页面和场景：
- HomeScene
- BattleScene
- ResultScene

### core 层
负责纯玩法逻辑：
- board
- level
- rules
- systems
- engine

### render 层
负责：
- Canvas 绘制
- 路径绘制
- 效果绘制

### store 层
负责：
- 游戏运行态
- UI 状态

### infra 层
负责：
- storage
- logger
- debug
- telemetry

---

## 2.5.2 推荐目录结构

```text
src/
  app/
  scenes/
  core/
    board/
    level/
    rules/
    systems/
    engine/
  render/
  store/
  infra/
  utils/
  hooks/
  types/
  assets/
  tests/
```

---

## 2.6 数据模型

### Point
```ts
type Point = { x: number; y: number };
```

### Cell
```ts
type Cell = {
  x: number;
  y: number;
  kind: 'empty' | 'tile' | 'obstacle' | 'pollution';
  tileId?: string;
  obstacleType?: 'rock';
  pollutionExpireTurn?: number;
};
```

### Tile
```ts
type Tile = {
  id: string;
  type: string;
  x: number;
  y: number;
  state: 'active' | 'selected' | 'removed';
};
```

### BoardState
```ts
type BoardState = {
  width: number;
  height: number;
  cells: Cell[][];
  tiles: Record<string, Tile>;
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
  tileCountPerType: number;
  obstacles: Array<{ x: number; y: number; type: 'rock' }>;
  pollution: {
    enabled: boolean;
    durationTurns: number;
  };
  shuffleLimit: number;
  target: { type: 'clear_all' };
  tutorial?: {
    title?: string;
    message?: string;
  };
};
```

### GameRuntimeState
```ts
type GameRuntimeState = {
  levelId: string;
  board: BoardState;
  selectedTileId?: string;
  turn: number;
  shuffleRemaining: number;
  matchCount: number;
  status: 'idle' | 'loading' | 'playing' | 'checking' | 'success' | 'failed';
  failReason?: 'deadlock' | 'no_shuffle' | 'manual' | 'unknown';
  lastPath: Point[];
};
```

---

## 2.7 核心规则

### PathFinder
- 最多 2 次转折
- 不穿越障碍
- 不穿越 active tile
- 不穿越污染格
- 不出棋盘

### MatchResolver
- 只允许同类型图块匹配
- 允许返回 path 和 turns
- 失败原因必须结构化

### DeadlockDetector
- 检查当前是否至少有一组合法匹配

### ShuffleManager
- 重新分配剩余 active tile 位置
- 不改变图块类型分布
- 重排后必须至少存在一组合法匹配

### PollutionSystem
- 根据成功路径污染中间空格
- 回合推进时衰减污染

---

## 2.8 状态机

### 顶层状态
```text
idle -> loading -> playing -> checking -> success/failed
```

### playing 子流程
```text
select A -> select B -> resolve match
  -> success: remove -> pollution -> turn+1 -> checking
  -> fail: feedback -> continue playing
```

---

## 2.9 数据库设计（未来扩展）

### users
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  open_id VARCHAR(64) NOT NULL UNIQUE,
  nickname VARCHAR(64) DEFAULT '',
  avatar_url VARCHAR(255) DEFAULT '',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

### user_progress
```sql
CREATE TABLE user_progress (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  current_level_id VARCHAR(32) NOT NULL,
  unlocked_level_count INT NOT NULL DEFAULT 1,
  total_star INT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uk_user (user_id)
);
```

### level_configs
```sql
CREATE TABLE level_configs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  level_id VARCHAR(32) NOT NULL UNIQUE,
  version INT NOT NULL DEFAULT 1,
  config_json JSON NOT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

### user_level_records
```sql
CREATE TABLE user_level_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  level_id VARCHAR(32) NOT NULL,
  best_score INT NOT NULL DEFAULT 0,
  best_star INT NOT NULL DEFAULT 0,
  success_count INT NOT NULL DEFAULT 0,
  fail_count INT NOT NULL DEFAULT 0,
  last_play_at DATETIME NULL,
  UNIQUE KEY uk_user_level (user_id, level_id)
);
```

### match_logs
```sql
CREATE TABLE match_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  level_id VARCHAR(32) NOT NULL,
  result TINYINT NOT NULL,
  duration_ms INT NOT NULL,
  move_count INT NOT NULL,
  shuffle_used INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL
);
```

---

## 2.10 API 设计（未来扩展）

### 登录
`POST /api/v1/auth/login`

### 获取进度
`GET /api/v1/progress`

### 获取关卡列表
`GET /api/v1/levels`

### 获取单关配置
`GET /api/v1/levels/{levelId}`

### 提交结算
`POST /api/v1/levels/{levelId}/settlement`

### 上报事件
`POST /api/v1/events/batch`

### 统一返回结构
```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

---

## 2.11 测试框架设计

### 单元测试
使用 `Vitest`

必须覆盖：
- PathFinder
- DeadlockDetector
- ShuffleManager
- PollutionSystem
- WinLoseChecker

### 集成测试
验证：
- 加载关卡 -> 点击图块 -> 消除 -> 通关/失败流程

### UI/交互测试
可选使用：
- React Testing Library
- Playwright

### 回归测试
要求 AI 在修改核心逻辑后必须执行：
- `npm run test`
- 对关键场景至少手工试玩 3 关

---

## 2.12 可观测性框架设计

### 最小日志体系
创建 `infra/logger.ts`

支持：
- debug
- info
- warn
- error

### 最小事件埋点体系
创建 `infra/telemetry.ts`

事件结构：
```ts
type TelemetryEvent = {
  event: string;
  timestamp: number;
  payload?: Record<string, unknown>;
};
```

### 必埋事件
- level_loaded
- level_started
- tile_selected
- match_attempt
- match_success
- match_fail
- pollution_applied
- shuffle_used
- deadlock_detected
- level_success
- level_failed

### 错误观测
必须有统一异常上报入口：
- render error
- core logic assertion error
- storage parse error

---

# 三、总体任务总览（面向 AI）

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

## 3.3 子任务文档索引建议

如果后续拆成多文档，可用如下索引方式：

| 子任务编号 | 子文档标题 | 说明 |
|---|---|---|
| G-09 | PathFinder 设计与实现 | 规则、算法、测试 |
| G-13 | DeadlockDetector 设计与实现 | 无解检测策略 |
| G-14 | ShuffleManager 设计与实现 | 重排逻辑 |
| G-15 | PollutionSystem 设计与实现 | 污染机制 |
| TEST-01 | 单元测试设计 | 所有核心逻辑测试 |
| OBS-01 | 可观测性与日志设计 | 事件与错误观测 |

---

# 四、MVP/任务总览（面向 AI）

## 4.1 MVP 目标声明

MVP 目标是：

> 在本地浏览器中实现一个可试玩的《回路连连看》版本，具备最小完整玩法闭环，不依赖微信平台能力，不强依赖后端。

---

## 4.2 MVP 范围

### 必做
- 关卡加载
- 棋盘生成
- 图块渲染
- 点击交互
- 路径判定
- 同类匹配
- 消除
- 通关
- 死局
- 重排
- 污染机制
- 本地存档
- 基础调试能力
- 核心测试
- 最小可观测性

### 不做
- 微信登录
- 排行榜
- 广告
- 后端真实实现
- 用户系统
- 商业化
- 活动系统

---

## 4.3 MVP 成功标准

| 项目 | 标准 |
|---|---|
| 运行 | `npm run dev` 可打开 |
| 玩法 | 至少 20 关可玩 |
| 判定 | PathFinder 稳定 |
| 无解处理 | 死局检测与重排正确 |
| 差异化 | 污染机制生效 |
| 存档 | 可恢复当前进度 |
| 测试 | 核心单元测试通过 |
| 观测 | 日志与埋点基础可用 |

---

# 五、MVP 方案（面向 AI）

## 5.1 MVP 实现优先级

### 阶段 A：逻辑底座
1. 类型定义
2. 棋盘模型
3. 关卡配置
4. 棋盘生成器
5. PathFinder
6. MatchResolver

### 阶段 B：可玩闭环
7. 图块点击
8. 消除
9. 通关判定
10. 死局检测
11. 重排
12. 污染系统

### 阶段 C：产品外壳
13. HomeScene
14. BattleScene
15. ResultScene
16. 本地存档
17. HUD

### 阶段 D：质量体系
18. 单元测试
19. 集成测试
20. 调试面板
21. 日志与埋点
22. 回归流程

---

## 5.2 MVP 目录建议

```text
src/
  app/
  scenes/
  core/
  render/
  store/
  infra/
  tests/
  types/
```

---

## 5.3 MVP 关卡建议

### 关卡 1-5
- 无污染
- 无障碍或极少障碍
- 帮助理解基本连线

### 关卡 6-10
- 加障碍
- 强化绕路

### 关卡 11-15
- 引入污染
- 污染持续 2 回合

### 关卡 16-20
- 小型挑战关
- 增加图块种类
- 限制重排次数

---

# 六、MVP 任务总览（面向 AI 进度管理）

## 6.1 MVP 任务清单

| 编号 | 任务 | 说明 |
|---|---|---|
| MVP-01 | 初始化 MVP 工程 | Vite + React + TS |
| MVP-02 | 定义 MVP 类型 | 最小类型闭环 |
| MVP-03 | 编写 4 个样例关卡 | level-001 ~ level-004 |
| MVP-04 | 实现棋盘生成器 | 根据关卡配置生成 |
| MVP-05 | 实现 CanvasRenderer | 绘制格子、图块、障碍 |
| MVP-06 | 实现点击定位 | 点击格子识别 |
| MVP-07 | 实现选中态 | 选中、取消、切换 |
| MVP-08 | 实现 PathFinder | 路径规则核心 |
| MVP-09 | 实现 MatchResolver | 同类匹配判定 |
| MVP-10 | 实现图块消除 | 修改 BoardState |
| MVP-11 | 实现通关判定 | 全清成功 |
| MVP-12 | 实现死局检测 | 无解判断 |
| MVP-13 | 实现重排 | 保证至少一组可解 |
| MVP-14 | 实现污染系统 | 生成、衰减、阻挡 |
| MVP-15 | 实现 BattleScene 流程 | 可完整打一局 |
| MVP-16 | 实现 HomeScene | 首页入口 |
| MVP-17 | 实现 ResultScene | 成功/失败结算 |
| MVP-18 | 实现本地存档 | 关卡进度 |
| MVP-19 | 实现 HUD | 当前关卡与重排信息 |
| MVP-20 | 实现测试框架 | 单元测试与基本集成 |
| MVP-21 | 实现调试面板 | 开发态辅助 |
| MVP-22 | 实现 logger | 调试日志 |
| MVP-23 | 实现 telemetry | 埋点抽象 |
| MVP-24 | 建立回归脚本 | lint/test/manual-check |
| MVP-25 | 打磨首版体验 | 简单动画音效 |

---

# 七、测试框架设计（补齐）

## 7.1 测试目标

测试框架要解决的不是“形式上有测试”，而是确保：

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

---

# 八、可观测性框架设计（补齐）

## 8.1 为什么这个项目必须有可观测性

游戏项目里最容易出现的问题是：

- 看起来能跑，但某些关卡无解
- 某个状态切换错乱
- 某次消除后污染没衰减
- 某类失败用户感知不明显
- AI 改了代码，但不知道行为是否变了

所以必须建立最小可观测性框架。

---

## 8.2 可观测性目标

当前阶段目标不是做完整监控平台，而是做到：

1. 本地开发时能看到关键状态变化
2. 出错时能快速定位模块
3. 可以输出关键行为事件
4. 后续容易接服务端日志与埋点

---

## 8.3 最小日志框架

### 模块
`infra/logger.ts`

### 日志等级
- debug
- info
- warn
- error

### 记录内容
- 时间
- 模块名
- 事件名
- payload

### 示例
```ts
logger.info('PathFinder', 'path_found', {
  start,
  end,
  turns,
});
```

---

## 8.4 最小埋点框架

### 模块
`infra/telemetry.ts`

### 事件结构
```ts
type TelemetryEvent = {
  event: string;
  timestamp: number;
  payload?: Record<string, unknown>;
};
```

### 必埋事件
- level_loaded
- level_started
- tile_selected
- match_attempt
- match_success
- match_fail
- path_found
- path_not_found
- pollution_applied
- pollution_decayed
- shuffle_used
- deadlock_detected
- level_success
- level_failed
- storage_loaded
- storage_parse_failed

### MVP 阶段处理方式
- 先输出到 console
- 可选缓存到内存数组
- 预留 batch export 接口

---

## 8.5 错误观测

### 错误来源
- PathFinder 异常
- BoardState 非法
- localStorage 解析失败
- UI 渲染异常
- 非预期状态机切换

### 处理方式
统一走：
`infra/error-reporter.ts`

### 错误结构
```ts
type ErrorEvent = {
  module: string;
  message: string;
  stack?: string;
  extra?: Record<string, unknown>;
  timestamp: number;
};
```

---

## 8.6 开发态调试面板

开发环境下应显示：
- 当前 levelId
- 当前 turn
- selectedTileId
- shuffleRemaining
- 当前状态
- 当前污染格数量
- 是否有解

支持按钮：
- 强制重排
- 清理污染
- 下一关
- 打印棋盘
- 导出最近 telemetry

---

## 8.7 可观测性验证流程

### 验证点 1：路径判定
执行一次成功消除后，应可看到：
- match_attempt
- path_found
- match_success

### 验证点 2：污染机制
执行一次污染触发后，应可看到：
- pollution_applied
- pollution_decayed

### 验证点 3：失败场景
触发死局失败后，应可看到：
- deadlock_detected
- level_failed

### 验证点 4：存档异常
故意写入坏数据后，应可看到：
- storage_parse_failed

---

# 九、数据库 / API 设计（完整版）

## 9.1 设计原则

虽然 MVP 不强依赖后端，但必须从一开始定义清楚未来契约，避免后续重构代价过高。

### 原则
1. 配置下发和运行逻辑解耦
2. 进度与结算结构化
3. 埋点批量上报
4. 响应结构统一
5. 服务端不接管局内逐步操作，只接收结果和统计

---

## 9.2 数据库表结构

### users
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  open_id VARCHAR(64) NOT NULL UNIQUE,
  nickname VARCHAR(64) DEFAULT '',
  avatar_url VARCHAR(255) DEFAULT '',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

### user_progress
```sql
CREATE TABLE user_progress (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  current_level_id VARCHAR(32) NOT NULL,
  unlocked_level_count INT NOT NULL DEFAULT 1,
  total_star INT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uk_user (user_id)
);
```

### level_configs
```sql
CREATE TABLE level_configs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  level_id VARCHAR(32) NOT NULL UNIQUE,
  version INT NOT NULL DEFAULT 1,
  config_json JSON NOT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

### user_level_records
```sql
CREATE TABLE user_level_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  level_id VARCHAR(32) NOT NULL,
  best_score INT NOT NULL DEFAULT 0,
  best_star INT NOT NULL DEFAULT 0,
  success_count INT NOT NULL DEFAULT 0,
  fail_count INT NOT NULL DEFAULT 0,
  last_play_at DATETIME NULL,
  UNIQUE KEY uk_user_level (user_id, level_id)
);
```

### match_logs
```sql
CREATE TABLE match_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  level_id VARCHAR(32) NOT NULL,
  result TINYINT NOT NULL,
  duration_ms INT NOT NULL,
  move_count INT NOT NULL,
  shuffle_used INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL
);
```

### event_logs
```sql
CREATE TABLE event_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  event_name VARCHAR(64) NOT NULL,
  payload_json JSON NULL,
  created_at DATETIME NOT NULL
);
```

---

## 9.3 API 设计

## 9.3.1 登录
`POST /api/v1/auth/login`

请求：
```json
{
  "code": "wx-login-code"
}
```

响应：
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": 1,
      "nickname": "user",
      "avatarUrl": ""
    }
  }
}
```

## 9.3.2 获取玩家进度
`GET /api/v1/progress`

## 9.3.3 获取关卡列表
`GET /api/v1/levels`

## 9.3.4 获取单关配置
`GET /api/v1/levels/{levelId}`

## 9.3.5 提交关卡结算
`POST /api/v1/levels/{levelId}/settlement`

请求：
```json
{
  "result": "success",
  "durationMs": 52340,
  "moveCount": 18,
  "shuffleUsed": 1,
  "star": 2
}
```

## 9.3.6 上报事件
`POST /api/v1/events/batch`

请求：
```json
{
  "events": [
    {
      "event": "level_start",
      "timestamp": 1777180000,
      "properties": {
        "levelId": "level-001"
      }
    }
  ]
}
```

---

# 十、详细子任务拆分（面向 AI）

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

# 十一、推荐交付顺序

## 第一批
- ST-01
- ST-02
- ST-03
- ST-04
- ST-05

## 第二批
- ST-06
- ST-07
- ST-08
- ST-09
- TEST-01

## 第三批
- ST-10
- ST-11
- ST-12
- ST-13
- TEST-02
- TEST-05

## 第四批
- ST-14
- ST-15
- TEST-03
- TEST-04

## 第五批
- ST-16
- ST-17
- ST-18
- ST-19
- ST-20

## 第六批
- OBS-01
- OBS-02
- OBS-03
- OBS-04
- TEST-06
- TEST-07

---

# 十二、最终验收标准

## 12.1 功能验收
- 本地可启动
- 首页、对局页、结算页完整
- 至少 20 个关卡可玩
- 路径规则正确
- 污染规则正确
- 死局/重排正确
- 可通关、可失败

## 12.2 工程验收
- 结构清晰
- 类型清晰
- 核心逻辑与 UI 解耦
- 关键模块有测试
- 有调试能力
- 有日志与埋点能力

## 12.3 AI 协作验收
- 任务粒度清晰
- 适合继续分批交给 AI
- 每次改动有可验证标准
- 可以做进度统计和回归检查

---

# 十三、给 AI 的最终执行指令模板

## 13.1 单任务执行模板

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

---

## 13.2 重构任务模板

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

---

# 十四、结语

这个文档的核心思想是：

> 先把《回路连连看》做成一个“适合 AI 持续开发”的项目，而不是一次性把所有功能堆出来。

对于你现在的阶段，最重要的不是：
- 把微信能力接完
- 把后端写全
- 把 UI 做花哨

而是先建立：
1. 清晰的玩法模型
2. 稳定的工程结构
3. 可测试的核心逻辑
4. 最小可观测性
5. 可被 AI 持续接管的任务体系

如果你愿意，下一条我可以继续把这份总文档进一步细化成：

1. **《回路连连看》首批 10 个子任务的可直接执行 Prompt 清单**
2. **《回路连连看》前端目录结构 + 初始 TypeScript 文件骨架**
3. **《回路连连看》首版 20 个关卡配置草案**

你只要回复一句：

> 继续，先给我首批 10 个子任务的可执行 Prompt 清单

我就可以直接接着往下写。