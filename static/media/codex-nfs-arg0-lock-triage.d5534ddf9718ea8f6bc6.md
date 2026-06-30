# Codex /root/.codex 共享目录、arg0 与 NFS 锁问题排查经验

## 适用场景

这份文档记录一次 Workflow 容器内 Codex 执行失败的完整排查思路。

典型现象是游戏生成或修改过程中，Codex 明明已经进入执行阶段，但日志里出现：

```text
Failed to create unified exec process: No such file or directory
apply_patch verification failed: Failed to read file to update ...
```

用户侧表现通常是：

- 游戏设计、素材生成、封面生成等前置步骤可能完成。
- 到 `index.html`、`js/game.js`、`.gdd/*` 等文件写入阶段失败。
- 最终回复会说“当前执行环境无法继续写入工作区”。
- 同一个问题不是每次必现，多个 Workflow pod 并发时更容易出现。

这类问题不要一上来就改业务代码。正确思路是先判断失败发生在哪一层：

1. Codex 模型是否正常返回。
2. Codex 工具调用是否正常创建进程。
3. `exec_command` / `apply_patch` 是否能启动。
4. 被写的 `.games/<gameId>` 目录是否真实存在。
5. `/root/.codex` 共享目录是否被多个 pod 互相干扰。
6. NFS 锁是否跨 pod、跨节点生效。

## 一句话结论

本次根因是：多个 Workflow pod 共享 `/root/.codex`，而 `/root/.codex/tmp/arg0` 里存放的是 Codex CLI 当前进程需要使用的临时 helper 程序。旧挂载是 NFSv3 + `nolock` + `local_lock=all`，锁只在本节点生效，不在跨节点 pod 之间生效。于是某个 pod 的 Codex 进程还活着时，另一个节点上的 Codex janitor 可能误认为它的 `arg0` 目录已经没人用，然后清理掉，导致当前进程后续创建 `unified exec` 或 `apply_patch` helper 时找不到文件。

修复后挂载变成 NFSv4 + `local_lock=none`，跨节点 `flock` 测试会被正确阻塞，三 pod 并发长 session 读写测试也通过。

## 概念速通

### Codex SDK、Codex CLI、工具调用是什么关系

可以把它理解成三层：

```text
业务 Workflow Node 代码
  -> @openai/codex-sdk
    -> codex CLI
      -> exec_command / apply_patch / unified exec 等工具 helper
```

- Workflow 代码里一般是 `new Codex(...)`，这是 SDK 层。
- SDK 底层会启动 `codex exec ...`，这是 CLI 层。
- CLI 收到模型的工具调用后，会再启动具体工具 helper，比如 shell 命令执行、补丁应用等。

如果模型返回正常，但工具 helper 文件被删了，就会出现类似：

```text
Failed to create unified exec process: No such file or directory
```

这里不是说 `/bin/bash` 一定不存在，也不一定是 `.games/<gameId>` 不存在，而是 Codex 内部启动工具进程所需的 helper 路径可能已经不存在。

### unified exec 是什么

`unified exec` 可以理解成 Codex 内部统一封装的“执行命令工具”。模型想跑：

```sh
pwd
ls -la
cat js/game.js
```

不是直接由 Node SDK 自己跑，而是通过 Codex CLI 的工具执行体系创建一个受控进程。这个受控进程会处理：

- 工作目录。
- 沙箱权限。
- 输出截断。
- 超时。
- 审批策略。
- 命令结果回传到 session jsonl。

所以 `unified exec process` 创建失败，说明 Codex 工具执行链路在创建受控进程时失败了。

### CODEX_HOME 是什么

`CODEX_HOME` 是 Codex 的家目录，默认通常是：

```text
/root/.codex
```

它里面会保存：

- `sessions/`：每次 Codex 对话 / thread 的 jsonl 历史。
- `auth.json` 等认证状态。
- `tmp/`：Codex CLI 运行时临时文件。
- `tmp/arg0/`：Codex CLI 为当前进程创建的 helper 程序目录。

共享 `/root/.codex` 的好处是：容器重启后还能复用 session 和登录状态。

风险是：`tmp/arg0` 其实是“运行时临时目录”，它不适合在锁不可靠的多 pod / 多节点 NFS 上共享。

### arg0 是什么

Codex CLI 启动时，会在：

```text
/root/.codex/tmp/arg0
```

下面创建类似这样的目录：

```text
codex-arg0YqWJgm/
  .lock
  apply_patch
  codex-linux-sandbox
  ...
```

这些文件是 Codex 当前进程执行工具时需要用的 helper。你可以把它理解成：

```text
当前 Codex 进程的临时工具箱
```

如果这个工具箱被删了，后续工具调用就可能失败。

### arg0 的创建和清理规则

从 Codex CLI 源码逻辑看，规则大致是：

1. CLI 启动时进入 `CODEX_HOME/tmp/arg0`。
2. 创建一个 `codex-arg0xxxxxx` 目录。
3. 在目录里创建 `.lock`。
4. 当前进程持有 `.lock`。
5. 把 `apply_patch`、sandbox helper 等工具文件放进去。
6. janitor 扫描 `CODEX_HOME/tmp/arg0` 下的旧目录。
7. 如果某个目录的 `.lock` 可以被 `try_lock` 成功拿到，就认为这个目录没人用了，可以清理。
8. 如果 `.lock` 正被别的进程持有，就跳过。

关键点：janitor 判断目录能不能删，主要靠“锁能不能拿到”，不是靠业务 gameId，也不是靠 threadId。

所以一旦 NFS 锁不是全局的，就会发生误判：

```text
Pod A 在节点 1 持有 /root/.codex/tmp/arg0/codex-arg0AAA/.lock
Pod B 在节点 2 因为锁不跨节点生效，也能拿到同一把 lock
Pod B 误以为 codex-arg0AAA 已经没人用
Pod B 删除 codex-arg0AAA
Pod A 后续再执行工具，helper 文件没了
Pod A 报 Failed to create unified exec process: No such file or directory
```

## 第一阶段：从现象提出猜测

### 看到的日志

典型日志片段：

```text
exec_command failed for /bin/bash -lc pwd:
CreateProcess { message: "Rejected(\"Failed to create unified exec process: No such file or directory\")" }
```

还有：

```text
apply_patch verification failed: Failed to read file to update /scripts/.games/<gameId>/index.html
```

### 第一批猜测

排查时不要只押一个原因，先列候选：

| 猜测 | 解释 | 怎么验证 |
| --- | --- | --- |
| `.games/<gameId>` 目录不存在 | 工作区没准备好，写文件自然失败 | 容器内 `ls /scripts/.games/<gameId>` |
| Codex 没有写权限 | 沙箱是 read-only，`apply_patch` 会被拒 | 看 jsonl 的 `sandbox_policy` |
| `remove_chroma_key` 等脚本没打进镜像 | 工具文件缺失导致某步失败 | 容器内 `ls /scripts/...` |
| subagent 没有 `exec_command` 权限 | multi-agent 的子 agent 工具集不同 | 最小 multi-agent 脚本验证 |
| Codex helper 被删 | `arg0` 运行时目录被其他 pod 清理 | 查 `/root/.codex/tmp/arg0` 和 NFS 锁 |
| NFS 锁不跨节点生效 | 不同 pod 同时拿到同一把锁 | 跨 pod `flock` 测试 |

本次最终被证实的是：旧 NFS 锁不跨节点生效，导致 arg0 目录可能被误清理。

## 第二阶段：验证猜测

### 1. 先看 `/root/.codex` 挂载参数

在任意 Workflow pod 中执行：

```sh
mount | grep ' /root/.codex '
```

旧的坏状态类似：

```text
/root/.codex type nfs
vers=3
nolock
local_lock=all
```

这个组合的含义：

- `vers=3`：NFSv3。
- `nolock`：禁用 NFS 网络锁。
- `local_lock=all`：锁只在本机客户端内生效。

坏状态下，同一节点上的两个 pod 会互斥，但不同节点上的两个 pod 可能同时拿到同一把锁。

修复后的状态类似：

```text
/root/.codex type nfs4
vers=4.0
local_lock=none
```

这个组合更符合预期：

- `nfs4` / `vers=4.0`：NFSv4 把锁协议合进 NFS 协议里。
- `local_lock=none`：不要把锁本地化，交给 NFS 服务端协调。

### 2. 最小锁测试：证明锁是否跨 pod 生效

这个测试的目标很简单：

1. Pod A 拿住同一把锁 60 秒。
2. Pod B 在 Pod A 持锁期间尝试抢锁。
3. 如果 Pod B 抢不到，输出 `BLOCKED`，说明锁全局生效。
4. 如果 Pod B 抢到了，输出 `ACQUIRED`，说明锁坏了。

#### 先选择两个不同节点的 pod

```sh
NS=binkbink
kubectl -n "$NS" get pod -o wide | grep ai-game-forge-workflow
```

假设选到：

```text
POD_A=ai-game-forge-workflow-xxx-a
POD_B=ai-game-forge-workflow-xxx-b
```

确保它们在不同 `NODE` 上。

#### Pod A 持锁

打开第一个终端执行：

```sh
NS=binkbink
POD_A=ai-game-forge-workflow-xxx-a

kubectl -n "$NS" exec "$POD_A" -- sh -lc '
mkdir -p /root/.codex/tmp/lock-proof
flock -x /root/.codex/tmp/lock-proof/global.lock sh -c "
  echo POD_A_LOCK_ACQUIRED
  date +%s
  sleep 60
  echo POD_A_LOCK_RELEASED
  date +%s
"
'
```

#### Pod B 抢同一把锁

在 Pod A 还没释放时，打开第二个终端执行：

```sh
NS=binkbink
POD_B=ai-game-forge-workflow-xxx-b

kubectl -n "$NS" exec "$POD_B" -- sh -lc '
if flock -n -x /root/.codex/tmp/lock-proof/global.lock sh -c "echo POD_B_LOCK_ACQUIRED; date +%s"; then
  echo POD_B_RESULT=ACQUIRED
else
  echo POD_B_RESULT=BLOCKED
fi
'
```

#### 判断结果

好结果：

```text
POD_B_RESULT=BLOCKED
```

坏结果：

```text
POD_B_RESULT=ACQUIRED
```

坏结果说明跨节点锁没有全局生效，Codex `arg0` janitor 仍然可能误删别的 pod 正在使用的目录。

#### 清理

```sh
NS=binkbink
POD_A=ai-game-forge-workflow-xxx-a

kubectl -n "$NS" exec "$POD_A" -- sh -lc '
rm -rf /root/.codex/tmp/lock-proof
test ! -e /root/.codex/tmp/lock-proof && echo CLEANUP_OK
'
```

### 3. 三 pod 并发长 session 复现 / 验证

锁测试只能证明 NFS 锁本身是否生效。还需要跑接近 Workflow 的场景：

- 三个 pod 同时 `new Codex`。
- 每个 pod 各自使用一个 mock gameId。
- 每个 Codex thread 连续跑多轮。
- 每轮先 `exec_command` 读文件，再 `apply_patch` 写文件，再 `exec_command` 验证。
- 最后统计 session jsonl 中是否出现 `unified exec noent` 和 `apply_patch read noent`。

下面脚本是最小可执行 demo。它会在容器内创建 mock `.games/<gameId>`，跑完后你要删除 mock 目录。

#### 容器内脚本：`/scripts/tmp/verify-codex-long-session.mjs`

在每个 pod 内写入：

```sh
mkdir -p /scripts/tmp
cat > /scripts/tmp/verify-codex-long-session.mjs <<'EOF'
import { Codex } from "@openai/codex-sdk";
import fs from "node:fs";
import path from "node:path";

const gameId = process.argv[2] ?? "991850";
const turns = Number(process.argv[3] ?? "6");
const startedAtMs = Date.now();
const podName = process.env.HOSTNAME ?? "unknown-pod";
const workspace = `/scripts/.games/${gameId}`;
const wrapperPath = `/scripts/tmp/codex-long-session-wrapper-${gameId}.mjs`;
const realCodexBin =
  "/scripts/node_modules/.pnpm/@openai+codex@0.142.0-linux-x64/node_modules/@openai/codex/vendor/x86_64-unknown-linux-musl/bin/codex";

function writeWrapper() {
  const wrapper = [
    "#!/usr/bin/env node",
    "import { spawn } from 'node:child_process';",
    "const args = process.argv.slice(2);",
    "if (args[0] === 'exec') {",
    "  if (!args.includes('--ignore-user-config')) args.splice(1, 0, '--ignore-user-config');",
    "  if (!args.includes('--skip-git-repo-check')) args.splice(1, 0, '--skip-git-repo-check');",
    "  if (!args.includes('--sandbox')) args.splice(1, 0, '--sandbox', 'workspace-write');",
    "}",
    `const child = spawn(${JSON.stringify(realCodexBin)}, args, { stdio: 'inherit', env: process.env });`,
    "child.on('exit', (code, signal) => {",
    "  if (signal) process.kill(process.pid, signal);",
    "  else process.exit(code ?? 1);",
    "});",
    "",
  ].join("\n");
  fs.writeFileSync(wrapperPath, wrapper);
  fs.chmodSync(wrapperPath, 0o755);
}

function prepareWorkspace() {
  fs.rmSync(workspace, { recursive: true, force: true });
  fs.mkdirSync(path.join(workspace, "js"), { recursive: true });
  fs.mkdirSync(path.join(workspace, ".gdd"), { recursive: true });
  fs.writeFileSync(
    path.join(workspace, "js", "game.js"),
    [
      "export const diagnosticGameId = " + JSON.stringify(gameId) + ";",
      "export const diagnosticPod = " + JSON.stringify(podName) + ";",
      "export function currentTurn() {",
      "  return 0;",
      "}",
      "// TURN_MARKER: 0",
      "",
    ].join("\n")
  );
  fs.writeFileSync(path.join(workspace, ".gdd", "long-session-log.jsonl"), "");
}

function fileContains(filePath, text) {
  try {
    return fs.readFileSync(filePath, "utf8").includes(text);
  } catch {
    return false;
  }
}

function walk(dir, out = []) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".jsonl")) out.push(full);
  }
  return out;
}

function summarizeJsonl() {
  const files = walk("/root/.codex/sessions");
  const relevant = [];
  for (const file of files) {
    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      continue;
    }
    if (stat.mtimeMs + 5000 < startedAtMs) continue;
    let text = "";
    try {
      text = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    if (!text.includes(`/scripts/.games/${gameId}`) && !text.includes(String(gameId))) continue;
    relevant.push({ file, text });
  }

  const joined = relevant.map((item) => item.text).join("\n");
  const count = (needle) => joined.split(needle).length - 1;
  return {
    files: relevant.map((item) => item.file),
    unifiedNoent: count("Failed to create unified exec process: No such file or directory"),
    applyPatchReadNoent: count("apply_patch verification failed: Failed to read file to update"),
    patchApplyEnd: count("patch_apply_end"),
    patchToolSuccess: count("Success. Updated the following files"),
    noSuchFile: count("No such file or directory"),
  };
}

writeWrapper();
prepareWorkspace();

const codex = new Codex({
  codexPathOverride: wrapperPath,
  config: {
    sandbox_mode: "workspace-write",
    history: { persistence: "save-all" },
    sandbox_workspace_write: { network_access: false },
    features: { plugins: false, multi_agent: false },
    developer_instructions:
      "You are a diagnostic agent. Do exactly what the user asks. Use shell commands to verify files before and after edits. Keep final replies short.",
  },
});

const thread = codex.startThread({ cwd: workspace });
const failures = [];

console.log(`POD=${podName}`);
console.log(`GAME_ID=${gameId}`);
console.log(`WORKSPACE=${workspace}`);
console.log(`TURNS=${turns}`);

for (let turn = 1; turn <= turns; turn += 1) {
  const prompt = [
    `Diagnostic long-session turn ${turn} for game ${gameId}.`,
    "First run a shell command that prints EXEC_BEFORE_OK, pwd, and the current js/game.js marker.",
    `Then edit js/game.js so currentTurn() returns ${turn} and the marker line becomes // TURN_MARKER: ${turn}.`,
    `Also append one JSON line to .gdd/long-session-log.jsonl with {"turn":${turn},"gameId":"${gameId}","pod":"${podName}"}.`,
    "Finally run a shell command that prints EXEC_AFTER_OK and verifies both files contain this turn.",
    "Reply with exactly TURN_DONE_" + turn + " after verification.",
  ].join("\n");

  try {
    const result = await thread.run(prompt);
    const gameOk =
      fileContains(path.join(workspace, "js", "game.js"), `// TURN_MARKER: ${turn}`) &&
      fileContains(path.join(workspace, "js", "game.js"), `return ${turn};`);
    const logOk = fileContains(path.join(workspace, ".gdd", "long-session-log.jsonl"), `"turn":${turn}`);
    const ok = gameOk && logOk;
    if (!ok) failures.push({ turn, reason: "file_evidence_failed", gameOk, logOk });
    console.log(
      `TURN_RESULT turn=${turn} ok=${ok} gameOk=${gameOk} logOk=${logOk} threadId=${thread.id ?? "null"} result=${JSON.stringify(result).slice(0, 160)}`
    );
  } catch (error) {
    failures.push({ turn, reason: "thread_run_error", message: String(error?.stack ?? error) });
    console.log(`TURN_ERROR turn=${turn} message=${JSON.stringify(String(error?.stack ?? error)).slice(0, 800)}`);
  }
}

const summary = summarizeJsonl();
console.log("=== JSONL_SUMMARY ===");
console.log(JSON.stringify(summary, null, 2));
console.log("=== FILE_FINAL ===");
console.log(fs.readFileSync(path.join(workspace, "js", "game.js"), "utf8"));
console.log("=== VERDICT ===");
console.log(
  JSON.stringify(
    {
      gameId,
      podName,
      turns,
      failures,
      ok: failures.length === 0 && summary.unifiedNoent === 0 && summary.applyPatchReadNoent === 0,
    },
    null,
    2
  )
);

fs.rmSync(wrapperPath, { force: true });
EOF
```

#### 单 pod 先跑一次

```sh
cd /scripts
node /scripts/tmp/verify-codex-long-session.mjs 991881 6
```

好结果类似：

```text
TURN_RESULT turn=1 ok=true gameOk=true logOk=true
...
TURN_RESULT turn=6 ok=true gameOk=true logOk=true

=== JSONL_SUMMARY ===
{
  "unifiedNoent": 0,
  "applyPatchReadNoent": 0,
  "patchApplyEnd": 6
}

=== VERDICT ===
{
  "failures": [],
  "ok": true
}
```

#### 三 pod 并发跑

准备三个 pod：

```sh
NS=binkbink
POD1=ai-game-forge-workflow-xxx-a
POD2=ai-game-forge-workflow-xxx-b
POD3=ai-game-forge-workflow-xxx-c
```

分别复制脚本到三个 pod：

```sh
kubectl -n "$NS" exec "$POD1" -- mkdir -p /scripts/tmp
kubectl -n "$NS" exec "$POD2" -- mkdir -p /scripts/tmp
kubectl -n "$NS" exec "$POD3" -- mkdir -p /scripts/tmp

kubectl -n "$NS" cp /tmp/verify-codex-long-session.mjs "$POD1":/scripts/tmp/verify-codex-long-session.mjs
kubectl -n "$NS" cp /tmp/verify-codex-long-session.mjs "$POD2":/scripts/tmp/verify-codex-long-session.mjs
kubectl -n "$NS" cp /tmp/verify-codex-long-session.mjs "$POD3":/scripts/tmp/verify-codex-long-session.mjs
```

并发启动：

```sh
kubectl -n "$NS" exec "$POD1" -- sh -lc 'cd /scripts && timeout 1500 node /scripts/tmp/verify-codex-long-session.mjs 991881 6' > pod1.log 2>&1 &
kubectl -n "$NS" exec "$POD2" -- sh -lc 'cd /scripts && timeout 1500 node /scripts/tmp/verify-codex-long-session.mjs 991882 6' > pod2.log 2>&1 &
kubectl -n "$NS" exec "$POD3" -- sh -lc 'cd /scripts && timeout 1500 node /scripts/tmp/verify-codex-long-session.mjs 991883 6' > pod3.log 2>&1 &
wait
```

检查结果：

```sh
grep -E 'TURN_RESULT|unifiedNoent|applyPatchReadNoent|"ok":|failures' pod1.log pod2.log pod3.log
```

好结果：

```text
unifiedNoent: 0
applyPatchReadNoent: 0
failures: []
ok: true
```

坏结果：

```text
unifiedNoent > 0
applyPatchReadNoent > 0
ok: false
```

#### 清理

```sh
kubectl -n "$NS" exec "$POD1" -- sh -lc 'rm -f /scripts/tmp/verify-codex-long-session.mjs /scripts/tmp/codex-long-session-wrapper-991881.mjs; rm -rf /scripts/.games/991881'
kubectl -n "$NS" exec "$POD2" -- sh -lc 'rm -f /scripts/tmp/verify-codex-long-session.mjs /scripts/tmp/codex-long-session-wrapper-991882.mjs; rm -rf /scripts/.games/991882'
kubectl -n "$NS" exec "$POD3" -- sh -lc 'rm -f /scripts/tmp/verify-codex-long-session.mjs /scripts/tmp/codex-long-session-wrapper-991883.mjs; rm -rf /scripts/.games/991883'
```

## 第三阶段：如何排查 arg0

### 1. 找到 arg0 目录

在容器里执行：

```sh
ls -la /root/.codex/tmp/arg0
```

你可能看到：

```text
codex-arg0YqWJgm
codex-arg0Hn1TC1
codex-arg05BH0WM
```

进入其中一个目录：

```sh
find /root/.codex/tmp/arg0 -maxdepth 2 -type f -o -type d | sort | head -n 100
```

正常运行中的 arg0 目录应至少有 `.lock` 和若干 helper 文件。异常时可能出现：

- 目录还在，但 helper 文件不见了。
- `.lock` 不见了。
- jsonl 里记录的 helper 路径已经不存在。
- 进程还在，但 `arg0` 目录被清理。

### 2. 找 Codex session jsonl

Codex session 通常在：

```text
/root/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl
```

查看最近 session：

```sh
ls -ltr /root/.codex/sessions/$(date +%Y)/$(date +%m)/$(date +%d) | tail -n 20
```

搜索关键错误：

```sh
grep -R "Failed to create unified exec process" /root/.codex/sessions/$(date +%Y)/$(date +%m)/$(date +%d) | tail -n 20
grep -R "apply_patch verification failed" /root/.codex/sessions/$(date +%Y)/$(date +%m)/$(date +%d) | tail -n 20
grep -R "patch_apply_end" /root/.codex/sessions/$(date +%Y)/$(date +%m)/$(date +%d) | tail -n 20
```

重点看：

- `turn_context.cwd`：Codex 以哪个目录为工作目录。
- `sandbox_policy`：是不是 `read-only`，如果是，写入失败是权限配置问题，不是 NFS 问题。
- `function_call`：模型要求执行什么命令。
- `function_call_output`：命令是否真的执行。
- `custom_tool_call` / `apply_patch`：是否发起补丁。
- `custom_tool_call_output`：补丁成功还是被拒绝。

### 3. 区分 read-only 与 arg0 失败

read-only 失败通常会有：

```text
patch rejected: writing is blocked by read-only sandbox
```

这不是 NFS 锁问题，是 Codex 沙箱配置问题。需要检查 SDK 配置中是否有：

```js
config: {
  sandbox_mode: "workspace-write",
  sandbox_workspace_write: { network_access: false }
}
```

arg0 / helper 失败通常会有：

```text
Failed to create unified exec process: No such file or directory
```

同时可能看到：

```text
apply_patch verification failed: Failed to read file to update ...
```

如果 `.games/<gameId>` 确实存在，沙箱也是 workspace-write，就要重点查 arg0 和 NFS 锁。

## 第四阶段：锁的工作原理

### 文件锁是什么

文件锁就是多个进程之间约定：

```text
谁先拿到这把锁，谁就可以操作某个共享资源。
别人看到锁被占用，就必须等或放弃。
```

在本问题里，共享资源是：

```text
/root/.codex/tmp/arg0/codex-arg0xxxxxx
```

Codex janitor 的逻辑是：

```text
如果我能拿到某个 arg0 目录的 .lock，说明没人用，可以删。
如果拿不到，说明有人用，不能删。
```

所以锁必须是“全局正确”的。只在单机正确不够，因为 Workflow 有多个 pod，pod 可能分布在不同节点。

### `flock` 是什么

`flock` 是 Linux 下常用的文件锁命令。

例子：

```sh
flock -x /tmp/demo.lock sh -c 'echo locked; sleep 10'
```

意思是：

- `-x`：加排他锁。
- `/tmp/demo.lock`：锁文件。
- 后面的 `sh -c ...`：拿到锁后执行的命令。

非阻塞抢锁：

```sh
flock -n -x /tmp/demo.lock sh -c 'echo got lock'
```

- 如果锁空闲，马上执行并返回 0。
- 如果锁被占用，马上失败，不等待。

### NFSv3 / NFSv4 / nolock / local_lock 解释

| 参数 | 白话解释 | 对本问题的影响 |
| --- | --- | --- |
| `vers=3` | 使用 NFSv3 | 文件锁依赖额外的 lockd/statd 服务 |
| `vers=4.0` | 使用 NFSv4 | 锁协议集成在 NFSv4 中，更适合跨节点锁 |
| `nolock` | 不使用网络锁 | 跨节点锁基本不可靠 |
| `local_lock=all` | 锁只在本节点本地生效 | 同节点互斥，跨节点可能同时拿锁 |
| `local_lock=none` | 不本地化锁，交给服务端协调 | 跨节点锁应当生效 |

坏组合：

```text
vers=3,nolock,local_lock=all
```

好组合：

```text
type nfs4,vers=4.0,local_lock=none
```

### 为什么同节点会阻塞，跨节点却不阻塞

旧挂载中 `local_lock=all` 的意思是：锁在每个节点本地维护。

可以这样理解：

```text
节点 A 有一本锁登记簿
节点 B 也有一本锁登记簿
```

Pod A 在节点 A 登记“我拿了 global.lock”。

Pod C 也在节点 A，它看同一本登记簿，所以知道锁被占用，会阻塞。

Pod B 在节点 B，它看的是节点 B 自己的登记簿，不知道节点 A 已经有人拿锁，于是也能拿到。

这就是为什么之前测试会出现：

```text
same node: BLOCKED
cross node: ACQUIRED
```

这就是锁不全局。

### 修复后应该看到什么

修复后，不管 Pod B 和 Pod A 是否在同一个节点，只要抢同一把 NFS 锁，都应该：

```text
POD_B_RESULT=BLOCKED
```

Pod A 释放后，Pod B 再抢应该：

```text
POD_B_AFTER_RELEASE=ACQUIRED
```

这才说明锁既能阻塞，也能释放后恢复。

## 第五阶段：推荐修复方案

### 方案 A：保留 `/root/.codex` 共享，但让 `/root/.codex/tmp` 变成本地目录

这是最稳的短期方案。

思路：

```text
/root/.codex              继续挂 NAS，共享 sessions/auth
/root/.codex/tmp          用 emptyDir，pod 本地独立
/root/.codex/tmp/arg0     不再跨 pod 共享
```

Kubernetes 示例：

```yaml
volumeMounts:
  - name: athena-binkbink-filenas
    mountPath: /root/.codex
    subPath: root/.codex
  - name: codex-tmp
    mountPath: /root/.codex/tmp

volumes:
  - name: athena-binkbink-filenas
    persistentVolumeClaim:
      claimName: athena-binkbink-filenas
  - name: codex-tmp
    emptyDir: {}
```

优点：

- session 和 auth 仍然共享。
- arg0 临时 helper 不再互相影响。
- 不依赖 NAS 锁是否完美。

缺点：

- `/root/.codex/tmp` 内的临时文件不会跨 pod 保留。通常这是可以接受的，因为 tmp 本来就不该持久化。

### 方案 B：把 NAS 改成 NFSv4 + `local_lock=none`

这是本次运维修改后的方向。

验证标准：

```text
/root/.codex type nfs4
vers=4.0
local_lock=none
```

然后必须通过跨 pod `flock` 测试和三 pod 长 session 测试。

### 方案 C：NFSv3 去掉 `nolock`，确保 lockd/statd 正常

如果只能用 NFSv3，需要：

- 不使用 `nolock`。
- 不使用 `local_lock=all`。
- 确认客户端和服务端的 `rpcbind`、`rpc.statd`、`lockd/nlockmgr` 正常。
- 网络 / 安全组开放 RPC 相关端口。

检查命令：

```sh
rpcinfo -p localhost
rpcinfo -p <nfs-server-ip>
```

需要能看到类似：

```text
nfs
mountd
status
nlockmgr
```

不过 NFSv3 锁链路更复杂，生产上更推荐 NFSv4 或把 `/root/.codex/tmp` 改成本地 `emptyDir`。

## 第六阶段：完整排查清单

### 1. 先确认是不是写权限问题

看 jsonl：

```sh
grep -R "sandbox_policy" /root/.codex/sessions/$(date +%Y)/$(date +%m)/$(date +%d) | tail -n 5
grep -R "writing is blocked by read-only sandbox" /root/.codex/sessions/$(date +%Y)/$(date +%m)/$(date +%d) | tail -n 5
```

如果是 read-only，先修 Codex 配置：

```js
config: {
  sandbox_mode: "workspace-write",
  sandbox_workspace_write: { network_access: false }
}
```

### 2. 确认 `.games/<gameId>` 目录真实存在

```sh
GAME_ID=1918
ls -la /scripts/.games/$GAME_ID
ls -la /scripts/.games/$GAME_ID/js
```

如果目录不存在，是工作区准备阶段问题，不是 arg0。

### 3. 查 session jsonl 错误

```sh
DAY_DIR=/root/.codex/sessions/$(date +%Y)/$(date +%m)/$(date +%d)

grep -R "Failed to create unified exec process" "$DAY_DIR" | tail -n 20
grep -R "apply_patch verification failed" "$DAY_DIR" | tail -n 20
grep -R "patch_apply_end" "$DAY_DIR" | tail -n 20
```

### 4. 查 `/root/.codex` 挂载参数

```sh
mount | grep ' /root/.codex '
```

重点看：

```text
type nfs / nfs4
vers=3 / vers=4.0
nolock
local_lock=all / local_lock=none
```

### 5. 跑跨 pod 锁测试

一定要选不同节点的 pod：

```sh
kubectl -n binkbink get pod -o wide | grep ai-game-forge-workflow
```

预期：

```text
POD_B_RESULT=BLOCKED
```

### 6. 跑三 pod 并发长 session

预期：

```text
unifiedNoent=0
applyPatchReadNoent=0
failures=[]
ok=true
```

### 7. 清理测试产物

清理容器内：

```sh
rm -f /scripts/tmp/verify-codex-long-session.mjs
rm -f /scripts/tmp/codex-long-session-wrapper-*.mjs
rm -rf /scripts/.games/991881 /scripts/.games/991882 /scripts/.games/991883
rm -rf /root/.codex/tmp/lock-proof
```

## 本次排查证据摘要

旧状态：

```text
/root/.codex type nfs
vers=3
nolock
local_lock=all
```

旧锁测试：

```text
same pod: BLOCKED
same node other pod: BLOCKED
cross node other pod: ACQUIRED
```

这证明锁只在节点本地生效。

修复后：

```text
/root/.codex type nfs4
vers=4.0
local_lock=none
```

修复后锁测试：

```text
POD_A_LOCK_ACQUIRED
POD_B_RESULT=BLOCKED
POD_C_RESULT=BLOCKED
POD_A_LOCK_RELEASED
POD_B_AFTER_RELEASE=ACQUIRED
```

修复后三 pod 并发长 session：

```text
991881: turns=6, failures=[], unifiedNoent=0, applyPatchReadNoent=0, ok=true
991882: turns=6, failures=[], unifiedNoent=0, applyPatchReadNoent=0, ok=true
991883: turns=6, failures=[], unifiedNoent=0, applyPatchReadNoent=0, ok=true
```

## 给初学者的记忆法

把整个问题想成三件事：

```text
Codex 要干活，需要工具箱。
arg0 就是工具箱。
NFS 锁就是工具箱门上的占用牌。
```

旧配置的问题是：

```text
每个节点都有自己的占用牌登记簿。
节点 A 认为工具箱有人用。
节点 B 不知道，于是以为没人用，把工具箱清了。
```

修复后的目标是：

```text
所有节点看同一本占用牌登记簿。
只要有一个 pod 正在用工具箱，其他 pod 都不能把它清掉。
```

排查时不要急着改代码，先问四个问题：

1. 目录在不在？
2. 沙箱能不能写？
3. helper 还在不在？
4. 锁是不是跨节点真的生效？

这四个问题回答清楚，基本就能定位 80% 的 Codex 写入失败问题。
