## Bug 根因

### 现象

用户在上海时间上午 10:21 发送消息，侧边栏显示“今天， 02:21"，差了 8 小时。

### 根因链条

```
[写入方] MySQL 服务器          [存储] DATETIME 列           [读取方] Go 驱动            [展示] 前端
      │                              │                              │                         │
      │  CURRENT_TIMESTAMP           │  裸字符串                     │  loc=Asia/Shanghai      │  Intl.DateTimeFormat
      │  按 time_zone=UTC            │  "2026-09-21 02:21:00"      │  贴上 +08:00 标签        │  格式化为 "02:21"
      │  产出 UTC 墙钟               │  （无时区标签）                │  "02:21 +08:00"          │
      │  "02:21:00"                  │                              │  误认为上海 02:21         │
```

**一句话**：MySQL 服务器时区为 UTC，写入 `CURRENT_TIMESTAMP` 产出 UTC 墙钟 `02:21:00`；Go 驱动配置 `loc=Asia/Shanghai`，读取时把 UTC 墙钟误标为上海时间，差了 8 小时。

### 各环节的问题

| 环节 | 配置 | 产生了什么 | 问题 |
|------|------|-----------|------|
| MySQL 服务器 | `time_zone = UTC` | `CURRENT_TIMESTAMP` 返回 `02:21:00`（UTC 墙钟） | 无问题，按它自己的时区正确输出 |
| DATETIME 列 | 无时区语义 | 存了裸字符串 `"02:21:00"` | 无问题，忠实存储 |
| Go 驱动 | `loc=Asia/Shanghai` | 读到 `02:21:00`，贴上“上海时间”标签 | **问题在这里**：驱动假设 MySQL 存的都是上海墙钟，但实际是 UTC 墙钟 |
| 前端 | `Intl.DateTimeFormat` | 拿到 `02:21 +08:00`，格式化为 `"02:21"` | 无问题，忠实展示上游给的值 |

### 深层根因

**写入方和读取方的时区“隐含约定”没有对齐。**

- 写入方（MySQL 服务器）以为：我存的是 UTC，读者会知道。
- 读取方（Go 驱动）以为：存的都是上海时间。
- DATETIME 列不传递时区信息，两边的假设**谁也不知道对方的假设**。

约定断裂的直接原因：Go 驱动的 `loc=Asia/Shanghai` 是代码里自动补充的（`config.go:1607`），意图是“驱动写入 `time.Time` 参数时转成上海墙钟、读取时按上海解读”。但 MySQL 服务器的 `time_zone` 是 UTC，`CURRENT_TIMESTAMP` 产出的是 UTC 墙钟，和驱动的假设不一致。

### 触发条件

只有**AI 正在生成中**（尚未调用 `updateAgentChatSession` 用 `time.UnixMilli` 覆盖）时，`last_message_at` 才是 `CURRENT_TIMESTAMP` 写入的错误值。生成完成后会被正确值覆盖。
