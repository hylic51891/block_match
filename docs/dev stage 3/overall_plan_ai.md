# 第三期总体方案

> **已实施完成**。本文档记录三期设计目标与当前实现状态。

## 已实现架构

```
src/
  core/          纯玩法逻辑（不依赖平台）
  platform/      WebAdapter + WeChatMiniGameAdapter 骨架
  services/      ChallengeService / ShareService / RewardAdService / AuthService / LeaderboardService
  store/         game-store + challenge-store + ui-store
  infra/         storage / share / ad / leaderboard / remote-config / telemetry / error-reporter
```

## 已实现产品结构

- 教学关 + 每日挑战（挑战制）
- GameParams 数据驱动参数（远程热更新）
- 复活流程（激励广告 → 恢复游戏）
- 分享 Payload（文案模板）
- 20+ 埋点事件常量化

## 已实现核心规则（试玩修正后）

- 任一方是 S/T → 连线可穿污染
- 任一方是 S → 允许 3 弯
- 任一方是特殊图块 → 匹配后不产生路径污染
- S 匹配留灵能轨迹（2 回合，可通行）
- T 匹配清除路径周围污染
- 重排清除全部污染和轨迹
- 障碍物 seeded RNG 随机生成，保证偶数
- 棋盘 100% 填充，所有图块成对

## 待后续实施

- 真实微信小游戏 API 接入（当前为 stub）
- 真实广告 SDK 接入
- 排行榜完整上线
- 远端配置下发
- 开放数据域联调
