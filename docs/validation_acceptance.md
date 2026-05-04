# 验证与验收

> 三期开发已完成，以下为当前验收状态。

## 功能验收 ✅

- 本地可启动（`npm run dev`）
- 首页 / 对局页 / 结果页完整
- 挑战制主流程：教学关 → 今日挑战 → 结果 → 重试/分享
- 路径规则正确（0-3 弯，S/T 穿污染）
- 污染规则正确（产生/衰减/净化/清除）
- 死局/重排正确（重排清除全部污染）
- 可通关、可失败、可复活
- 棋盘 100% 填充，所有图块成对

## 工程验收 ✅

- 结构清晰（core / platform / services / store / infra）
- TypeScript 严格模式，编译无错误
- 核心逻辑与 UI 解耦
- 120 测试用例全部通过
- 数据驱动参数（GameParams JSON 可远程热更新）
- 调试面板可查看模式/日期/复活/埋点

## 测试验收 ✅

- 23 个测试文件，120 用例
- 覆盖：PathFinder / MatchResolver / DeadlockDetector / ShuffleManager / PollutionSystem / WinLoseChecker / HintManager / ChallengeProvider / ReviveFlow / Platform / Services
- 手动冒烟清单见 [本地测试指南](./local_testing_guide.md)
