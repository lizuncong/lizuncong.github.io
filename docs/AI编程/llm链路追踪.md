# 从 Langfuse、LangSmith、OpenLIT 看 LLM 链路追踪：OpenTelemetry 到底解决了什么

> 日期：2026-06-22  
> 主题：LLM Observability、OpenTelemetry、OTLP、Trace/Span、Node.js 协议 demo

## 1. 背景：为什么 LLM 应用需要链路追踪

传统 Web 服务的问题通常是：请求慢了、接口报错了、数据库查询超时了。传统 APM 工具可以回答：哪个接口慢、哪个服务报错、哪条 SQL 耗时高。

LLM 应用的问题更复杂。一次用户请求可能经过：

```text
用户输入
  -> prompt 构造
  -> RAG 向量检索
  -> rerank
  -> LLM 调用
  -> tool/function calling
  -> 输出解析
  -> 最终回答
```

当结果不理想时，我们想知道的不只是“接口慢了”，而是：

- 传给模型的 prompt 到底是什么？
- 检索到了哪些上下文？
- 哪一步耗时最长？
- 模型调用用了多少 input/output tokens？
- 哪个 tool 被调用了？参数是什么？结果是什么？
- 是检索错了、prompt 错了、模型输出错了，还是业务后处理错了？
- 这次请求成本是多少？

这就是 Langfuse、LangSmith、OpenLIT 等框架要解决的问题：给 LLM 应用提供可观测性，也就是让一次 AI 请求的内部执行过程可以被记录、还原、分析和评估。

## 2. 这些框架追踪的不是“模型脑内过程”

一个容易误解的点是：LLM observability 并不是追踪模型神经网络内部如何计算。

它追踪的是 LLM 应用层链路：

```text
Trace = 一次完整请求
Span/Run/Observation = 请求中的一个步骤
Attribute/Metadata = 每个步骤上的结构化信息
```

比如一次问答可以被记录成：

```text
trace: 用户问“OpenTelemetry 是什么”
  span: 构造 prompt
  span: vector_search
  span: rerank
  span: llm.chat.completions
  span: output_parser
```

每个 span 上可以挂载：

- 开始时间、结束时间、耗时
- 输入、输出
- 错误、重试
- 模型名
- token 用量
- tool 名称
- 检索 query
- user/session/tags

所以这些工具本质上是在做：**APM + 分布式追踪 + LLM 语义增强**。

## 3. OpenTelemetry 是什么

OpenTelemetry，简称 OTel，可以理解成现代可观测性的通用标准和工具箱。

它不是某一个监控产品，而是一套通用体系：

```text
采集标准 + SDK + 协议 + Collector + 语义规范
```

它主要处理三类遥测数据：

1. **Traces**：一次请求经过了哪些步骤。
2. **Metrics**：聚合指标，比如 QPS、延迟、错误率、token 数、成本。
3. **Logs**：日志事件，比如错误堆栈、调试信息、业务事件。

典型架构如下：

```text
你的应用
  -> OpenTelemetry SDK / instrumentation
  -> OTLP 协议
  -> OpenTelemetry Collector
  -> Langfuse / OpenLIT / Grafana / Jaeger / Datadog / ClickHouse
```

核心概念：

| 概念 | 含义 |
| --- | --- |
| Trace | 一次完整请求或操作 |
| Span | Trace 中的一个步骤 |
| Attribute | Span 上的结构化字段 |
| Context propagation | 跨函数、异步任务、服务调用传播当前 trace/span 上下文 |
| Exporter | 把遥测数据发到外部系统 |
| Collector | 接收、处理、采样、脱敏、转发遥测数据 |
| Semantic conventions | 对字段命名和含义的约定 |

## 4. 为什么说 Langfuse、LangSmith、OpenLIT 都“基于 OpenTelemetry”

这里的“基于”要分层理解。不是所有工具都等于“纯 OTLP 后端”，但它们都大量复用了 OpenTelemetry 的链路追踪范式。

### 4.1 数据模型相似

OpenTelemetry 的模型是：

```text
trace -> span -> attribute
```

不同 LLM observability 平台会换一些名字：

| 平台 | 顶层请求 | 单个步骤 |
| --- | --- | --- |
| OpenTelemetry | Trace | Span |
| Langfuse | Trace | Observation |
| LangSmith | Trace | Run |
| OpenLIT | Trace | Span |

名称不同，但本质都是一棵调用树。

### 4.2 协议和 Collector 生态可复用

OpenTelemetry 定义了 OTLP，也就是 OpenTelemetry Protocol。常见传输方式有：

- OTLP/gRPC
- OTLP/HTTP binary protobuf
- OTLP/HTTP JSON protobuf

trace 数据默认发到：

```text
POST /v1/traces
```

如果使用 JSON 编码，需要：

```text
Content-Type: application/json
```

这意味着只要工具支持 OTLP，就可以把同一份 trace 数据发给多个后端。例如：

```text
应用 -> OTel Collector -> Langfuse
                    -> Grafana Tempo
                    -> Datadog
                    -> 自建 ClickHouse
```

### 4.3 埋点方式相似

这些框架通常通过以下方式捕获链路：

- wrapper：包住 OpenAI、Anthropic、LangChain 等 SDK
- decorator：例如给函数加 `@traceable`
- middleware：在 Web 请求入口创建 trace
- callback/hook：利用框架生命周期事件
- monkey patch / auto-instrumentation：自动改写库函数入口
- context propagation：异步调用时保留父子关系

例如：

```text
用户请求进入 /chat
  创建 root span: POST /chat
  调用 retriever
    创建 child span: vector_search
  调用 LLM
    创建 child span: llm.chat.completions
  返回最终结果
    结束 root span
```

### 4.4 LLM 语义字段逐渐标准化

普通 OTel 关注 HTTP、DB、RPC 等字段：

```text
http.request.method
url.path
db.system.name
db.query.text
error.type
```

LLM observability 会额外关注 AI 语义：

```text
gen_ai.system
gen_ai.request.model
gen_ai.usage.input_tokens
gen_ai.usage.output_tokens
gen_ai.prompt.0.role
gen_ai.prompt.0.content
tool.name
retrieval.query
cost
```

这也是 OpenLIT 这类工具强调 OpenTelemetry-native 的原因：它希望 AI 相关遥测也可以进入标准可观测性生态，而不是被锁在某一个平台里。

## 5. 三个框架的侧重点

### Langfuse

Langfuse 的核心数据模型是：

```text
session -> trace -> observation
```

它面向 LLM 应用，支持：

- prompt/completion 记录
- generation、tool call、RAG step 等 observation 类型
- session 级别的多轮对话聚合
- token 和 cost 追踪
- prompt management
- evals 和 dataset
- OpenTelemetry 接入

适合想要开源、自托管、围绕 LLM 工程闭环做观测和评估的团队。

### LangSmith

LangSmith 的核心模型是：

```text
project -> trace -> run
```

它和 LangChain、LangGraph 生态结合很深。LangSmith 中一个 run 可以表示：

- LLM 调用
- prompt formatting
- retriever
- tool
- parser
- 任意被 `traceable` 包住的函数

它适合大量使用 LangChain/LangGraph 的应用，尤其适合 agent 调试、评估、数据集沉淀。

### OpenLIT

OpenLIT 更强调 OpenTelemetry-native：

- 自动 instrumentation
- 支持 LLM、agent、vector database、GPU 等遥测
- 支持 OpenTelemetry semantic conventions
- 可以与现有 OTel/observability 后端兼容

它适合已经有 OTel/Grafana/Collector 体系，希望把 AI 应用遥测接入统一平台的团队。

## 6. 一个最小 Node.js OTLP/HTTP demo

为了看清协议本体，可以不用任何 npm 包，手动构造 OTLP/HTTP JSON。

最小链路：

```text
POST /chat
  vector_search
  llm.chat.completions
```

核心 payload 结构大致如下：

```js
{
  resourceSpans: [
    {
      resource: {
        attributes: [
          { key: "service.name", value: { stringValue: "otel-node-demo" } }
        ]
      },
      scopeSpans: [
        {
          scope: { name: "manual-otlp-demo", version: "1.0.0" },
          spans: [
            {
              traceId: "...32 hex chars...",
              spanId: "...16 hex chars...",
              name: "POST /chat",
              kind: 2,
              startTimeUnixNano: "...",
              endTimeUnixNano: "...",
              attributes: []
            },
            {
              traceId: "same trace id",
              spanId: "...",
              parentSpanId: "root span id",
              name: "vector_search",
              attributes: []
            },
            {
              traceId: "same trace id",
              spanId: "...",
              parentSpanId: "root span id",
              name: "llm.chat.completions",
              attributes: [
                { key: "gen_ai.system", value: { stringValue: "openai" } },
                { key: "gen_ai.request.model", value: { stringValue: "gpt-demo" } },
                { key: "gen_ai.usage.input_tokens", value: { intValue: "128" } }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

关键点：

- 所有 span 共享同一个 `traceId`。
- 每个 span 有自己的 `spanId`。
- child span 通过 `parentSpanId` 指向父节点。
- `resourceSpans.resource.attributes` 描述服务整体信息。
- `scopeSpans.scope` 描述产生这些 span 的 instrumentation 库。
- `attributes` 放结构化业务和技术元数据。

发送方式：

```js
await fetch("http://127.0.0.1:4318/v1/traces", {
  method: "POST",
  headers: {
    "content-type": "application/json"
  },
  body: JSON.stringify(payload)
});
```

这就是最小意义上的“实现 OTLP/HTTP JSON 上报”。真实生产环境会让 OTel SDK 自动处理：

- trace/span 创建
- async context 传播
- 批量上报
- retry
- sampling
- shutdown flush
- exporter 配置

## 7. 从 demo 反推框架实现原理

有了上面的协议结构，就能反推 Langfuse、LangSmith、OpenLIT 这类工具大概怎么做。

### 7.1 捕获入口

在 HTTP 请求入口创建 root span：

```text
POST /chat
```

并生成：

```text
traceId = 当前请求 ID
spanId = 根节点 ID
```

### 7.2 包装关键调用

对 LLM SDK 做 wrapper：

```js
const response = await tracedOpenAI.chat.completions.create(...)
```

wrapper 内部做：

```text
start span
record prompt/model/options
call real SDK
record response/token/cost
end span
```

对 RAG、tool、parser 也是类似逻辑。

### 7.3 传播上下文

框架需要知道当前正在执行哪个 span。Node.js 里通常可以用 `AsyncLocalStorage` 保存当前上下文：

```text
当前请求 traceId = xxx
当前 spanId = yyy
```

当进入子函数时，新的 span 自动把 `parentSpanId` 指向当前 span。

### 7.4 异步批量发送

为了不拖慢业务请求，trace 数据通常先进队列，后台批量发送：

```text
业务线程创建 span -> 本地队列 -> batch exporter -> collector/backend
```

这也是为什么短生命周期脚本在退出前常常需要显式 flush。

## 8. 工程选型建议

如果团队已经有 OpenTelemetry/Grafana/Datadog/Collector 体系，优先考虑能输出 OTLP 或 OpenTelemetry-native 的方案。这样 LLM 链路可以进入统一观测平台。

如果主要诉求是 LLM 调试、prompt 管理、评估、数据集沉淀，Langfuse/LangSmith 这种 LLM 专用平台会更顺手。

如果强依赖 LangChain/LangGraph，LangSmith 的生态集成更自然。

如果希望开源自托管，并围绕 LLM observability + evals + prompt management 建平台，Langfuse 是很常见的选择。

如果目标是把 AI 应用当作现有可观测性体系的一部分，并尽量遵循 OTel 标准，OpenLIT 的定位更接近这个方向。

## 9. 总结

LLM observability 工具不是凭空发明了一套全新的链路追踪系统。它们大多复用了 OpenTelemetry 的核心思想：

```text
trace/span 树 + attribute 元数据 + context propagation + exporter/collector 管道
```

区别在于，它们把普通可观测性扩展到了 LLM 场景：

```text
prompt
completion
model
token
cost
tool call
retrieval
agent step
eval score
```

所以更准确的说法是：

> Langfuse、LangSmith、OpenLIT 等 LLM observability 框架，是在 OpenTelemetry 的链路追踪范式之上，增加了 LLM 专属语义、UI、成本分析、评估和 prompt 管理能力。

OpenTelemetry 负责“通用遥测语言和管道”，LLM observability 平台负责“让 AI 应用的执行过程可读、可分析、可优化”。

## 参考资料

- OpenTelemetry OTLP Specification: https://opentelemetry.io/docs/specs/otlp/
- Langfuse Observability Data Model: https://langfuse.com/docs/observability/data-model
- LangSmith Observability Concepts: https://docs.langchain.com/langsmith/observability-concepts
- OpenLIT Overview: https://docs.openlit.io/latest/overview
- OpenLIT Tracing: https://docs.openlit.io/latest/openlit/observability/tracing
