# Kubernetes 下 Node.js 服务优雅退出与滚动发布

## 1. 背景

当服务部署在 Kubernetes 中时，滚动发布、删除 Pod、节点驱逐等操作都会触发 Pod 退出。如果服务里有正在执行的异步任务，直接退出会导致任务中断。

目标是实现：

- 发布新版本时，新 Pod 先接收新流量。
- 旧 Pod 不再接收新请求或新任务。
- 旧 Pod 已经开始的任务继续执行。
- 当前任务完成后，Node.js 进程正常退出。
- 如果超过 Kubernetes 允许的退出时间，Pod 会被强制杀掉。

核心结论：

> Kubernetes 只负责通知容器该退出，并给它一段退出时间；Node.js 应用自己负责停止接新任务、等待旧任务完成、最后退出进程。

## 2. Kubernetes 删除 Pod 时发生了什么

当执行 `kubectl delete pod`，或者 Deployment 滚动发布需要替换旧 Pod 时，整体流程如下：

```text
1. Pod 被标记为 Terminating
2. Kubernetes 开始把 Pod 从 Service endpoints 中摘除
3. kubelet 向容器主进程发送 SIGTERM
4. Node.js 触发 process.on('SIGTERM') 回调
5. 应用进入 draining 状态
6. 应用停止接收新请求或新任务
7. 应用等待正在执行的任务完成
8. 应用关闭 HTTP server、Redis、DB 等资源
9. 应用调用 process.exit(0)
10. 容器退出，Pod 删除完成
```

如果 Node.js 在 `terminationGracePeriodSeconds` 时间内没有退出，Kubernetes 会发送 `SIGKILL` 强制终止容器。`SIGKILL` 无法被 Node.js 捕获，也无法做清理工作。

## 3. SIGTERM 与 Node.js 的关系

Kubernetes 删除 Pod 时，会向容器主进程发送 `SIGTERM`。

Node.js 可以监听这个信号：

```js
process.on('SIGTERM', async () => {
  // graceful shutdown logic
});
```

需要注意：

- 如果没有注册 `SIGTERM` handler，Node.js 默认会退出。
- 如果注册了 `SIGTERM` handler，默认退出行为会被移除。
- 因此 handler 执行完后，需要自己关闭资源并调用 `process.exit(0)`。

如果不调用 `process.exit(0)`，Node.js 也可能自然退出，但前提是事件循环里已经没有活跃资源。下面这些资源会让 Node.js 继续存活：

- HTTP server 仍在 listen。
- Redis 或数据库连接还开着。
- Queue consumer 仍在监听。
- `setInterval` 仍在运行。
- socket 连接未关闭。

生产环境建议在所有清理完成后显式调用：

```js
process.exit(0);
```

## 4. 容器怎么知道 Node.js 还有任务

容器不知道 Node.js 有没有任务，Kubernetes 也不知道。

“还有任务”这个状态必须由应用代码自己维护。

常见做法是维护一个 `activeJobs` 集合：

```js
let acceptingJobs = true;
let shuttingDown = false;
const activeJobs = new Set();

async function handleJob(job) {
  const promise = runJob(job)
    .finally(() => {
      activeJobs.delete(promise);
    });

  activeJobs.add(promise);
  return promise;
}
```

收到 `SIGTERM` 后：

```js
process.on('SIGTERM', async () => {
  shuttingDown = true;
  acceptingJobs = false;

  await Promise.allSettled([...activeJobs]);

  process.exit(0);
});
```

职责划分：

```text
Kubernetes:
  - 发 SIGTERM
  - 等待 grace period
  - 必要时 SIGKILL

Node.js:
  - 记录 activeJobs
  - 停止接新任务
  - 等当前任务完成
  - 关闭资源
  - process.exit(0)
```

## 5. healthz 与 readyz

### 5.1 `/healthz`

`/healthz` 表示：

```text
我还活着吗？
```

通常用于 Kubernetes `livenessProbe`。

如果 `/healthz` 失败，Kubernetes 认为容器不健康，可能会重启容器。

适合检查：

- Node.js 进程是否存活。
- 服务是否进入不可恢复状态。

不建议在 `/healthz` 里检查数据库、Redis、第三方 API。否则外部依赖短暂抖动时，Kubernetes 可能把所有 Pod 都重启，导致故障扩大。

### 5.2 `/readyz`

`/readyz` 表示：

```text
我现在能不能接流量？
```

通常用于 Kubernetes `readinessProbe`。

如果 `/readyz` 返回失败，Kubernetes 会把这个 Pod 从 Service 后端摘掉，不再把新流量转给它，但不会重启它。

它适合表达：

- 服务是否初始化完成。
- 连接池是否准备好。
- 配置是否加载完成。
- 当前是否正在 draining。

示例：

```js
app.get('/readyz', (req, res) => {
  if (shuttingDown || !acceptingJobs) {
    return res.status(503).json({ ready: false });
  }

  res.json({ ready: true });
});
```

一句话记忆：

```text
healthz 管“要不要重启我”
readyz 管“要不要给我流量”
```

## 6. 如果没有 readyz 会怎样

如果没有 `readinessProbe`，Kubernetes 通常不知道应用业务上已经不能接流量。

它只能看到：

```text
Pod 还在 Running
容器进程还活着
Service 仍然能选中这个 Pod
```

这样可能发生：

```text
Pod 已经收到 SIGTERM
Node.js 已经准备 draining
但 Kubernetes / Service 还不知道
新请求仍然可能进入旧 Pod
```

因此，优雅发布场景下，`readyz` 基本是标配。

如果没有 readyz，只能依赖 Pod 删除状态、Ingress/LB 的连接排空能力，或者 `preStop sleep` 这类兜底方式。但这些方式都不知道应用内部是否真的能接流量。

## 7. preStop 的作用

`preStop` 是容器生命周期钩子。在 Pod 终止时，Kubernetes 会先执行 `preStop`，然后发送 `SIGTERM`。

示例：

```yaml
lifecycle:
  preStop:
    httpGet:
      path: /internal/drain
      port: 3000
```

`/internal/drain` 可以让应用提前进入 draining：

```js
app.post('/internal/drain', (req, res) => {
  acceptingJobs = false;
  shuttingDown = true;
  res.status(202).json({ draining: true });
});
```

建议：

- 核心退出逻辑放在 `SIGTERM` handler 中。
- `preStop` 只作为提前 draining 的辅助。
- 不要在 `preStop` 中长时间等待任务完成，因为 `preStop` 执行时间也计入 `terminationGracePeriodSeconds`。

## 8. Node.js 示例流程

一个简化的 HTTP + Worker 模型：

```js
let acceptingJobs = true;
let shuttingDown = false;
const activeJobs = new Set();

app.post('/jobs', async (req, res) => {
  if (!acceptingJobs || shuttingDown) {
    return res.status(503).json({ error: 'draining' });
  }

  const jobPromise = runJob(req.body)
    .finally(() => activeJobs.delete(jobPromise));

  activeJobs.add(jobPromise);

  res.status(202).json({ accepted: true });
});

app.get('/readyz', (req, res) => {
  if (shuttingDown || !acceptingJobs) {
    return res.status(503).json({ ready: false });
  }

  res.json({ ready: true });
});

process.on('SIGTERM', async () => {
  shuttingDown = true;
  acceptingJobs = false;

  await Promise.allSettled([...activeJobs]);

  await closeHttpServer();
  await closeRedis();
  await closeDatabase();

  process.exit(0);
});
```

关键点：

- `acceptingJobs = false`：停止接收新任务。
- `/readyz` 返回 503：告诉 Kubernetes 不要再给我流量。
- `activeJobs`：记录正在执行的任务。
- `Promise.allSettled([...activeJobs])`：等待当前任务完成。
- `process.exit(0)`：正常退出进程。

## 9. Kubernetes Deployment 配置示例

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-worker
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: my-worker
  template:
    metadata:
      labels:
        app: my-worker
    spec:
      terminationGracePeriodSeconds: 900
      containers:
        - name: worker
          image: my-worker:v2
          ports:
            - containerPort: 3000
          readinessProbe:
            httpGet:
              path: /readyz
              port: 3000
            periodSeconds: 2
            failureThreshold: 1
          livenessProbe:
            httpGet:
              path: /healthz
              port: 3000
            periodSeconds: 10
```

配置说明：

- `maxUnavailable: 0`：滚动发布时不要减少可用实例。
- `maxSurge: 1`：允许多启动一个新 Pod。
- `terminationGracePeriodSeconds: 900`：给旧 Pod 最多 15 分钟完成任务。
- `readinessProbe`：控制是否接收新流量。
- `livenessProbe`：控制是否需要重启容器。

## 10. Worker 与队列的生产建议

如果任务比较重要，不建议只放在 Web 进程内存中。

更推荐的架构：

```text
Web/API 服务:
  - 接收请求
  - 写入任务队列
  - 快速返回

Worker 服务:
  - 从队列领取任务
  - 执行任务
  - 成功后 ack

Queue:
  - Redis / BullMQ
  - RabbitMQ
  - Kafka
  - SQS
  - 数据库任务表
```

重要原则：

- 不要任务一开始就 ack。
- 应该任务成功后再 ack。
- 任务需要尽量幂等。
- Worker 被强杀后，任务应能被其他 Worker 重新领取。

如果使用 BullMQ，可以直接使用：

```js
await worker.close();
```

它会：

- 标记 Worker 正在关闭。
- 停止领取新 job。
- 等待当前 job 完成或失败。

## 11. 最终记忆版

```text
Kubernetes 不知道 Node.js 有没有任务。
Node.js 自己维护 activeJobs。

Kubernetes 删除 Pod 时发 SIGTERM。
Node.js 收到 SIGTERM 后进入 draining。

draining 期间：
  - /readyz 返回 503
  - /jobs 返回 503
  - Worker 停止拉新任务
  - activeJobs 继续执行

activeJobs 清空后：
  - 关闭 HTTP/Redis/DB
  - process.exit(0)

如果超过 terminationGracePeriodSeconds：
  - Kubernetes 发 SIGKILL
  - Node.js 无法再清理
```

一句话总结：

> Kubernetes 负责“通知退场”和“停止路由流量”；Node.js 负责“停止接新任务、等旧任务完成、自己退出”。

