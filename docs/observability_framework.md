# 可观测性框架设计

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
