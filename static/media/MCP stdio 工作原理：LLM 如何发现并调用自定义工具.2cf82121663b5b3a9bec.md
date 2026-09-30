# MCP stdio 工作原理：LLM 如何发现并调用自定义工具

具体代码参考：[https://github.com/lizuncong/codex-study/blob/feature/20260930/simple-codex-tool/docs/mcp-stdio-working-principle.md](https://github.com/lizuncong/codex-study/blob/feature/20260930/simple-codex-tool/docs/mcp-stdio-working-principle.md)


本文拆解本项目 `project_tools` 的完整调用链，回答两个问题：

1. stdio 模式下，MCP server 是怎么和 Codex 通信的？
2. LLM 为什么知道有 `get_project_info`、`read_project_file` 这些自定义工具？

简短结论：LLM 不直接启动 Node 子进程，也不直接读写 stdio。Codex 先启动 stdio MCP server，通过 JSON-RPC 拉取工具清单，把清单转换成模型请求里的 tool definitions；LLM 根据这些 schema 决定是否调用工具，Codex 再代为发起 `tools/call`。

## 端到端链路

```text
浏览器 / Chat UI
    ↓ POST /api/chat
Next.js API Route（Node.js）
    ↓ streamCodexReply()
@openai/codex-sdk
    ↓ spawn codex exec --experimental-json
Codex CLI / Agent Runtime
    ↓ spawn node scripts/customToolsMcp/index.mjs
project_tools MCP stdio server
```

stdio 模式下没有 HTTP 端口。Codex 把 MCP server 当作子进程启动，然后使用三条标准流：

- 子进程 `stdin`：Codex 向 MCP server 写入 JSON-RPC 请求和通知。
- 子进程 `stdout`：MCP server 向 Codex 返回 JSON-RPC 响应。
- 子进程 `stderr`：只放日志和诊断信息，不能放协议报文。

注意这里的“stdio”不是让人在终端输入内容，而是指父进程和子进程之间的标准输入输出管道。协议内容是按行分隔的 JSON-RPC 消息，也就是 NDJSON。

## 第 1 步：在 SDK 配置里声明 MCP server

`lib/agent-sdk/custom-tools.ts` 告诉 Codex 有一个本地 stdio MCP server：

```ts
import path from "node:path";

export function buildCustomToolsConfig() {
  const serverScriptPath = path.join(
    process.cwd(),
    "scripts",
    "customToolsMcp",
    "index.mjs",
  );

  return {
    mcp_servers: {
      project_tools: {
        command: process.execPath,
        args: [serverScriptPath],
        env: {
          CUSTOM_TOOLS_ROOT: process.cwd(),
        },
        default_tools_approval_mode: "approve",
        supports_parallel_tool_calls: true,
        startup_timeout_sec: 10,
        tool_timeout_sec: 10,
      },
    },
  };
}
```

关键字段含义：

- `command`：Codex 要启动的可执行文件，这里是当前 Node.js 的绝对路径。
- `args`：传给子进程的参数，这里是 MCP server 脚本。
- `env`：只显式注入必要环境变量。`CUSTOM_TOOLS_ROOT` 把工具访问范围固定到当前项目。
- `default_tools_approval_mode: "approve"`：当前两个工具都是只读，声明可以免审批执行。
- `supports_parallel_tool_calls: true`：向 Codex 声明这些工具可以并行调用。
- `startup_timeout_sec` / `tool_timeout_sec`：控制启动和单次工具调用的超时。

`lib/agent-sdk/codex.ts` 再把这个配置传入 SDK：

```ts
const customToolsConfig = buildCustomToolsConfig();

const codex = new Codex({
  config: {
    mcp_servers: {
      ...customToolsConfig.mcp_servers,
      node_repl: {
        enabled: false,
      },
    },
  },
});
```

SDK 会把结构化配置展开成 Codex CLI 的 `--config` 参数，大致等价于：

```bash
codex exec --experimental-json \
  --config 'mcp_servers.project_tools.command="/path/to/node"' \
  --config 'mcp_servers.project_tools.args=["/path/to/project/scripts/customToolsMcp/index.mjs"]' \
  --config 'mcp_servers.project_tools.env={CUSTOM_TOOLS_ROOT="/path/to/project"}' \
  --config 'mcp_servers.project_tools.default_tools_approval_mode="approve"' \
  --config 'mcp_servers.project_tools.supports_parallel_tool_calls=true'
```

这一步只是“配置”。Codex 还没有问 LLM 有哪些工具可用，而是先由 Agent Runtime 启动并初始化 MCP server。

## 第 2 步：启动 stdio 子进程

Codex 看到 `command` / `args` 后，大致执行：

```text
node /path/to/project/scripts/customToolsMcp/index.mjs
```

然后建立三条流：

```text
Codex  --stdin-->  MCP server
Codex <--stdout--  MCP server
Codex <--stderr--  MCP server
```

我们的 server 用这个函数把协议响应写到 `stdout`：

```js
function writeMessage(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}
```

每条消息都是一行 JSON，结尾必须有换行符：

```json
{"jsonrpc":"2.0","id":1,"result":{}}
```

诊断信息不能写 `stdout`，否则会污染 JSON-RPC 流。日志应写 `stderr`：

```js
process.stderr.write(`自定义 MCP server 内部异常：${error?.stack ?? error}\n`);
```

## 第 3 步：JSON-RPC 初始化握手

Codex 启动子进程后，先发送 `initialize` 请求。示意报文如下：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-06-18",
    "capabilities": {},
    "clientInfo": {
      "name": "codex",
      "version": "0.159.0"
    }
  }
}
```

server 返回自己的能力和元数据：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-06-18",
    "capabilities": {
      "tools": {}
    },
    "serverInfo": {
      "name": "codex-study-custom-tools",
      "version": "1.0.0"
    }
  }
}
```

对应实现：

```js
if (method === "initialize") {
  writeMessage({
    jsonrpc: "2.0",
    id,
    result: {
      protocolVersion: params?.protocolVersion,
      capabilities: {
        tools: {},
      },
      serverInfo: {
        name: "codex-study-custom-tools",
        version: "1.0.0",
      },
    },
  });
  return;
}
```

### `capabilities.tools` 为什么是空对象

`initialize` 返回的 `capabilities` 只声明 server 具备哪些能力，不返回具体工具：

```json
"capabilities": {
  "tools": {}
}
```

这里的 `tools: {}` 表示：

> 这个 server 支持 MCP Tools 能力，使用默认配置。

它不表示“工具列表为空”。具体工具仍然由后续的 `tools/list` 返回。

如果 server 未来支持动态工具列表，可以把能力声明改为：

```json
{
  "tools": {
    "listChanged": true
  }
}
```

这表示工具列表可能变化，客户端需要关注 `notifications/tools/list_changed`。当前项目的工具是静态数组，因此使用空对象即可。

注意这两个同名键的位置和含义不同：

| 位置 | 含义 |
| --- | --- |
| `initialize.result.capabilities.tools` | 声明“支持 tools 能力” |
| `tools/list.result.tools` | 返回“具体工具数组” |

客户端随后可能发送 `notifications/initialized`。这是通知，不是请求，没有 `id`，所以不能返回响应：

```js
if (id === undefined || id === null) {
  return;
}
```

## 第 4 步：Codex 通过 `tools/list` 发现工具

初始化后，Codex 发送：

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}
```

server 返回工具目录：

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "get_project_info",
        "description": "获取当前 Next.js 项目的基础信息。",
        "inputSchema": {
          "type": "object",
          "properties": {},
          "additionalProperties": false
        }
      },
      {
        "name": "read_project_file",
        "description": "读取项目目录内指定文本文件，用于演示 MCP stdio 自定义工具调用。",
        "inputSchema": {
          "type": "object",
          "properties": {
            "relativePath": {
              "type": "string",
              "description": "项目根目录下的相对路径，例如 package.json 或 lib/agent-sdk/codex.ts。"
            }
          },
          "required": ["relativePath"],
          "additionalProperties": false
        }
      }
    ]
  }
}
```

当前工具按模块定义，`tools/list` 和 `tools/call` 共用同一份契约。入口通过注册中心装配：

```js
const registry = createToolRegistry();
registry.registerTool(getProjectInfoTool);
registry.registerTool(readProjectFileTool);
```

每个工具文件单独导出 MCP 声明和执行函数。以 `get_project_info` 为例：

```js
export const getProjectInfoTool = {
  name: "get_project_info",
  description: "获取当前 Next.js 项目的基础信息。",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },

  async execute(_args, context) {
    // 读取项目元数据并返回 MCP result。
  },
};
```

### `tools/list` 也是 MCP 协议方法

`tools/list` 和 `get_project_info`、`read_project_file` 不是同一层概念：

- `tools/list` 是 MCP 协议定义的工具发现方法。
- `get_project_info`、`read_project_file` 是通过 MCP 协议暴露的具体自定义工具。

| 名称 | 属于哪一层 | 谁知道 |
| --- | --- | --- |
| `initialize` | MCP 生命周期协议 | Codex 和 MCP server |
| `notifications/initialized` | MCP 生命周期通知 | Codex 和 MCP server |
| `tools/list` | MCP 工具发现协议 | Codex 和 MCP server |
| `tools/call` | MCP 工具执行协议 | Codex 和 MCP server |
| `get_project_info` | 自定义业务工具 | MCP server、Codex、LLM |
| `read_project_file` | 自定义业务工具 | MCP server、Codex、LLM |

模型不需要知道 `initialize`、`tools/list`、`tools/call` 这些协议方法。Codex 作为 MCP Client 负责使用这些方法和 server 通信，最后只把业务工具定义注入模型可见的 tools 参数。

## 第 5 步：LLM 如何知道这些工具

这是最容易误解的地方。

`tools/list` 返回的是给 Codex Agent Runtime 的工具清单。Codex 拿到清单后，会把这些 MCP 工具转换成模型请求里的 tool definitions。也就是说，下一次调用 LLM API 时，模型请求里会包含类似下面这种抽象后的信息：

```text
可用工具：

1. project_tools / get_project_info
   description: 获取当前 Next.js 项目的基础信息。
   parameters: {}

2. project_tools / read_project_file
   description: 读取项目目录内指定文本文件。
   parameters:
     relativePath: string (required)
```

因此，LLM 知道工具不是因为：

- 它直接扫描了 `scripts/customToolsMcp/`；
- 它读到了 `docs/` 目录下的文章；
- 它自己启动了 Node 子进程；
- 它直接向 stdio 写 JSON-RPC。

LLM 知道工具，是因为 Agent Runtime 已经完成 MCP 发现，并把工具名称、描述和 JSON Schema 放进了模型可见的上下文 / tool definitions 中。模型只是根据用户问题和这些 schema 决定要不要发起一次工具调用。

## 第 6 步：LLM 决定调用工具

比如用户输入：

```text
请调用 get_project_info 工具，返回项目名。
```

模型看到有 `get_project_info`，于是返回一个工具调用意图，抽象上类似：

```json
{
  "type": "tool_call",
  "server": "project_tools",
  "tool": "get_project_info",
  "arguments": {}
}
```

模型本身不执行工具。Codex 收到这个意图后，检查审批策略、超时、工具是否可用，然后把真正的 MCP 请求发给对应 stdio server。

## 第 7 步：Codex 向 MCP server 发起 `tools/call`

Codex 发送的请求类似：

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_project_info",
    "arguments": {}
  }
}
```

server 的调度逻辑：

```js
if (method === "tools/call") {
  const result = await callTool(params?.name, params?.arguments);
  writeMessage({
    jsonrpc: "2.0",
    id,
    result,
  });
  return;
}
```

具体工具实现：

```js
async function getProjectInfo() {
  const packageRaw = await readFile(path.join(projectRoot, "package.json"), "utf8");
  const packageJson = JSON.parse(packageRaw);

  return {
    projectRoot,
    projectName: packageJson.name ?? "unknown",
    projectVersion: packageJson.version ?? "unknown",
    nodeVersion: process.version,
    mcpTransport: "stdio",
  };
}
```

`read_project_file` 会先校验路径，避免 `..` 或符号链接逃出项目根目录：

```js
async function normalizeRelativePath(relativePath) {
  const resolvedPath = path.resolve(projectRoot, relativePath);
  const realRoot = await realpath(projectRoot);
  const realPath = await realpath(resolvedPath);

  if (
    realPath !== realRoot &&
    !realPath.startsWith(`${realRoot}${path.sep}`)
  ) {
    throw new Error("路径必须位于项目根目录内。");
  }

  return realPath;
}
```

工具执行成功后，server 返回 MCP result：

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "已读取项目基础信息。"
      }
    ],
    "structuredContent": {
      "projectRoot": "/path/to/project",
      "projectName": "codex-study",
      "projectVersion": "0.1.0",
      "nodeVersion": "v23.11.1",
      "mcpTransport": "stdio"
    }
  }
}
```

`content` 是 MCP 约定的展示内容；`structuredContent` 是机器可读结果。工具内部失败时，应返回 `isError: true`，让模型继续解释失败原因：

```js
if (method === "tools/call") {
  writeMessage({
    jsonrpc: "2.0",
    id,
    result: {
      content: [{ type: "text", text: error?.message ?? "工具执行失败。" }],
      isError: true,
    },
  });
  return;
}
```

## 第 8 步：Codex 把执行结果回给模型

Codex 收到 MCP result 后，会把它作为工具调用结果放进当前 agent 回合中。模型基于这些结果继续生成自然语言回复。

在本项目的真实测试中，链路如下：

```text
User:
请调用 get_project_info 工具，返回项目名。

Codex -> project_tools:
tools/call get_project_info {}

project_tools -> Codex:
structuredContent.projectName = "codex-study"

Model:
项目名为：codex-study
```

## 第 9 步：SDK 把工具事件转发给前端

SDK 事件流里会出现 `mcp_tool_call` item。`lib/agent-sdk/codex.ts` 判断并转发：

```ts
function isMcpToolCallEvent(event: ThreadEvent): event is
  | { type: "item.started"; item: McpToolCallItem }
  | { type: "item.updated"; item: McpToolCallItem }
  | { type: "item.completed"; item: McpToolCallItem } {
  return (
    (event.type === "item.started" ||
      event.type === "item.updated" ||
      event.type === "item.completed") &&
    event.item.type === "mcp_tool_call"
  );
}
```

收到事件后，转换成聊天流事件：

```ts
if (isMcpToolCallEvent(event)) {
  options.onEvent({
    type: "tool",
    toolId: event.item.id,
    server: event.item.server,
    tool: event.item.tool,
    status: event.item.status,
    summary: getToolCallSummary(event.item),
  });
  continue;
}
```

前端看到的事件类似：

```json
{"type":"tool","toolId":"item_3","server":"project_tools","tool":"get_project_info","status":"in_progress","summary":"正在调用自定义工具…"}
{"type":"tool","toolId":"item_3","server":"project_tools","tool":"get_project_info","status":"completed","summary":"已读取项目基础信息。"}
```

所以 UI 能显示“调用中 / 成功 / 失败”，而不是只显示最终文本。

## 哪些代码是协议必需的

`scripts/customToolsMcp/` 按模块拆分：

| 文件 | 职责 |
| --- | --- |
| `index.mjs` | 入口，注册工具并装配协议、传输和工具上下文 |
| `protocol/handler.mjs` | MCP 方法分发 |
| `protocol/jsonRpc.mjs` | JSON-RPC 消息与错误封装 |
| `protocol/toolResult.mjs` | MCP 工具结果格式 |
| `transport/stdio.mjs` | stdin/stdout JSON-RPC 分帧和并发处理 |
| `tools/toolRegistry.mjs` | 工具注册中心 |
| `tools/get-project-info.mjs` | 单独实现 `get_project_info` |
| `tools/read-project-file.mjs` | 单独实现 `read_project_file` |

协议层和业务层可以概括为：

### MCP / stdio 协议层

| 当前代码 | 作用 | 必要性 |
| --- | --- | --- |
| `writeMessage()` | 把 JSON-RPC 响应写进 `stdout`，每条消息一行 JSON | stdio 传输必需 |
| `stdin` 的 `data` 监听和分行解析 | 从 `stdin` 读取 Codex 发来的 JSON-RPC 消息 | stdio 传输必需 |
| `handleMcpMessage()` | MCP 方法分发入口 | 必需 |
| `initialize` 分支 | 完成协议握手 | MCP server 必需 |
| 无 `id` 消息不回包 | 正确处理通知，例如 `notifications/initialized` | MCP 生命周期需要 |
| `tools/list` 分支 | 返回注册中心导出的工具目录 | 声明 `tools` 能力后必需 |
| `tools/call` 分支 | 调用注册中心并执行具体工具 | 提供工具后必需 |
| `jsonRpcError()` | 返回标准 JSON-RPC 错误结构 | 错误响应需要 |
| `textResult()` | 生成 MCP `content` 结果结构 | 工具结果格式需要 |

最小生命周期可以概括为：

```text
stdin 收 JSON-RPC
  → initialize
  → notifications/initialized（不回包）
  → tools/list
  → tools/call
stdout 返回 JSON-RPC
```

### 项目业务层

下面这些函数不是 MCP 协议本身，而是本项目的工具实现：

- `normalizeRelativePath()`：限制读取范围在项目根目录内。
- `getProjectInfoTool.execute()`：读取项目基础信息。
- `readProjectFileTool.execute()`：读取项目内文本文件。
- `createToolRegistry()`：把工具名映射到具体实现。
- 每个工具文件中的 `inputSchema`：工具目录和参数契约。

`ping` 分支用于响应 MCP 健康检查请求；它不属于这两个自定义工具的核心业务，但实现后可以让 server 的协议行为更完整。

## 本地调试日志边界

本地排查时要注意代码运行在哪一层：

| 代码位置 | 是否适合 `console.log` | 原因 |
| --- | --- | --- |
| Next.js API Route、`lib/agent-sdk/*.ts` | 通常适合 | 运行在 Next.js Node 服务端，日志通常出现在 `pnpm dev` 终端 |
| `scripts/customToolsMcp/` | 不适合普通日志 | 这是 MCP stdio server，`stdout` 只能承载 JSON-RPC 协议消息 |

在 `scripts/customToolsMcp/` 中使用 `console.log()` 会写入子进程 `stdout`。普通文本混入 JSON-RPC 流后，客户端解析协议消息时可能报类似下面的错误：

```text
Unexpected token 'r', "read proje"... is not valid JSON
```

调试 MCP server 内部函数时应写 `stderr`：

```js
console.error("[project_tools] relativePath:", relativePath);
```

或：

```js
process.stderr.write(`[project_tools] relativePath=${relativePath}\n`);
```

`stderr` 只用于诊断，不会参与 MCP JSON-RPC 消息流。

## 并发和响应顺序

MCP server 不维护串行请求队列。多个请求由 Node 的异步 I/O 并发处理：

实际代码在 `transport/stdio.mjs` 中：每收到一行 JSON-RPC，就调用一次 `handleMessage()`；异步错误只会写入 `stderr`，不会向 `stdout` 返回无法配对的响应。

JSON-RPC 响应不需要按请求顺序返回，客户端用 `id` 配对请求和响应：

```text
request id=a -> 慢一些
request id=b -> 可能先返回
```

当前工具都是只读、互不依赖，所以声明 `supports_parallel_tool_calls: true` 是安全的。如果未来加入写入类、有全局状态或需要互斥锁的工具，就需要重新评估审批模式和并行能力。

## 进程生命周期

MCP stdio server 的生命周期通常跟随 Codex 回合或 Codex 客户端：

1. Codex 启动子进程。
2. 完成 `initialize` 握手。
3. 拉取 `tools/list`。
4. 在模型需要时发送 `tools/call`。
5. 回合结束或 Codex 退出时关闭 stdio，子进程收到 stdin 结束后退出。

`startup_timeout_sec` 控制握手和工具发现必须在多长时间内完成；`tool_timeout_sec` 控制单次 `tools/call` 的最大等待时间。

## 通用 MCP 服务的工作机制

市面上的 MCP server 都遵循同一套协议语义，但传输方式和部署位置可能不同。

工具型 MCP server 的通用流程是：

```text
MCP Client 初始化
  ↓
initialize 握手
  ↓
server 声明 capabilities
  ↓
Client 按需调用 tools/list
  ↓
Client 把工具注入 LLM 可见上下文
  ↓
LLM 决定是否调用某个 tool
  ↓
Client 发送 tools/call
  ↓
Server 执行并返回结果
  ↓
Client 把结果交回 LLM
```

<img width="827" height="695" alt="image" src="https://github.com/user-attachments/assets/8574f8c5-e4a0-4a3b-ba1b-e92aeb9951fd" />


常见传输方式：

| 类型 | 通信方式 | 例子 |
| --- | --- | --- |
| 本地 stdio | 客户端启动本地子进程，通过 `stdin` / `stdout` 通信 | Node / Python / CLI 工具 |
| 远程 HTTP | 客户端通过 HTTP 调用 server | 云端 MCP 服务 |
| Streamable HTTP | 流式 HTTP 传输 | 托管 MCP 服务 |
| 带 OAuth 的远程服务 | HTTP + 授权 | GitHub、Notion、Linear 这类 SaaS MCP |

MCP 也不只有 tools 能力。server 可以声明：

```json
{
  "capabilities": {
    "tools": {},
    "resources": {},
    "prompts": {}
  }
}
```

因此，不同 MCP 服务可能主要暴露：

- `tools`：让模型执行动作，例如查数据库、创建 Issue。
- `resources`：暴露可读取资源。
- `prompts`：提供预置 prompt 模板。
- 多种能力的组合。

所以，`initialize` / `tools/list` / `tools/call` 是工具型 MCP server 的标准机制；不同产品之间的主要差异通常在传输层、鉴权、部署位置和暴露的具体能力。

## 本项目为什么这样做

- **零依赖**：直接实现 NDJSON / JSON-RPC，避免只为两个演示工具引入 MCP SDK。
- **安全**：不监听端口，访问范围限制在项目根目录内。
- **可见性**：把 SDK 的 `mcp_tool_call` 事件转给前端，方便观察 Agent 的工具执行过程。
- **模型友好**：工具描述和 JSON Schema 明确，模型能正确判断参数。
- **可扩展**：新增工具时，只需要新建工具模块并在 `index.mjs` 注册。

## 快速手动验证

```bash
node --input-type=module <<'NODE'
import { spawn } from 'node:child_process';

const child = spawn(process.execPath, ['scripts/customToolsMcp/index.mjs'], {
  env: { ...process.env, CUSTOM_TOOLS_ROOT: process.cwd() },
});

let output = '';
child.stdout.on('data', (chunk) => {
  output += chunk.toString();
});

child.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: { protocolVersion: '2025-06-18' },
}) + '\n');

child.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list',
}) + '\n');

child.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: { name: 'get_project_info', arguments: {} },
}) + '\n');

child.stdin.end();
child.on('exit', () => console.log(output));
NODE
```

输出应包含：

- `serverInfo.name = "codex-study-custom-tools"`；
- `tools` 数组；
- `get_project_info` 的执行结果。
