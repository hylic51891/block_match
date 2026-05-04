# 第三期 PRD（微信小游戏完整项目版）

> **状态：已实施完成**，120 测试通过。

## 1. 产品定位

一款基于"路径配对 + 污染封路 + 灵能图块"的轻度休闲益智挑战小游戏。

## 2. 核心产品结构

- **教学关**：首次进入时触发，帮助用户快速理解玩法
- **每日挑战**：每天 1 局，全体玩家共享同一主挑战盘面

## 3. 用户流程

```
新用户: 启动 → 首页 → 教学关 → 今日挑战 → 结果页 → 重试/分享
老用户: 启动 → 首页 → 今日挑战 → 结果页 → 重试/分享
失败:   失败 → 复活弹窗（每日挑战）→ 看广告复活 / 放弃 → 结果页
```

## 4. 灵能图块（已实现，试玩修正后规则）

| 类型 | 连线能力 | 匹配后效果 |
|------|---------|-----------|
| S（相位灵能） | 穿污染 + 3 弯 | 留灵能轨迹，不产生污染 |
| T（净化灵能） | 穿污染 + 2 弯 | 清除路径周围污染，不产生污染 |

关键：**任一方是 S/T → 可穿污染；任一方是特殊图块 → 不产生路径污染**

## 5. 参数配置（已实现为数据驱动）

- 所有参数集中在 `GameParams` 类型，可 JSON 序列化
- 微信后台 remote config 可下发 `Partial<GameParams>` 覆盖默认值
- `computeDifficulty(params)` 计算数值化难度（0~100）
- 障碍物由 seeded RNG 随机生成（基于日期种子），保证偶数

## 6. 复活流程（已实现）

失败 → offerRevive → 观看激励广告 → confirmRevive（+时间 +重排）/ declineRevive

## 7. 微信小游戏能力（架构预留）

| 能力 | 状态 |
|------|------|
| IPlatformAdapter 接口 | ✅ 已定义 |
| WebAdapter | ✅ 已实现 |
| WeChatMiniGameAdapter 骨架 | ✅ stub 实现 |
| 分享 SharePayload | ✅ 已实现 |
| 激励广告 RewardAdService | ✅ 委托 platform.ad |
| 认证 AuthService | ✅ 预留骨架 |
| 排行榜 LeaderboardService | ✅ 委托 platform.leaderboard |
| 远端挑战配置 | ✅ 本地回退已实现 |

## 8. 埋点（已实现）

20+ 事件常量化，覆盖 app_open / tutorial / daily_challenge / match / shuffle / hint / revive / ad / share 全链路。

## 9. 本期不做事项

- 完整后端实现
- 真实广告接入上线
- 排行榜完整上线
- 复杂活动系统
- 商城 / 长线成长系统
