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

## exec_command返回结果
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

## max_output_tokens参数
