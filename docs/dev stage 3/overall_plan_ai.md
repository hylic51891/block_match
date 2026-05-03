# 总体方案（AI 开发者版）

## 2.1 AI 开发目标声明

你正在开发《回路连连看》的第三阶段版本。项目已完成本地可试玩 MVP，当前目标已升级为：

> 开发一个 **完整的、可在微信小游戏运行** 的项目，并将当前产品主形态从“多关卡递进原型”升级为“教学关 + 每日挑战”的挑战制小游戏。

你必须遵守以下总目标：

1. 保留现有核心玩法能力
2. 主流程切换到挑战制
3. 新增微信小游戏适配层
4. 保留 Web 环境用于调试和测试
5. 为分享、广告、登录、排行榜预留清晰接口
6. 文档、架构、任务拆分全部围绕“微信小游戏完整项目”组织

---

## 2.2 AI 开发硬约束

### 2.2.1 架构约束
- 核心玩法逻辑必须继续位于 `core/`
- 平台差异必须通过 adapter / platform 层收敛
- 不允许把微信 API 直接散落到核心规则代码中
- Web 与微信小游戏必须共用主要玩法逻辑
- 挑战制逻辑必须显式建模为模式系统，而不是在页面中硬编码

### 2.2.2 代码约束
- TypeScript 严格模式
- 尽量避免 `any`
- 每个模块单一职责
- 新增平台能力必须有降级或 mock 方案
- 文件改动要优先局部、可验证、可回归

### 2.2.3 测试约束
必须确保以下两类测试都能持续运行：

- **核心逻辑测试**：继续在 Web/Node 环境跑
- **平台适配验证**：提供 mock 或最小运行验证

以下模块必须保持测试可运行：
- PathFinder
- MatchResolver
- DeadlockDetector
- ShuffleManager
- PollutionSystem
- WinLoseChecker
- ChallengeProvider
- LocalProgress migration

### 2.2.4 可观测性约束
以下事件必须可记录，并区分模式：
- tutorial_enter
- tutorial_complete
- daily_challenge_enter
- daily_challenge_start
- match_attempt
- match_success
- match_fail
- shuffle_used
- revive_offer_shown
- share_click
- daily_success
- daily_fail

---

## 2.3 当前开发范围边界

### 本阶段必须做
- 挑战制产品结构
- 教学关
- 每日挑战配置系统
- 微信小游戏平台适配方案
- 结果页与挑战记录模型
- Web + 微信小游戏双环境开发策略
- 第三期任务拆分

### 本阶段建议做
- 分享 payload 抽象
- 激励广告触发点设计
- 微信登录/开放数据域/排行榜协议预留
- 每日挑战远端配置协议

### 本阶段不强制一次做完
- 完整后端
- 复杂活动系统
- 强社交系统
- 复杂付费系统

---

## 2.4 产品主结构

### 主流程
```text
首次进入 -> 教学关 -> 今日挑战 -> 结果页 -> 重试/分享
后续进入 -> 今日挑战 -> 结果页 -> 重试/分享
```

### 非主流程
- 旧 20 关不作为主入口
- 旧 20 关保留为测试/练习/回归素材池

---

## 2.5 技术架构目标

## 2.5.1 总体架构
推荐架构升级为：

```text
src/
  app/                # 启动、路由、模式切换
  scenes/             # Home / Tutorial / DailyChallenge / Result
  core/               # 纯玩法逻辑
  platform/           # Web / WeChat Mini Game 适配层
  services/           # challenge、storage、share、ad、auth 抽象服务
  store/              # runtime 与 UI 状态
  infra/              # logger、telemetry、error-reporter
  tests/              # 核心逻辑与集成测试
```

### 关键原则
- `core/` 不依赖平台
- `platform/` 负责输入、存储、分享、广告、登录等差异能力
- `services/` 负责业务抽象，避免 scene 直接依赖平台 API

---

## 2.5.2 平台分层建议

### WebAdapter
用于：
- 浏览器调试
- 本地测试
- 本地存档
- 假分享/假广告/假登录

### WeChatMiniGameAdapter
用于：
- wx 生命周期适配
- wx 存储
- wx 分享
- wx 激励广告
- wx 登录能力接入
- 后续开放数据域与排行榜能力预留

---

## 2.6 产品模式建模

新增：

```ts
type GameMode = 'tutorial' | 'daily_challenge' | 'practice';
```

说明：
- `tutorial`：教学关
- `daily_challenge`：主玩法
- `practice`：旧 20 关可迁移为非主模式，当前可只保留内部使用

---

## 2.7 数据模型升级方向

### ChallengeConfig
```ts
type ChallengeConfig = {
  id: string;
  date: string;
  mode: 'daily_challenge';
  boardConfig: LevelConfig;
  metadata?: {
    title?: string;
    version?: number;
    difficultyTag?: 'normal' | 'hard' | 'very_hard';
  };
};
```

### TutorialConfig
```ts
type TutorialConfig = {
  id: 'tutorial-main';
  steps: string[];
  boardConfig: LevelConfig;
};
```

### BattleResult
```ts
type BattleResult = {
  mode: 'tutorial' | 'daily_challenge';
  success: boolean;
  durationMs: number;
  shuffleUsed: number;
  reviveUsed: number;
  hintUsed: number;
  challengeDate?: string;
};
```

### LocalProgress
```ts
type LocalProgress = {
  tutorialCompleted: boolean;
  lastChallengeDate?: string;
  dailyBest?: Record<string, BattleResult>;
  settings: {
    audioEnabled: boolean;
  };
};
```

---

## 2.8 第三期产品能力目标

### P0
- GameMode 改造
- 首页切换为挑战制入口
- TutorialLevelProvider
- DailyChallengeProvider
- Result 页挑战化
- 存档结构改造
- 文档全量同步

### P1
- 微信小游戏平台适配层
- 分享数据结构
- 广告触发点设计
- 登录与挑战结果协议预留

### P2
- 每日挑战远端下发
- 排行榜
- 广告真实接入
- 开放数据域适配

---

## 2.9 测试框架要求

### 单元测试
继续保留当前核心规则测试，并新增：
- DailyChallengeProvider
- TutorialLevelProvider
- LocalProgress migration
- 平台 service mock 测试

### 集成测试
需要新增：
- 新用户：首页 -> 教学 -> 今日挑战
- 老用户：首页 -> 今日挑战
- 挑战失败 -> 重试 -> 结果页
- 挑战成功 -> 记录更新

### 平台验证测试
至少设计：
- WebAdapter 正常运行
- WeChatMiniGameAdapter mock 可编译
- 平台接口调用不污染核心规则模块

---

## 2.10 可观测性要求

### 必埋事件
- app_open
- tutorial_enter
- tutorial_complete
- daily_challenge_view
- daily_challenge_start
- daily_success
- daily_fail
- daily_retry
- share_click
- rewarded_ad_offer_shown
- rewarded_ad_complete

### 错误观测
必须区分：
- 核心逻辑错误
- 平台适配错误
- 存档解析错误
- 挑战配置加载错误

---

## 2.11 AI 的交付要求

你在第三期中输出的内容必须至少包括：

1. 更新后的 docs 总览文档
2. 第三期 PRD 文档
3. 第三期开发计划文档
4. 如果涉及平台改造，必须说明新增/修改文件边界
5. 若改造了存档结构，必须说明迁移方案
6. 若设计了微信小游戏能力，必须区分：
   - 当前实现
   - 接口预留
   - 后续接入
