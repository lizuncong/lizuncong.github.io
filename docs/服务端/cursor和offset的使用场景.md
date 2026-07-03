# 游标分页与页码分页：为什么列表加载更常用 cursor

## 脱敏说明

本文来自一次移动端列表接口排查与讨论，已做脱敏处理：

- 不使用真实产品名、域名、接口域名、账号、截图路径和真实业务数据。
- 示例接口统一使用 `/api/items`、`popular`、`latest`、`itemId` 等通用名称。
- 示例 cursor 是演示字符串，不代表线上真实 cursor，也不包含真实排序字段值。

## 先说结论

如果页面是后台表格、搜索结果、订单列表这类“我要跳到第几页”的场景，`pageNo + pageSize` 很合适。

如果页面是移动端信息流、热门列表、最新列表、评论流这类“用户一直往下滑”的场景，`cursor + limit` 通常更合适。

原因不是 cursor 更高级，而是它回答的问题更贴近无限滚动：

```text
pageNo + pageSize：我要第几页。
cursor + limit：我上次看到这里了，请从这里后面继续给我。
```

## 把列表想成一排排队的人

假设有一个热门内容列表，现在排序是：

```text
A1 A2 A3 ... A20 A21 A22 A23 ...
```

用户第一次打开页面，请求前 20 条：

```text
GET /api/items?tab=popular&pageNo=1&pageSize=20
```

服务端返回：

```text
A1 到 A20
```

如果列表在这段时间完全不变，下一次请求第 2 页没有问题：

```text
GET /api/items?tab=popular&pageNo=2&pageSize=20
```

服务端会跳过前 20 条，再拿后 20 条，也就是从 `A21` 开始。

问题是，热门列表通常会变化。比如用户刚看完第 1 页，前面突然插入了 3 条新内容：

```text
N1 N2 N3 A1 A2 A3 ... A20 A21 A22 ...
```

这时再请求第 2 页：

```text
GET /api/items?tab=popular&pageNo=2&pageSize=20
```

服务端仍然会按“跳过前 20 条”执行。可是现在前 20 条已经不是原来的 `A1` 到 `A20` 了，而是：

```text
N1 N2 N3 A1 ... A17
```

跳过后，下一页可能从 `A18` 开始。用户就会再次看到 `A18 A19 A20`，出现重复。

这就是页码分页在动态列表里的核心问题：**它记住的是位置编号，不是用户上次看到的具体位置。**

## cursor 像一张书签

cursor 的思路是：用户第一次拿到 `A1` 到 `A20` 后，服务端额外返回一个 `nextCursor`，它表示“这批数据最后一条在哪里”。

第一次请求：

```text
GET /api/items?tab=popular&limit=20
```

返回：

```json
{
  "list": ["A1", "A2", "A3", "...", "A20"],
  "nextCursor": "demo_cursor_after_A20",
  "hasMore": true
}
```

下一次请求：

```text
GET /api/items?tab=popular&limit=20&cursor=demo_cursor_after_A20
```

它表达的不是“我要第 2 页”，而是：

```text
我上次看到 A20 了，请从 A20 后面继续给我。
```

即使这期间列表前面新增了 `N1 N2 N3`，cursor 仍然指向 `A20` 这个锚点，服务端可以继续返回：

```text
A21 A22 A23 ...
```

所以 cursor 更适合不断变化的列表。

## 服务端具体怎么做

cursor 不是魔法。它通常是把“上一批最后一条的排序信息”编码成一个字符串。

比如热门列表按热度分和唯一 ID 排序：

```text
hotScore 从高到低
itemId 从大到小
```

为什么要同时带 `hotScore` 和 `itemId`？因为可能有很多内容热度分一样。如果只靠 `hotScore`，服务端不知道同分内容之间谁在前谁在后；加上唯一 ID 后，排序才稳定。

cursor 内部可以理解成这样：

```json
{
  "tab": "popular",
  "hotScore": 9527,
  "itemId": "item_10086"
}
```

服务端不会把这个 JSON 明文暴露给前端，而是编码成一个字符串：

```text
demo_cursor_after_item_10086
```

前端不需要理解 cursor 内容，只要原样带回服务端。

## 查询逻辑长什么样

第一次请求没有 cursor：

```sql
SELECT *
FROM items
WHERE tab = 'popular'
ORDER BY hot_score DESC, item_id DESC
LIMIT 21;
```

这里故意查 `limit + 1` 条。比如前端要 20 条，服务端查 21 条：

- 如果查到了第 21 条，说明后面还有数据，`hasMore = true`。
- 返回给前端时只返回前 20 条。
- 用第 20 条生成 `nextCursor`。

第二次请求带 cursor：

```sql
SELECT *
FROM items
WHERE tab = 'popular'
  AND (
    hot_score < :cursorHotScore
    OR (hot_score = :cursorHotScore AND item_id < :cursorItemId)
  )
ORDER BY hot_score DESC, item_id DESC
LIMIT 21;
```

这段条件的意思是：

```text
从上一次最后一条后面继续拿。
```

如果排序是从高到低，就用 `<`。如果排序是从低到高，就要换成 `>`。方向必须和 `ORDER BY` 保持一致。

## 前端具体怎么做

前端的工作很简单：保存服务端返回的 `nextCursor`，下次加载更多时带上它。

```ts
let nextCursor: string | null = null;

async function loadMoreItems() {
  const params = new URLSearchParams({
    tab: 'popular',
    limit: '20',
  });

  // cursor 是服务端生成的列表书签，前端不要解析，避免绑定后端排序细节。
  if (nextCursor) {
    params.set('cursor', nextCursor);
  }

  const response = await fetch(`/api/items?${params.toString()}`);
  const result = await response.json();

  // 下一次加载更多必须使用本次返回的新 cursor，否则会重复请求同一批数据。
  nextCursor = result.nextCursor;
}
```

前端要记住两个原则：

- cursor 由服务端生成，前端只保存和回传。
- 切换 tab、筛选条件、排序方式时，要清空旧 cursor，从第一批重新请求。

## pageNo + pageSize 完全做不到吗

不是。`pageNo + pageSize` 可以通过“快照”补强。

比如第一次请求时，服务端给一个 `snapshotId`：

```text
GET /api/items?tab=popular&pageNo=1&pageSize=20
```

返回：

```json
{
  "list": ["A1", "A2", "...", "A20"],
  "snapshotId": "snapshot_demo_001"
}
```

后续请求都带上同一个快照：

```text
GET /api/items?tab=popular&pageNo=2&pageSize=20&snapshotId=snapshot_demo_001
```

这样服务端就可以固定在同一份列表快照里翻页，避免新数据插入导致重复或漏数据。

但注意，这时真正保证稳定性的已经不是 `pageNo + pageSize`，而是 `snapshotId`。也就是说，页码分页想解决动态列表问题，通常要额外引入一个锚点或快照。

## 两种分页怎么选

| 场景 | 推荐方式 | 原因 |
| --- | --- | --- |
| 后台表格 | `pageNo + pageSize` | 用户常常需要跳页、看总页数 |
| 搜索结果 | `pageNo + pageSize` 或快照分页 | 可能需要跳页，也可能需要稳定结果 |
| 移动端信息流 | `cursor + limit` | 用户主要是继续下滑 |
| 热门榜、最新列表 | `cursor + limit` | 列表会变化，cursor 更稳定 |
| 评论、消息流 | `cursor + limit` | 更关心从某条之后继续 |
| SEO 可收录分页 | `pageNo + pageSize` | URL 更稳定，也更容易表达页码 |

## cursor 落地时要注意什么

1. 排序必须稳定。

   只按 `createdAt` 或 `hotScore` 排序可能不够，因为多条数据可能同一时间或同一分数。建议使用：

   ```text
   createdAt + itemId
   hotScore + itemId
   rankScore + itemId
   ```

2. cursor 要绑定筛选条件。

   如果 cursor 是 `popular` 列表生成的，就不能拿去请求 `latest` 列表。服务端可以在 cursor 里带上 `tab`、筛选条件或排序方式，并在解析后校验。

3. limit 要有上限。

   前端传 `limit=20` 很正常，但不能允许用户传 `limit=100000`。服务端应该设置最大值，比如 50 或 100。

4. cursor 要能处理异常。

   用户可能复制、篡改或传过期 cursor。服务端解析失败时，应该返回明确错误，或者按业务约定重新从第一页开始。

5. 敏感信息不要放进 cursor。

   cursor 可能出现在浏览器地址、日志、监控系统里。不要把用户身份、内部权限、真实业务敏感字段直接放进去。必要时使用签名或服务端存储映射。

## 一句话记住

`pageNo + pageSize` 像在说：

```text
帮我翻到第 2 页。
```

`cursor + limit` 像在说：

```text
我书签夹在这里了，从这里后面继续读。
```

当列表会变化、用户只是继续往下滑时，书签比页码更可靠。
