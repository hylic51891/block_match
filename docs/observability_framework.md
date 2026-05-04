# 可观测性

> 当前已实现：logger / telemetry / error-reporter / debug-panel。

## 日志 — `infra/logger.ts`

4 级：debug / info / warn / error，含模块名和事件名。

## 埋点 — `infra/telemetry.ts`

TelemetryEvents 常量化 + 类型安全。已覆盖事件：

| 事件 | 触发位置 |
|------|---------|
| app_open | main.tsx |
| platform_init | main.tsx |
| tutorial_enter / tutorial_complete | challenge-service |
| daily_challenge_view | HomeScene |
| daily_challenge_start | game-store |
| match_attempt / match_fail | game-store.selectTile |
| match_success | game-store |
| shuffle_used | game-store |
| hint_used | game-store |
| daily_success / daily_fail / daily_retry | game-store |
| daily_best_updated | challenge-service |
| revive_offer_shown / revive_used | game-store |
| rewarded_ad_offer_shown / complete / fail | reward-ad-service |

## 错误 — `infra/error-reporter.ts`

ErrorCategory 分类：core_logic / platform_adapter / storage_parse / challenge_config

## 调试面板 — `components/DebugPanel.tsx`

展示：Mode / ChallengeDate / ReviveState / ReviveUsed / TodayBest / Platform / TimeLimit
操作：强制重排 / 清除污染 / 清除存档 / 查看埋点
