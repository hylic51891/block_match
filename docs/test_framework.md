# 测试框架

> 当前 23 个测试文件，120 用例，全部通过。
> 详细测试清单见 [本地测试指南](./local_testing_guide.md)。

## 运行

```bash
npm run test          # 全量运行
npm run test:watch    # 监听模式
npx tsc --noEmit      # 类型检查
```

## 覆盖模块

- 核心规则：PathFinder / MatchResolver / DeadlockDetector / ShuffleManager / PollutionSystem / WinLoseChecker / HintManager
- 挑战系统：DailyProvider / TutorialProvider / ChallengeRecord
- 平台层：WebAdapter / WeChatAdapter
- 服务层：ChallengeService / RewardAdService / ShareService / AuthService
- 引擎：ReviveFlow
- 基础设施：StorageMigration / InfraServices
- 集成：BattleFlow / ChallengeFlow / LevelLoading
