# 总体方案（AI 开发者版）

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
