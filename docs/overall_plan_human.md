# 回路连连看 — 开发者总览

> 本文档面向人类开发者，说明项目现状与开发指引。
> 详细技术文档见 [项目总览](./overall_plan_ai.md)。

## 项目现状

三期开发已完成，项目具备：
- 完整核心玩法：路径配对 + 污染封路 + S/T 灵能图块 + 复活流程
- 挑战制产品结构：教学关 + 每日挑战
- 数据驱动参数：GameParams JSON 可远程热更新，数值化难度计算
- 跨平台架构：Platform 适配层 + Services 业务抽象层
- Web 调试环境 + 微信小游戏适配骨架
- 120 测试用例，全部通过

## 开发者职责

1. 通过修改 `src/core/config/game-balance.ts` 中的 `DEFAULT_DAILY_PARAMS` / `DEFAULT_TUTORIAL_PARAMS` 调整难度
2. 通过微信后台 remote config 下发 `Partial<GameParams>` JSON 热更新参数
3. 决定平台接入优先级（运行环境 → 存档 → 分享 → 广告 → 登录 → 排行榜）
4. 控制范围，避免过早膨胀

## 关键约束

- `core/` 不依赖平台 API
- 平台差异收敛到 `platform/` 适配层
- 业务逻辑收敛到 `services/` 层
- 保留 Web 环境用于调试和自动测试

## 不强制一次做完

- 完整后端实现
- 真实广告接入
- 排行榜完整上线
- 开放数据域联调
