## exec_command参数定义

exec_command的完整参数定义在 `codex/codex-rs/core/src/tools/handlers/unified_exec.rs:28`
<img width="819" height="494" alt="image" src="https://github.com/user-attachments/assets/8238a579-5c33-4525-bdfb-e3f76facbd0b" />


工具schema在 `codex-rs/core/src/tools/handlers/shell_spec.rs`

<img width="1026" height="533" alt="image" src="https://github.com/user-attachments/assets/3efc16b0-155d-4af8-a8ef-bb9bea23b162" />

| 参数 | 作用 |
|---|---|
| `cmd` | 必填。完整 shell 命令字符串，例如 `"rg -n TODO codex-rs | head -200"`。支持管道、`&&`、引号、重定向、变量展开等 shell 语法。 |
| `workdir` | 工作目录。省略时用当前 turn 的工作目录；相对路径会基于环境 cwd 解析，见 `/codex/codex-rs/core/src/tools/handlers/unified_exec/exec_command.rs:196`。 |
| `tty` | 默认 `false`。`true` 分配 PTY，适合交互式进程；`false` 使用普通管道。若进程仍存活，返回 `session_id`，可用 `write_stdin` 继续交互。 |
| `yield_time_ms` | 首次等待输出的时间，默认 `10000ms`。时间到了进程还没结束就返回 session ID。有效范围通常 clamp 到 `250–30000ms`，Windows 最低 10000ms，见 `/codex/codex-rs/core/src/unified_exec/mod.rs:218`。 |
| `max_output_tokens` | 输出 token 预算，默认 `10000`。但实际会被当前模型的 truncation policy 进一步截断，前面讨论过的 30000 未必生效。 |
| `shell` | 可选 shell 路径或名称。默认用用户的默认 shell。注意它主要用来识别 shell 类型，再发现对应可执行文件。 |
| `login` | 可选布尔值。对 zsh/bash/sh 表示用 `-lc` 还是 `-c`；如果配置允许，省略时可能默认 login shell。 |
| `sandbox_permissions` | 沙箱覆盖策略。常见值：`use_default`、`require_escalated`，功能开启时还有 `with_additional_permissions`。 |
| `justification` | 用户可见的升级理由，通常只在 `sandbox_permissions: "require_escalated"` 时使用。 |
| `prefix_rule` | 可复用的审批前缀规则，例如 `["git", "pull"]`，只在 `require_escalated` 场景下有意义。 |



比如，下面是LLM返回的exec_command调用：
<img width="1134" height="592" alt="image" src="https://github.com/user-attachments/assets/6ac1ad9d-8359-4aa0-b585-7c9b195e67d3" />

含义逐段解释：
- rg：Rust 的快速文本搜索工具，类似 grep，默认递归搜索目录。
- -n：显示匹配内容所在源码文件的行号。
- "read_file|ReadFile|..."：搜索正则表达式，| 表示“或”。所以只要某一行包含其中任意一个片段就会被匹配。
- codex-rs：只在 codex-rs 目录里搜索。
- --glob '*.rs'：只搜索 .rs 文件。
- | head -200：把搜索输出截断为前 200 行。
- local_image|local_image 是重复的，写一次即可。

检索结果的格式是：

```text
文件路径:行号:匹配的那一行内容
```

例如图里这一行：

```text
codex-rs/protocol/src/mcp.rs:459: ("read_file", Some("mcp__node_repl"), true),
```
表示：
- 文件是 codex-rs/protocol/src/mcp.rs
- 匹配位置在第 459 行
- 返回的是该文件第 459 行的原始内容
- 该行包含 read_file
所以结果特征是：
- 不会返回整个 .rs 文件；
- 每个匹配只会返回单行；
- 同一个文件如果有 8 个匹配，就会返回 8 行；
- head -200 后最多只会看到 200 条这样的匹配行；
- 图中 “Warning: truncated output” 说明这次工具输出被截断了，但截断来源是输出限制/head -200，不是 rg 本身必须限制输出。

> 从这里可以看出，rg根据关键字检索时，只会返回匹配关键字的那一行。比如检索"read_file"这个关键字时，虽然"mcp.rs"这个文件有很多命中，但rg并不会把整个"mcp.rs"文件内容都返回给模型，而是把"mcp.rs"匹配到"read_file"关键字的所有的行都列出来。这是由`ripreg`的检索机制决定的。

## exec_command返回结果：是一段文本
<img width="943" height="570" alt="image" src="https://github.com/user-attachments/assets/a8bf97d9-fee3-4bb3-a233-7810a1765ada" />

以下面的返回为例：

<img width="1129" height="625" alt="image" src="https://github.com/user-attachments/assets/2aaaf583-7ead-4e8c-be61-74f845b81c5d" />

这些内容是 Codex 分层拼出来的：先收集 shell 的原始输出，再加上 exec_command 的元数据，最后按 token 预算截断。

<img width="1077" height="704" alt="image" src="https://github.com/user-attachments/assets/ccece9ea-dbc5-4b79-9553-1c1c26e1e425" />

```text
Chunk ID: 752b0c
Wall time: 0.2708 seconds
Process exited with code 0
Original token count: 5000
Output:
Warning: truncated output (original token count: 5000)
Total output lines: 200

codex-rs/protocol/src/mcp.rs:459:            ("read_file", Some("mcp__node_repl"), true),
```
可以理解为：
```rust
model_output = header + "\n" + truncated_body
```
其中
```rust
header = [
    "Chunk ID: e0ae14",
    "Wall time: 0.0000 seconds",
    "Process exited with code 0",
    "Original token count: 5252",
    "Output:",
].join("\n")
```

这一段来自 `/codex/codex-rs/core/src/tools/context.rs:524`。

各字段来源
- Chunk ID：每次执行生成的短随机 ID，见 `/codex/codex-rs/core/src/unified_exec/mod.rs:236`。
- Wall time：命令执行耗时，Instant::now() 前后相减，见 `/学习/codex/codex-rs/core/src/unified_exec/process_manager.rs:659`。
- Process exited with code 0：子进程退出码。
- Original token count: 5000：按大约 4 字节/token 估算原始输出 token 数，见 `/学习/codex/codex-rs/core/src/unified_exec/process_manager.rs:661`。
- Output:：固定分隔行，不是命令输出的一部分。

Warning 和 Total output lines
下面这部分是 Codex 的截断包装：

```text
Warning: truncated output (original token count: 5000)
Total output lines: 200

...实际输出...
```

生成位置是 `/codex/codex-rs/utils/output-truncation/src/lib.rs:20：`

```rust
format!(
    "Warning: truncated output (original token count: {original_token_count})\nTotal output lines: {total_lines}\n\n{result}"
)
```
其中：
- original_token_count 是截断前的近似 token 数；
- total_lines 是截断前完整输出的行数；
- 200 是 head -200 留下的 200 行
- 
最终返回给模型
response_text() 会执行：

```rust
format!("{header}\n{output}")
```

见 `codex/codex-rs/core/src/tools/context.rs:550`。

**所以`exec_command`工具调用的输出最终不是 JSON，而是一段文本**。

## 工具输出的token预算怎么计算
以下面的调用为例：
<img width="1129" height="607" alt="image" src="https://github.com/user-attachments/assets/cf6f3432-0a4d-4fe4-bd95-59254cf147f6" />

执行的命令如下：
```shell
find codex-rs/core/src -maxdepth 2 -type f | sort | rg 'tool|shell|file|image' && printf '\n--- Tool definitions ---\n' && rg -n "pub enum Tool|struct Tool|ToolSpec|create_tools|build_tools|all_tools|LocalShell|ViewImage|view_image" codex-rs/core/src codex-rs/protocol/src codex-rs/core/src/tools 2>/dev/null | head -300
```
可以拿到本地(codex源码仓库)执行：

<img width="1033" height="466" alt="image" src="https://github.com/user-attachments/assets/97e9d560-5846-45c4-b228-1f74abe7dab5" />

这个命令原始的返回是367行，包含32,687 bytes，近似tokens：8,172。

Codex 的近似公式是：
```text
1 token ≈ 4 bytes
```

所以工具返回的
```text
Original token count: 8108
Output:
Warning: truncated output (original token count: 8108)
```
这里面的8108 token表示命令原始返回的文本换算成近似token就是8108个。表示的是原本的输出。

工具的返回如下，可以看到明显被截断了。Codex 工具实际返回给模型的约 141 行正文，包含10,212 bytes，近似tokens：2,553。
<img width="1142" height="676" alt="image" src="https://github.com/user-attachments/assets/65bdda08-c725-41a0-9dc6-fb7bbf3dbe1d" />

这里需要注意，输出是从中间截断的，保留了开头和结尾。不过这里有两层截断要区分：
| 层 | 行为 |
|---|---|
| shell 里的 `head -300` | 只保留最后一段 `rg` 的前 300 行，丢掉后面的行 |
| Codex 工具输出截断 | 保留整体输出的开头和结尾，丢中间 |

也就是说，先从原始输出中截取前面300行，后面的直接丢掉。然后从前面三百行中根据token预算，只保留开头和结尾，中间的丢掉
