# 从MySQL 排序OOM的问题深入理解MySQL执行过程
## 问题
测试环境遇到一个MySQL排序内存不足导致的报错问题，可以使用下面的查询语句稳定复现

```SQL
SELECT COUNT(*) AS failed_rows
FROM (
  SELECT
    chat_messages.id,
    chat_messages.round_index,
    chat_messages.response_json
  FROM chat_messages
  WHERE chat_messages.game_id = 994885889
    AND chat_messages.user_id = 1599514642999
  ORDER BY chat_messages.round_index, chat_messages.id
  LIMIT 10
) AS t;
```

报错如下图所示，很明显是 MySQL的排序内存不足

<img width="1292" height="417" alt="image" src="https://github.com/user-attachments/assets/0e9a34bb-03ae-4bd9-af38-b20bf0f83ad8" />


下面就跟着我一步一步来深入剖析这个问题。回答这个问题前，我们需要了解一些理论知识

## 前置理论知识
本篇文章所有内容介绍都是基于MySQL innodb引擎。所以你要了解innodb存储引擎的特点。当然你不理解也不影响你看后面的内容

<img width="1255" height="616" alt="image" src="https://github.com/user-attachments/assets/42d0681c-b62c-41de-ab3f-b76ef64cc671" />

### 索引分类
InnoDB 索引主要分为聚簇索引和二级索引；二级索引进一步可以分为主键索引、唯一索引、普通索引、联合索引、前缀索引、全文索引、空间索引等。

这些索引大部分存放在 InnoDB 表空间中，以Page页的形式组织。从索引实现看，主要数据结构有：B+ 树、倒排索引、R-Tree、哈希表等，最常用的是B+树索引。每个索引都是独立的数据结构

#### 聚簇索引
InnoDB 的数据组织方式：叶子节点直接保存完整行数据。聚簇索引和主键索引还有点区别，每张表必定有一个聚簇索引，但不一定有我们显式定义的主键索引（PRIMARY KEY）。如果表定义了主键，InnoDB 就用它作为聚簇索引。

#### 二级索引
叶子节点保存的是：索引列 + 主键值

### 什么是回表、覆盖索引
回表是指：先通过二级索引找到主键值，然后再回到主键索引里查完整行数据的过程

假设表结构：
```SQL
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  name VARCHAR(50),
  age INT,
  city VARCHAR(50),
  KEY idx_name (name)
);
```

id是主键索引(聚簇索引)，idx_name是二级索引。下图展示了聚簇索引和二级索引的数据结构，它们是两棵独立的 B+ 树。

<img width="1312" height="645" alt="image" src="https://github.com/user-attachments/assets/a59c4fab-aefe-4003-b9a5-62eb2bbdbcb2" />



执行下面的查询语句：

```SQL
SELECT id, name, age, city
FROM users
WHERE name = '张三';
```

查询过程是：
1. 在 idx_name 里找到 name = '张三' 对应的 id。
2. 但 idx_name 里只有 name 和 id，没有 age、city。
3. 所以必须拿着 id 回到主键索引里查找完整行数据。
4.这一步就是 回表。


如果只查：
```SQL
SELECT id, name
FROM users
WHERE name = '张三';
```

就不需要回表，因为 idx_name 里已经有 name 和 id 了。这种情况叫 覆盖索引。

### 查看MySQL查询过程的三大工具
查看 MySQL 查询过程主要用三类工具：EXPLAIN、EXPLAIN ANALYZE、optimizer_trace。

重点看这几列：

<img width="625" height="181" alt="image" src="https://github.com/user-attachments/assets/5d8d7ea4-2a8a-415e-b143-00a87e38a4df" />


Extra取值含义：

<img width="620" height="204" alt="image" src="https://github.com/user-attachments/assets/5eb2f2ae-d26f-4088-8b41-902546884436" />


用chat_messages表举例，它有很多个索引，其中idx_game_user_round联合索引如红框所示

<img width="1360" height="642" alt="image" src="https://github.com/user-attachments/assets/65e10586-334a-4f78-b242-70d26275ce0f" />

使用explain查看下面的查询语句的过程
<img width="1638" height="460" alt="image" src="https://github.com/user-attachments/assets/b7bbf143-b33a-47c1-8cd9-8928f3c58b64" />

这里可以看到key使用了idx_game_user_round，说明当前查询走了联合索引。然后extra列的值是using index，说明是覆盖索引，不需要回表

MySQL优化器
什么是优化器
MySQL 执行 SQL 前，优化器会做一次查询计划评估，判断怎么访问表最合适。比如：
●要不要用某个索引？
●用哪一个索引？
●多个索引是否可以做 index merge / intersect？
●多表 JOIN 时先查哪张表？
●是否排序、是否临时表、是否回表？
 但它不会每次都完整比较所有组合。MySQL 8.0 有成本上限和优化策略，如果候选路径太多，会剪枝，只评估比较有希望的路径。像只有几十万种 JOIN 顺序的情况，也不会全部算完。
 可以简单理解成： MySQL 会评估若干条看起来成本较低的执行路径，然后选 cost 最低的一条。


如何查看优化器的评估过程：为啥选择交集方案
可以通过optimizer_trace查看优化器为什么这么选，使用下面的sql在终端演示一下：
SET SESSION cte_max_recursion_depth = 50000;

DROP TABLE IF EXISTS optimizer_trace_demo;

CREATE TABLE optimizer_trace_demo (
  id BIGINT NOT NULL AUTO_INCREMENT,
  game_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  round_index INT NOT NULL,
  status TINYINT NOT NULL,
  response_json TEXT,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO optimizer_trace_demo
  (game_id, user_id, round_index, status, response_json)
WITH RECURSIVE seq(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 50000
)
SELECT
  9000 + (n % 100),
  15000 + (n % 500),
  n % 1000,
  n % 4,
  JSON_OBJECT('row', n, 'payload', REPEAT('x', 100))
FROM seq;

CREATE INDEX idx_game_id ON optimizer_trace_demo(game_id);
CREATE INDEX idx_user_id ON optimizer_trace_demo(user_id);
CREATE INDEX idx_game_user_round
  ON optimizer_trace_demo(game_id, user_id, round_index);

ANALYZE TABLE optimizer_trace_demo;

EXPLAIN FORMAT=TREE
SELECT ot.id, ot.response_json
FROM optimizer_trace_demo AS ot
WHERE ot.game_id = 9000
  AND ot.user_id = 15000
ORDER BY ot.round_index, ot.id
LIMIT 10;

SET SESSION optimizer_trace = 'enabled=on';

SELECT ot.id, ot.response_json
FROM optimizer_trace_demo AS ot
WHERE ot.game_id = 9000
  AND ot.user_id = 15000
ORDER BY ot.round_index, ot.id
LIMIT 10;

SELECT
  QUERY,
  TRACE,
  MISSING_BYTES_BEYOND_MAX_MEM_SIZE,
  INSUFFICIENT_PRIVILEGES
FROM information_schema.OPTIMIZER_TRACE\G

SET SESSION optimizer_trace = 'enabled=off';

DROP TABLE optimizer_trace_demo;


explain结果如下：

这说明 MySQL 虽然有更完整的复合索引 idx_game_user_round，但这次它仍然选择了两个单列索引求交集，因为它估算这个方案 cost 更低。

然后可以通过trace的结果查看为啥优化器选择了两个单列索引求交集的方案


截图不全，我贴一下原样输出的结果：
{
  "steps": [
    {
      "join_preparation": {
        "select#": 1,
        "steps": [
          {
            "expanded_query": "/* select#1 */ select `ot`.`id` AS `id`,`ot`.`response_json` AS `response_json` from `optimizer_trace_demo` `ot` where ((`ot`.`game_id` = 9000) and (`ot`.`user_id` = 15000)) order by `ot`.`round_index`,`ot`.`id` limit 10"
          }
        ]
      }
    },
    {
      "join_optimization": {
        "select#": 1,
        "steps": [
          {
            "condition_processing": {
              "condition": "WHERE",
              "original_condition": "((`ot`.`game_id` = 9000) and (`ot`.`user_id` = 15000))",
              "steps": [
                {
                  "transformation": "equality_propagation",
                  "resulting_condition": "(multiple equal(9000, `ot`.`game_id`) and multiple equal(15000, `ot`.`user_id`))"
                },
                {
                  "transformation": "constant_propagation",
                  "resulting_condition": "(multiple equal(9000, `ot`.`game_id`) and multiple equal(15000, `ot`.`user_id`))"
                },
                {
                  "transformation": "trivial_condition_removal",
                  "resulting_condition": "(multiple equal(9000, `ot`.`game_id`) and multiple equal(15000, `ot`.`user_id`))"
                }
              ]
            }
          },
          {
            "substitute_generated_columns": {
            }
          },
          {
            "table_dependencies": [
              {
                "table": "`optimizer_trace_demo` `ot`",
                "row_may_be_null": false,
                "map_bit": 0,
                "depends_on_map_bits": [
                ]
              }
            ]
          },
          {
            "ref_optimizer_key_uses": [
              {
                "table": "`optimizer_trace_demo` `ot`",
                "field": "game_id",
                "equals": "9000",
                "null_rejecting": true
              },
              {
                "table": "`optimizer_trace_demo` `ot`",
                "field": "user_id",
                "equals": "15000",
                "null_rejecting": true
              },
              {
                "table": "`optimizer_trace_demo` `ot`",
                "field": "game_id",
                "equals": "9000",
                "null_rejecting": true
              },
              {
                "table": "`optimizer_trace_demo` `ot`",
                "field": "user_id",
                "equals": "15000",
                "null_rejecting": true
              }
            ]
          },
          {
            "rows_estimation": [
              {
                "table": "`optimizer_trace_demo` `ot`",
                "range_analysis": {
                  "table_scan": {
                    "rows": 49504,
                    "cost": 5104.75
                  },
                  "potential_range_indexes": [
                    {
                      "index": "PRIMARY",
                      "usable": false,
                      "cause": "not_applicable"
                    },
                    {
                      "index": "idx_game_id",
                      "usable": true,
                      "key_parts": [
                        "game_id",
                        "id"
                      ]
                    },
                    {
                      "index": "idx_user_id",
                      "usable": true,
                      "key_parts": [
                        "user_id",
                        "id"
                      ]
                    },
                    {
                      "index": "idx_game_user_round",
                      "usable": true,
                      "key_parts": [
                        "game_id",
                        "user_id",
                        "round_index",
                        "id"
                      ]
                    }
                  ],
                  "setup_range_conditions": [
                  ],
                  "group_index_skip_scan": {
                    "chosen": false,
                    "cause": "not_group_by_or_distinct"
                  },
                  "skip_scan_range": {
                    "potential_skip_scan_indexes": [
                      {
                        "index": "idx_game_id",
                        "usable": false,
                        "cause": "query_references_nonkey_column"
                      },
                      {
                        "index": "idx_user_id",
                        "usable": false,
                        "cause": "query_references_nonkey_column"
                      },
                      {
                        "index": "idx_game_user_round",
                        "usable": false,
                        "cause": "query_references_nonkey_column"
                      }
                    ]
                  },
                  "analyzing_range_alternatives": {
                    "range_scan_alternatives": [
                      {
                        "index": "idx_game_id",
                        "ranges": [
                          "game_id = 9000"
                        ],
                        "index_dives_for_eq_ranges": true,
                        "rowid_ordered": true,
                        "using_mrr": false,
                        "index_only": false,
                        "in_memory": 0,
                        "rows": 500,
                        "cost": 175.26,
                        "chosen": true
                      },
                      {
                        "index": "idx_user_id",
                        "ranges": [
                          "user_id = 15000"
                        ],
                        "index_dives_for_eq_ranges": true,
                        "rowid_ordered": true,
                        "using_mrr": false,
                        "index_only": false,
                        "in_memory": 0,
                        "rows": 100,
                        "cost": 35.26,
                        "chosen": true
                      },
                      {
                        "index": "idx_game_user_round",
                        "ranges": [
                          "game_id = 9000 AND user_id = 15000"
                        ],
                        "index_dives_for_eq_ranges": true,
                        "rowid_ordered": false,
                        "using_mrr": false,
                        "index_only": false,
                        "in_memory": 0,
                        "rows": 100,
                        "cost": 35.26,
                        "chosen": false,
                        "cause": "cost"
                      }
                    ],
                    "analyzing_roworder_intersect": {
                      "intersecting_indexes": [
                        {
                          "index": "idx_user_id",
                          "index_scan_cost": 1.19298,
                          "cumulated_index_scan_cost": 1.19298,
                          "disk_sweep_cost": 24.4987,
                          "cumulated_total_cost": 25.6917,
                          "usable": true,
                          "matching_rows_now": 100,
                          "isect_covering_with_this_index": false,
                          "chosen": true
                        },
                        {
                          "index": "idx_game_id",
                          "index_scan_cost": 1.97271,
                          "cumulated_index_scan_cost": 3.16569,
                          "disk_sweep_cost": 0.25,
                          "cumulated_total_cost": 3.41569,
                          "usable": true,
                          "matching_rows_now": 1.01002,
                          "isect_covering_with_this_index": false,
                          "chosen": true
                        }
                      ],
                      "clustered_pk": {
                        "clustered_pk_added_to_intersect": false,
                        "cause": "no_clustered_pk_index"
                      },
                      "rows": 1.01002,
                      "cost": 3.41569,
                      "covering": false,
                      "chosen": true
                    }
                  },
                  "chosen_range_access_summary": {
                    "range_access_plan": {
                      "type": "index_roworder_intersect",
                      "rows": 1.01002,
                      "cost": 3.41569,
                      "covering": false,
                      "clustered_pk_scan": false,
                      "intersect_of": [
                        {
                          "type": "range_scan",
                          "index": "idx_user_id",
                          "rows": 100,
                          "ranges": [
                            "user_id = 15000"
                          ]
                        },
                        {
                          "type": "range_scan",
                          "index": "idx_game_id",
                          "rows": 500,
                          "ranges": [
                            "game_id = 9000"
                          ]
                        }
                      ]
                    },
                    "rows_for_plan": 1.01002,
                    "cost_for_plan": 3.41569,
                    "chosen": true
                  }
                }
              }
            ]
          },
          {
            "considered_execution_plans": [
              {
                "plan_prefix": [
                ],
                "table": "`optimizer_trace_demo` `ot`",
                "best_access_path": {
                  "considered_access_paths": [
                    {
                      "access_type": "ref",
                      "index": "idx_game_id",
                      "rows": 500,
                      "cost": 175,
                      "chosen": true
                    },
                    {
                      "access_type": "ref",
                      "index": "idx_user_id",
                      "rows": 100,
                      "cost": 35,
                      "chosen": true
                    },
                    {
                      "access_type": "ref",
                      "index": "idx_game_user_round",
                      "rows": 100,
                      "cost": 35,
                      "chosen": false
                    },
                    {
                      "rows_to_scan": 1,
                      "filtering_effect": [
                      ],
                      "final_filtering_effect": 1,
                      "access_type": "range",
                      "range_details": {
                        "used_index": "intersect(idx_user_id,idx_game_id)"
                      },
                      "resulting_rows": 1,
                      "cost": 3.51569,
                      "chosen": true,
                      "use_tmp_table": true
                    }
                  ]
                },
                "condition_filtering_pct": 100,
                "rows_for_plan": 1,
                "cost_for_plan": 3.51569,
                "sort_cost": 1,
                "new_cost_for_plan": 4.51569,
                "chosen": true
              }
            ]
          },
          {
            "attaching_conditions_to_tables": {
              "original_condition": "((`ot`.`user_id` = 15000) and (`ot`.`game_id` = 9000))",
              "attached_conditions_computation": [
              ],
              "attached_conditions_summary": [
                {
                  "table": "`optimizer_trace_demo` `ot`",
                  "attached": "((`ot`.`user_id` = 15000) and (`ot`.`game_id` = 9000))"
                }
              ]
            }
          },
          {
            "optimizing_distinct_group_by_order_by": {
              "simplifying_order_by": {
                "original_clause": "`ot`.`round_index`,`ot`.`id`",
                "items": [
                  {
                    "item": "`ot`.`round_index`"
                  },
                  {
                    "item": "`ot`.`id`"
                  }
                ],
                "resulting_clause_is_simple": true,
                "resulting_clause": "`ot`.`round_index`,`ot`.`id`"
              }
            }
          },
          {
            "finalizing_table_conditions": [
              {
                "table": "`optimizer_trace_demo` `ot`",
                "original_table_condition": "((`ot`.`user_id` = 15000) and (`ot`.`game_id` = 9000))",
                "final_table_condition   ": "((`ot`.`user_id` = 15000) and (`ot`.`game_id` = 9000))"
              }
            ]
          },
          {
            "refine_plan": [
              {
                "table": "`optimizer_trace_demo` `ot`"
              }
            ]
          },
          {
            "considering_tmp_tables": [
              {
                "adding_sort_to_table": "ot"
              }
            ]
          }
        ]
      }
    },
    {
      "join_execution": {
        "select#": 1,
        "steps": [
          {
            "sorting_table": "ot",
            "filesort_information": [
              {
                "direction": "asc",
                "expression": "`ot`.`round_index`"
              },
              {
                "direction": "asc",
                "expression": "`ot`.`id`"
              }
            ],
            "filesort_priority_queue_optimization": {
              "limit": 10,
              "chosen": false,
              "cause": "sort_is_cheaper"
            },
            "filesort_execution": [
            ],
            "filesort_summary": {
              "memory_available": 262144,
              "key_size": 16,
              "row_size": 65586,
              "max_rows_per_buffer": 3,
              "num_rows_estimate": 15,
              "num_rows_found": 100,
              "num_initial_chunks_spilled_to_disk": 0,
              "peak_memory_used": 33792,
              "sort_algorithm": "std::sort",
              "sort_mode": "<fixed_sort_key, packed_additional_fields>"
            }
          }
        ]
      }
    }
  ]
}


可以把上面的丢给AI分析，这里简单总结这份trace的选择过程就是：
全表扫描 cost 5104.75
  ↓ 太贵

idx_game_id 单独 cost 175.26
  ↓ 太贵

idx_user_id 单独 cost 35.26
  ↓ 可行

idx_game_user_round cost 35.26
  ↓ 没有更低

intersect(idx_user_id, idx_game_id) cost 3.51569
  ↓ 估算交集只剩 1 行

最终选择 intersect

所以结论是：
MySQL 选择 intersect(idx_user_id, idx_game_id)，不是因为复合索引不能用，而是因为它估算这个交集方案只需要处理约 1 行，比复合索引的 100 行回表更便宜。
但这个判断建立在“两列条件独立”的假设上；在真实业务数据里，如果列相关性强，这种选择可能反而不好。

MySQL filesort
filesort是什么
filesort 是 MySQL 里排序算子的名字，不是“真的一定写文件”。当优化器发现：
1.ORDER BY
2.GROUP BY（某些版本/场景下隐含排序需求）
3.DISTINCT + 排序
4.窗口函数或某些子查询物化后的排序
无法直接利用索引的有序性返回结果时，就需要一个专门的排序过程，这个排序过程在执行计划里通常显示为：
Using filesort

注意：filesort 不等于“磁盘排序”。数据量小时它在内存里完成；只有排序数据超过 sort_buffer_size 等限制时，才可能写临时文件做多路归并。
什么时候会出现filesort
假设表结构如下：
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  status TINYINT NOT NULL,
  created_at DATETIME NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  KEY idx_user_status (user_id, status)
);

会触发 filesort的查询
SELECT *
FROM orders
WHERE user_id = 1
ORDER BY created_at DESC;

索引 idx_user_status(user_id, status) 保证的是 user_id, status 有序，但结果集里的 created_at 没有索引有序性，所以需要 filesort。
不会触发 filesort的查询
SELECT *
FROM orders
WHERE user_id = 1
ORDER BY status;

因为 user_id = 1 后，索引的下一列 status 本身就是有序的，MySQL 可以按索引顺序直接返回。

filesort是在内存中还是磁盘中完成？
sort_buffer_size
每个会话执行排序时，MySQL 会分配自己的 sort buffer。默认值通常不大，例如 256KB 或 1MB，具体取决于版本和配置。如果需要排序的数据能放进 sort buffer：
●内存内快速排序。
如果放不下：
●MySQL 可能分块排序；
●每块写临时文件；
●再做多路归并；
●这才更接近“文件排序”的字面含义。
注意
sort_buffer_size 是连接级变量，不建议盲目调到几百 MB，否则高并发下可能造成内存压力。

为啥我们的chat messages查询会OOM
前面铺垫了那么多，终于可以回来分析我们的问题了
问题分析
chat messages表索引结构：

下面的查询语句
SELECT COUNT(*) AS failed_rows
FROM (
  SELECT
    chat_messages.id,
    chat_messages.round_index,
    chat_messages.response_json
  FROM chat_messages
  WHERE chat_messages.game_id = 994885889
    AND chat_messages.user_id = 1599514642999
  ORDER BY chat_messages.round_index, chat_messages.id
  LIMIT 10
) AS t;

拆开这条查询语句：
1. 这条 SQL 的本意
WHERE chat_messages.game_id = 994885889
  AND chat_messages.user_id = 1599514642999
ORDER BY chat_messages.round_index, chat_messages.id
LIMIT 10;

它的意思是：
“找出某个游戏下某个用户的消息，按轮次和消息 ID 顺序，最多取 10 条。”
2. 表里其实已经有合适的索引
chat_messages 有这个索引：
idx_game_user_round (game_id, user_id, round_index, id)

理论上，MySQL 应该这样走：
1.先按 game_id = 994885889
2.再按 user_id = 1599514642999
3.这个索引内部已经按 round_index, id 排好了
4.顺着索引读前 10 条即可
理想情况下根本不需要额外排序。

3. 但 MySQL 优化器实际选了坏计划
EXPLAIN 显示它没有走 idx_game_user_round，而是走了：
Using intersect(idx_game_id, idx_user_id)
Using filesort

意思是：
●它分别用了 idx_game_id 和 idx_user_id
●先把两个结果交集算出来
●再对结果做一次 filesort 排序
●最后才应用 LIMIT 10
这就有问题了。


4. 排序时要带着大字段一起排
这条查询会返回：
chat_messages.response_json

当前查询的这组数据里，最大一行 response_json 大约是：356 KB。而MySQL当前filesort的sort_buffer_size只有256KB。也就是说，单条要排序的数据比排序缓存还大。MySQL 排序时需要把这个大 JSON 放进排序缓冲区，结果就报：
Error 1038 (HY001): Out of sort memory


结论
一句话就是这次查询，mysql优化器并没有走联合索引，而是选择了两个单列索引求交集的方案，然后交集的结果并不满足排序要求，因此还要拿到filesort中排序。结果刚好查出来的response_json字段直接撑爆了filesort的buffer缓存

为啥这次chat messages的查询没有顺利转到磁盘排序？
filesort会优先在内存中排序，如果内存放不下，才可能溢出到磁盘临时文件，再归并排序。
那为啥这次chat messages的查询没有顺利转到磁盘排序？

你问AI吧，懒得写了
修复方案
方案1：加 FORCE INDEX
FORCE INDEX (idx_game_user_round)

方案2：业务层先排序再组装
第一次 SQL：查消息列表元数据，不带 response_json
第二次 SQL：根据第一次拿到的 id 批量查 response_json
业务层：把 response_json 合并回消息对象


