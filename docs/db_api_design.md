# 数据库 / API 设计（完整版）

## 9.1 设计原则

虽然 MVP 不强依赖后端，但必须从一开始定义清楚未来契约，避免后续重构代价过高。

### 原则
1. 配置下发和运行逻辑解耦
2. 进度与结算结构化
3. 埋点批量上报
4. 响应结构统一
5. 服务端不接管局内逐步操作，只接收结果和统计

---

## 9.2 数据库表结构

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

### event_logs
```sql
CREATE TABLE event_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  event_name VARCHAR(64) NOT NULL,
  payload_json JSON NULL,
  created_at DATETIME NOT NULL
);
```

---

## 9.3 API 设计

### 9.3.1 登录
`POST /api/v1/auth/login`

请求：
```json
{
  "code": "wx-login-code"
}
```

响应：
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": 1,
      "nickname": "user",
      "avatarUrl": ""
    }
  }
}
```

### 9.3.2 获取玩家进度
`GET /api/v1/progress`

### 9.3.3 获取关卡列表
`GET /api/v1/levels`

### 9.3.4 获取单关配置
`GET /api/v1/levels/{levelId}`

### 9.3.5 提交关卡结算
`POST /api/v1/levels/{levelId}/settlement`

请求：
```json
{
  "result": "success",
  "durationMs": 52340,
  "moveCount": 18,
  "shuffleUsed": 1,
  "star": 2
}
```

### 9.3.6 上报事件
`POST /api/v1/events/batch`

请求：
```json
{
  "events": [
    {
      "event": "level_start",
      "timestamp": 1777180000,
      "properties": {
        "levelId": "level-001"
      }
    }
  ]
}
```
