# 回路连连看三期开发 — 实施计划

> 基于 `docs/dev stage 3` 的 PRD、development_plan、overall_plan，推进微信小游戏正式化开发
> **状态：已全部完成** — 120 测试通过，生产构建成功

## 完成状态

| 批次 | 状态 | 说明 |
|------|------|------|
| 批次1：Platform 适配层 | ✅ 完成 | IPlatformAdapter + WebAdapter + WeChatMiniGameAdapter 骨架 |
| 批次2：Services 业务抽象层 | ✅ 完成 | 5个服务 + 工厂，scenes/store 不再直接依赖 infra |
| 批次3：复活/广告触发流程 | ✅ 完成 | ReviveDialog + offerRevive/confirmRevive/declineRevive |
| 批次4：分享 Payload 增强 | ✅ 完成 | SharePayload + 文案模板（教学/每日通关/每日失败） |
| 批次5：埋点与错误分类扩展 | ✅ 完成 | TelemetryEvents 常量 + ErrorCategory + 9个缺失埋点 |
| 批次6：调试面板升级 | ✅ 完成 | mode/date/revive/platform/telemetry 查看 |
| 批次7：测试补充 | ✅ 完成 | 8个新测试文件，120 测试全通过 |

## 前置状态

二期已完成：挑战制产品结构、GameMode、TutorialLevelProvider/DailyChallengeProvider、限时机制、S/T灵能图块、细粒度失败原因、Mock服务层、83个测试用例。

**三期核心新增**：Platform 适配层 + Services 业务抽象层 + 复活流程 + 埋点扩展 + 调试面板升级

---

## 批次 1：Platform 适配层基础

**目标**：建立 `src/platform/` 目录，定义 IPlatformAdapter 接口，实现 WebAdapter

### 新建文件（5）
| 文件 | 说明 |
|------|------|
| `src/platform/types.ts` | PlatformType + IPlatformAdapter 接口（聚合 storage/share/ad/leaderboard/remoteConfig + 生命周期） |
| `src/platform/web-adapter.ts` | WebAdapter：整合 LocalStorageRepository + MockShareService + MockAdService + MockLeaderboardService + LocalChallengeConfig，onShow/onHide 用 visibilitychange |
| `src/platform/wechat-stubs.ts` | 微信 stub 实现（WeChatStorageStub/ShareStub/AdStub/LeaderboardStub/RemoteConfigStub），全部 console.log + 安全默认值 |
| `src/platform/wechat-adapter.ts` | WeChatMiniGameAdapter 骨架：组合 stub，onShow/onHide/getSystemInfo 预留 wx 调用注释 |
| `src/platform/index.ts` | createPlatform(type) 工厂 + getPlatform() 单例 + resetPlatform() |

### 修改文件（1）
| 文件 | 变更 |
|------|------|
| `src/infra/share/types.ts` | 新增 SharePayload 类型（title/description/imageUrl/result/challengeDate/mode/wechat?），IShareService 增加 sharePayload 方法 |

### 验证
- `tsc --noEmit` 通过
- `vitest run` 全量通过（不改动现有代码逻辑）
- WebAdapter 可实例化

---

## 批次 2：Services 业务抽象层

**目标**：建立 `src/services/` 目录，scenes/store 不再直接依赖 infra 具体实现

### 新建文件（7）
| 文件 | 说明 |
|------|------|
| `src/services/types.ts` | IChallengeService / IRewardAdService / IShareService(业务) / IAuthService / ILeaderboardService / IGameService 接口 |
| `src/services/challenge-service.ts` | 挑战业务：getDailyConfig（远端优先回退本地）、saveResult、getLocalProgress、markTutorialComplete、getTodayBest |
| `src/services/reward-ad-service.ts` | 委托 platform.ad.showRewardedAd() + 埋点 |
| `src/services/share-service.ts` | 生成 SharePayload（含文案模板），委托 platform.share.sharePayload() |
| `src/services/auth-service.ts` | 预留骨架：login()、isLoggedIn()、getUserId() |
| `src/services/leaderboard-service.ts` | 委托 platform.leaderboard |
| `src/services/index.ts` | createGameService(platform) 工厂 + getGameService() 单例 |

### 修改文件（5）
| 文件 | 变更 |
|------|------|
| `src/infra/share/mock-share.ts` | 增加 sharePayload() 方法 |
| `src/app/main.tsx` | 初始化 createPlatform('web') + createGameService(platform) |
| `src/store/game-store.ts` | 移除 `createStorage()` 直接依赖，改用 getGameService().challenge；storage 操作改用 getPlatform().storage |
| `src/store/challenge-store.ts` | 移除 `createStorage()` 直接依赖，改用 getGameService().challenge |
| `src/scenes/ResultScene.tsx` | `new MockShareService()` → `getGameService().share.shareResult()` |

### 验证
- `tsc --noEmit` 通过
- `vitest run` 全量通过
- scenes/store 不再直接 new 具体实现类

---

## 批次 3：复活/广告触发流程

**目标**：实现失败后激励广告复活流程

### 修改文件（5）
| 文件 | 变更 |
|------|------|
| `src/types/game.ts` | 新增 ReviveState = 'none'\|'offered'\|'ad_watching'\|'revived'，GameState 增加 reviveState/reviveUsed |
| `src/core/engine/game-engine.ts` | 新增 offerRevive() / confirmRevive() / declineRevive() 纯函数；createInitialState 增加 reviveState:'none', reviveUsed:0 |
| `src/store/game-store.ts` | 新增 offerRevive/confirmRevive/declineRevive actions；失败时自动触发 offerRevive |
| `src/scenes/ResultScene.tsx` | 失败且可复活时展示 ReviveDialog |
| `src/scenes/BattleScene.tsx` | 监听 reviveState 变化，复活后重置倒计时 |

### 新建文件（1）
| 文件 | 说明 |
|------|------|
| `src/components/ReviveDialog.tsx` | 复活弹窗：调用 rewardAd.showRewardedAd()，成功→confirmRevive，失败/放弃→declineRevive |

### 复活流程
```
失败 → offerRevive(reviveState='offered')
  → 点击"看广告" → rewardAd.showRewardedAd()
    → 成功 → confirmRevive(status='playing', +1重排, 60秒限时)
    → 失败 → declineRevive
  → 点击"放弃" → declineRevive
```

### 验证
- 失败后弹出复活选项（仅 daily_challenge，每局最多1次）
- 复活后恢复 playing，增加1次重排，限时60秒
- Web 环境 MockAd 自动返回 true

---

## 批次 4：分享 Payload 增强

**目标**：增强分享数据结构和文案

### 修改文件（2）
| 文件 | 变更 |
|------|------|
| `src/services/share-service.ts` | 增强文案模板：教学通关/每日通关/每日失败 三种场景 |
| `src/platform/wechat-stubs.ts` | WeChatShareStub.sharePayload 预留 wx.shareAppMessage 注释 |

### 文案模板
| 场景 | title | description |
|------|-------|-------------|
| 教学通关 | "我学会了回路连连看！" | "路径配对+污染封路，来试试？" |
| 每日通关 | "回路连连看 - 今日通关！" | "用时XX秒，你能更快吗？" |
| 每日失败 | "今天的挑战有点难" | "回路连连看，你行你来？" |

### 验证
- 分享 payload 包含完整文案和结果数据

---

## 批次 5：埋点与错误分类扩展

**目标**：补充 PRD 要求的缺失埋点事件，扩展错误分类

### 修改文件（4）
| 文件 | 变更 |
|------|------|
| `src/infra/telemetry.ts` | 新增 TelemetryEvents 常量对象（20+ 事件名），TelemetryEventName 类型 |
| `src/infra/error-reporter.ts` | 新增 ErrorCategory = 'core_logic'\|'platform_adapter'\|'storage_parse'\|'challenge_config'\|... |
| `src/store/game-store.ts` | 补充 match_attempt/match_fail 埋点（selectTile 中） |
| `src/scenes/HomeScene.tsx` | 补充 daily_challenge_view 埋点 |

### 缺失埋点补充清单
| 事件 | 触发位置 | 状态 |
|------|---------|------|
| match_attempt | game-store.selectTile | **新增** |
| match_fail | game-store.selectTile | **新增** |
| daily_challenge_view | HomeScene | **新增** |
| revive_offer_shown | game-store.offerRevive | **新增** |
| revive_used | game-store.confirmRevive | **新增** |
| rewarded_ad_offer_shown | reward-ad-service | **新增** |
| rewarded_ad_complete | reward-ad-service | **新增** |
| rewarded_ad_fail | reward-ad-service | **新增** |
| platform_init | main.tsx | **新增** |

### 验证
- 所有 PRD 定义的必埋事件均有触发点

---

## 批次 6：调试面板升级

**目标**：DebugPanel 支持挑战制信息

### 修改文件（1）
| 文件 | 变更 |
|------|------|
| `src/components/DebugPanel.tsx` | 新增展示：Mode / ChallengeDate / ReviveState / ReviveUsed / TodayBest / Platform / TimeLimit；新增操作：清除存档、查看埋点 |

### 验证
- DebugPanel 展示完整挑战制信息

---

## 批次 7：测试补充

### 新建文件（8）
| 文件 | 测试内容 |
|------|---------|
| `src/tests/unit/platform/web-adapter.test.ts` | WebAdapter 接口完整性、onShow/onHide 回调 |
| `src/tests/unit/platform/wechat-adapter.test.ts` | WeChatMiniGameAdapter stub 不抛异常 |
| `src/tests/unit/services/challenge-service.test.ts` | saveResult/getTodayBest/markTutorialComplete/旧存档兼容 |
| `src/tests/unit/services/reward-ad-service.test.ts` | 广告委托 + 埋点触发 |
| `src/tests/unit/services/share-service.test.ts` | 分享 payload 生成 + 文案模板 |
| `src/tests/unit/services/auth-service.test.ts` | login/isLoggedIn 状态 |
| `src/tests/unit/engine/revive-flow.test.ts` | offerRevive/confirmRevive/declineRevive 纯函数逻辑 |
| `src/tests/integration/revive-flow.test.ts` | 失败→复活→继续 集成流程 |

### 验证
- `tsc --noEmit` 通过
- `vitest run` 全量通过（含新增测试）
- 83+ 原有测试不回归

---

## 文件变更总览

### 新建（20）
```
src/platform/types.ts
src/platform/web-adapter.ts
src/platform/wechat-stubs.ts
src/platform/wechat-adapter.ts
src/platform/index.ts
src/services/types.ts
src/services/challenge-service.ts
src/services/reward-ad-service.ts
src/services/share-service.ts
src/services/auth-service.ts
src/services/leaderboard-service.ts
src/services/index.ts
src/components/ReviveDialog.tsx
src/tests/unit/platform/web-adapter.test.ts
src/tests/unit/platform/wechat-adapter.test.ts
src/tests/unit/services/challenge-service.test.ts
src/tests/unit/services/reward-ad-service.test.ts
src/tests/unit/services/share-service.test.ts
src/tests/unit/services/auth-service.test.ts
src/tests/unit/engine/revive-flow.test.ts
src/tests/integration/revive-flow.test.ts
```

### 修改（12）
```
src/infra/share/types.ts          — SharePayload 类型 + IShareService.sharePayload
src/infra/share/mock-share.ts     — sharePayload 实现
src/infra/telemetry.ts            — 事件名常量化 + 类型安全
src/infra/error-reporter.ts       — ErrorCategory 分类
src/app/main.tsx                  — 初始化 platform + services
src/types/game.ts                 — ReviveState + reviveUsed/reviveState
src/core/engine/game-engine.ts    — offerRevive/confirmRevive/declineRevive
src/store/game-store.ts           — 改用 services + 复活 actions + 埋点补充
src/store/challenge-store.ts      — 改用 services
src/scenes/ResultScene.tsx        — services + ReviveDialog
src/scenes/HomeScene.tsx          — 补充埋点
src/scenes/BattleScene.tsx        — 复活后处理
src/components/DebugPanel.tsx     — 挑战制信息
```

---

## 验证方案

每批次完成后：
1. `npx tsc --noEmit` — 编译通过
2. `npx vitest run` — 全量测试通过
3. `npm run build` — 构建成功

全批次完成后端到端验证：
1. `npm run dev` → 首页展示今日挑战
2. 首次进入 → 教学关 → 通关 → 返回首页 → 今日挑战
3. 挑战失败 → 复活弹窗 → 看广告复活 → 继续对局
4. 挑战成功 → 结果页 → 分享 → 重试
5. DebugPanel 展示 mode/date/revive/best 信息
6. 控制台可见完整埋点链路
