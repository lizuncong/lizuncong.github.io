# Lauren Tan《All Code Is Slop (Except Mine)》事实核查与实践拆解

> 调研日期：2026-11-13  
> 调研对象：Lauren Tan（poteto）在 AI Engineer Code Summit 2026 的演讲《All Code Is Slop (Except Mine)》  
> 方法：抓取官方直播的自动字幕，按时间戳定位演讲段落；再与 `pstack` 公开仓库、她的 X 长文、会议 speaker bio 交叉核对  
> 结论：**标题是反讽。她的真实主张不是“我的代码不是垃圾”，而是“在 agent 把产量放大几十倍后，用工程环境让代码变得可信任”。**

---

## 0. 结论速览

- 她开场先问观众：有多少人看过别人的代码，心里想过“这都是垃圾”？然后承认“我也一样”，接着说“今天我要说服你，可以把 slop 变成 gold”。
- 她的核心公式是：**结构约束 → 可执行验证 → 才做并行与自动化**。
- 她反复强调：每次纠正 agent，优先把它变成 lint、类型检查、测试或架构约束，而不是再往 `AGENTS.md` 里加一条规则。
- 她给出的结果是“每月 3,000 个 PR 进生产、团队 11,000 个 PR、revert rate 约 0.5%”，但这些目前主要是**演讲中的自报数据**，尚未看到第三方审计。
- 可以独立核验的是：公开演讲、`pstack` 仓库、X 长文、会议 speaker bio，以及仓库里真实存在的 verification、statechart、swarm 等工作流。

---

## 1. 原始出处与身份

### 1.1 演讲

- 标题：`All Code Is Slop (Except Mine)`
- 演讲者：Lauren Tan（poteto）
- 场合：AI Engineer Code Summit 2026
- 官方直播：<https://www.youtube.com/watch?v=ZZ19zhYnDKY>
- 演讲段落：直播 **1:00:20–1:18:35**
- 直接入口：<https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=3620s>

会议现场介绍她为 **SpaceX Super Intelligence（SpaceXSI）的 Principal Engineer**，在 Grok Bot 团队工作。AI Engineer 的 speaker bio 则写她是 **xAI 软件工程师、React Compiler core team 成员**，并提到她创建了 `pstack`：

- <https://ai.engineer/speakers/lauren-tan>

> 不同页面对公司/隶属关系的表述略有差异，但可以确认是同一人：Lauren Tan / poteto。

### 1.2 便于对照的中文字幕版

B 站有第三方搬运的中英双语版，非官方，仅用于对照：

- <https://www.bilibili.com/video/BV1UXWo6iE7i>

---

## 2. 她的核心论点

### 2.1 标题是反讽

她在开场问观众有没有觉得别人的代码“都是垃圾”，然后说自己也有过这种想法。因此标题 `All Code Is Slop (Except Mine)` 更像是对开发者优越感的自嘲，而不是技术判断。

她真正想讲的是：

> “The job of a software engineer ... is figuring out how to maintain or even improve the quality of your code while massively increasing your productivity.”

中文：软件工程师的工作，是在大幅提高生产力的同时，维持甚至提高代码质量。

对应时间点：<https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=3741s>

### 2.2 不是盲信，而是投资 agent 环境

她说自己花了 **6 个月**才做到每月提交数千个 PR，其中很多是在睡觉时完成的。她的原话是：

> “Not blind trust, but investing in your agents environment so you can trust that your agents are going to do the right thing.”

中文：不是盲目信任 agent，而是把它的运行环境建设好，让你有理由相信它会做对的事。

对应时间点：<https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=3774s>

---

## 3. 她具体怎么实践

### 3.1 反金字塔：代码约束优先于提示词

她把 agent 环境分成几层，优先级从高到低：

| 层级 | 内容 | 作用 |
| --- | --- | --- |
| 第一层 | 代码本身：API 设计、架构、重构、lint、类型系统、编译器、测试 | 确定性约束，让 agent 默认做对的事 |
| 第二层 | 运行时验证 + 形式化验证 | 检查真实行为、不变量和用户流程 |
| 第三层 | rules、skills、`AGENTS.md` 等自然语言规则 | 只处理需要判断力、无法结构化的事情 |

对应时间点：<https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=3807s>

她反复强调一句话：

> “Whenever you're correcting your agent, think about how you can make that a deterministic check instead of adding another line to your rules or AGENTS.md.”

中文：每次纠正 agent，优先把它变成确定性检查，而不是再往规则或 `AGENTS.md` 里加一句。

对应时间点：<https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4234s>

这背后的逻辑是：**提示词不可复现，代码检查可复现。**

### 3.2 把代码库当花园：反模式会被 agent 复制

她的比喻是：代码以前一次来几个 PR，现在像连续水流；agent 会模仿代码库里已有的模式。所以废弃代码、workaround、旧反模式会像杂草一样扩散。

对应时间点：<https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=3975s>

她举了几个很具体的例子：

- 他们为 Grok Bot 做了内部客户端框架 **Dune**，可以理解成“Electron 版的 Next.js”，里面编码了大量约束和 lint 规则。
- 在业务代码里**禁止使用 `useEffect`**。不是因为它永远错，而是因为它“需要太多 nuance”，agent 很容易用错；只允许在 Dune API 内部使用。这样问题被“类别性消除”，不用每次 code review 再抓。
  - 对应时间点：<https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4039s>
- 目录强制拆成 `electron/main` 和 `electron/renderer`，两者之间的 import 被依赖图分析器和 lint 禁止，避免 renderer 引入 main 线程代码导致卡顿。
- 她称在 Grok Bot 里**禁掉了 99% 的注释**，因为注释容易过期、不可执行，还会成为 agent “解释自己为什么不按正确方式做”的逃生通道。她还说 Grok Bot 和 Dune 现在用带明确错误信息的 lint 规则，直接告诉 agent 去修根因。
  - 注释禁令：<https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4187s>
  - 带修复指引的 lint：<https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4220s>
- 她还举了 imperative timers（`setTimeout`、`requestAnimationFrame`、`requestIdleCallback`）作为反例：agent 爱用它们快速掩盖 VS Code 命令式架构和 React 声明式架构之间的冲突，结果造成大量 GC 和卡顿。**公开字幕能确认她把这类写法当作反模式，但没有明确说 Grok Bot 用哪条 lint 规则禁用它们。**
  - 对应时间点：<https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4129s>

她的原则是：**如果一个问题能通过更好的 API、架构或 lint 从类别上消除，就不要靠注释和提示词去提醒。**

### 3.3 验证是核心产能，不是收尾动作

她的 code review 已经变成“看验证产物”：视频、截图、图、形式化验证结果。

对应时间点：<https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4264s>

具体做法包括：

- **Runtime verification**：给 agent 一个 Feature Map（从用户视角列出所有功能），再配自定义 CLI 和 Chrome DevTools Protocol，让 agent 能像用户一样操作 App，并留下视频/截图作为证据。
- **形式化验证**：用 **TLA+** 对跨设备通知等关键用户流程做模型检查；用 **Lean** 证明自研虚拟化库不会出现闪烁/抖动。她说这已经抓到了一些 bug，但仍在实验阶段，“不是银弹，只是又一层工具”。
  - 对应时间点：<https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4334s>
- **Property-based UI testing**：他们开始用 Bombadil 这类工具做 UI 属性测试，也已经抓到一些 UI bug。
- 她引用同事 Cindy 的观察：**70% 的日常 token 花在验证上**；她说这和自己的情况一致，自己的大部分 token 也花在验证。

核心判断是：**agent 生成代码已经不再是最难的部分，验证才是瓶颈。** 因此她把验证做成 agent 自己能闭环执行的基础设施。

---

### 3.4 内循环干净后，才做自动化和并行

她的警告很直接：

> “If your inner coding loop produces slop, automating that loop just produces more slop.”

中文：如果内循环本身产出垃圾，自动化只会生产更多垃圾。

对应时间点：<https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4595s>

在基础打好之后，他们才做外层自动化：每次发版，Grok Bot 自动启动一个 Cursor 项目，对整个应用和构建做 fuzz，像真实用户一样使用，发现 bug 后自动开修复 PR，甚至自动合并。

对应时间点：<https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4665s>

这听起来激进，但她的前提是：**代码库、lint、验证和架构已经好到“PR 默认就是好的”**，所以大部分产品代码不再需要深度人工 review。

### 3.5 `pstack` 是把方法产品化的公开证据

`pstack` 不是只停留在 PPT 上，它是一个公开仓库：

- <https://github.com/cursor/plugins/tree/main/pstack>

README 里写得很清楚：

> “If you want to go fast, go deep first.”
>
> “The goal is not to maximize LOC, in fact it's the opposite. pstack helps you write less, but higher quality code.”

仓库里能看到具体实现：

- **23 个 playbook**，覆盖 bug fix、feature、perf、investigation、overnight run 等。
- **24 条原则**，包括：
  - **Encode Lessons in Structure**：把重复纠正变成 lint、check 或 script。
  - **Prove It Works**：验证真实产物，而不是“能编译”。
  - **Fix Root Causes**：先复现和定位，再修改。
  - **Test Behavior, Not Implementation**：测用户可观察的行为。
- `/create-verification-skill`：为项目生成“启动、驱动、观察、清理”的验证 skill 和 Feature Map。
- `/maintain-verification-skill`：每天维护验证 skill，防止它和真实 App 漂移。
- `/swarm`：并行跑多个 agent 做验证或 fuzz。
- `/statechart`：用 TLA+ 检查状态机，并画出用户视角的状态图。

她的 X 长文还写了：`pstack` 让她做到 **每月 2,000 个 PR 进生产**，并把 verification skill 称为“critical infrastructure”，建议每天维护：

- <https://x.com/poteto/status/2094457600259842065>

---

## 4. 她给出的量化结果

以下数字来自演讲中的自报：

| 指标 | 她的说法 | 时间点 |
| --- | --- | --- |
| 个人 PR 量 | 上个月向生产环境提交 **3,000 个 PR** | [1:02:06](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=3726s) |
| 团队 PR 量 | 上个月团队提交 **11,000 个 PR** | [1:14:56](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4496s) |
| 贡献者数量 | 10 月约 **227 人**至少贡献了一个 PR | 同上 |
| Revert rate | 约 **0.5%**，按相对比例还在下降 | [1:15:45](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4545s) |
| 发布频率 | 稳定版大约 **每天一次** | 同上 |
| 产品表现 | 启动、输入、打开/切换会话等性能反而改善 | 同上 |

---

## 5. 可信度评估

### 5.1 可公开核验的部分

- 演讲视频、标题、演讲者身份和现场表述。
- `pstack` 仓库及其中的 skills、playbooks、verification 工作流。
- 她的 X 长文和会议 speaker bio。
- 这些材料足以证明：她确实形成了一套可执行、可复用的 agent 工程方法，而不是只讲概念。

### 5.2 目前只能算“她自报”的部分

- 个人每月 3,000 个 PR、团队每月 11,000 个 PR。
- 227 名贡献者、0.5% revert rate。
- Grok Bot / Dune 内部的具体 lint、架构和自动化规则。

原因：Grok Bot 和 Dune 不是公开代码库，外界无法独立审计这些数字和规则。

### 5.3 指标本身的局限

- Revert rate 低不等于缺陷率低。它只说明“被回滚的 PR 少”，不能完全代表代码质量或用户体验。
- PR 数量是产量指标，不是质量指标。她自己也在演讲开头承认，在 agent 出现之前，PR 数量并不是一个值得追求的目标。
- “大部分产品代码不需要深度人工 review”是她的团队经验，不应直接外推为所有团队都适用。

---

## 6. 一句话总结

她的“例外”不是“我的代码不是垃圾”，而是：

> **她愿意把大量工程投入放在代码结构、lint、验证和自动化环境上，让 agent 的产出变得可信任。**

更具体地说：

1. 先把代码库变成“agent 不容易写错”的结构。
2. 再把“完成”定义成 agent 能自己执行的验证。
3. 最后才让多个 agent 并行、过夜运行、自动合并。

这三步的顺序不能反过来。

---

## 7. 三条工作流的落地细节（源码级）

> 源码证据基线：`cursor/plugins@6e359ce0aba9e927914d8a940510aa2ef66a8f23`（2026-11-13）  
> 示例仓基线：`poteto/verification-skill-example@d5abe70d0d8c671672b6cef4069363f26c488feb`  
> 下面所有文件链接都固定到这两个 commit，避免 `main` 后续变化导致行号漂移。

先分清三者不是同一种东西：

| 工作流 | 真正的落地形态 | 谁在执行 | 主要产物 |
| --- | --- | --- | --- |
| `verification` | 一个“元技能”，生成项目级 verification skill + 控制 CLI | Coding agent + 被测试的真实 App | `.cursor/skills/verify-<app>/SKILL.md`、`features/`、截图/视频/日志 |
| `statechart` | 可执行 TypeScript 工具 + TLA+/TLC 工具链 | 本机或 CI 的 Node/Java 进程 | `report.md`、`chart.mmd`、`tlc.out`、`tlc-RULE.out` |
| `swarm` | 写在 `SKILL.md` 里的并行编排协议 | Cursor / Grok Bot 的 subagent / Task API | 一份聚合报告 + 每个 worker 的证据 |

这个区分很重要：`verification` 和 `swarm` 本身不是独立二进制；`statechart` 才有比较完整的本地执行代码。

---

### 7.1 Verification：把“能证明”做成项目级基础设施

#### 7.1.1 它解决的不是“写测试”，而是“agent 如何自己闭环”

`create-verification-skill` 的目标写得很直接：每个严肃项目都需要一种脚本化方式，启动真实 App、像用户一样操作、捕获证据。生成的 skill 是写给“下一个 agent”的，不是写给人的说明文档；那个 agent 会在任务中途、对 App 一无所知的情况下读到它。

来源：[create-verification-skill/SKILL.md L9](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-verification-skill/SKILL.md#L9)

所以它不是让 agent “跑一下测试”，而是让 agent 能完成这条闭环：

```text
启动 App -> 健康检查 -> 按用户路径操作 -> 捕获证据 -> 验证副作用 -> 清理 -> 证据仍存在
```

#### 7.1.2 第一步：Interview the repo，不问人

生成器先从代码库回答五个问题：

- **Surface**：用户实际接触什么？Web UI、CLI/TUI、桌面 App、API、移动端，还是库？
- **Run**：本地怎么启动？端口、环境变量、seed data、认证方式是什么？
- **Drive**：agent 怎么以程序方式操作它？优先复用已有 Playwright/Cypress/expect/PTY/HTTP，再考虑 browser/CDP、tmux/PTY、纯 HTTP。
- **Observe**：什么算证据？截图、终端记录、响应体、日志、退出码、数据库状态。
- **Isolate**：两个实例能否并行？端口、数据目录、用户 profile 是否会冲突？不能并行就明确写“不要双开”。

如果 checkout 本身跑不起来，先生动修复；一个建立在坏基线上的 skill 会教 agent 错误的步骤。只有代码无法回答的问题才问用户。

来源：[create-verification-skill/SKILL.md L11-L21](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-verification-skill/SKILL.md#L11-L21)

#### 7.1.3 生成物一：项目级 `SKILL.md`

输出路径固定为：

```text
.cursor/skills/verify-<app>/SKILL.md
```

它必须包含这些段落，而且每一段都要落到本仓库的真实命令，不能留占位符：

- **Launch**：精确启动命令；怎样算 ready；必须能从空数据目录启动，包含 migration 和 seed data；“进程能响应”不等于“App 可用”；包含 teardown。短生命周期 CLI/TUI 则每次在独立 PTY/tmux 里启动。
- **Doctor**：一个只读检查，回答“这个实例值得驱动吗？”——进程是否在、版本/构建是否正确、端口是否属于本次运行、认证是否有效。
- **Drive**：真实 selector/命令；优先 ARIA label、`data-*`、路由路径，不用坐标和 tab 顺序。
- **Evidence**：证据标准——走真实用户路径，不用内部 setter 或 test-only endpoint；同时记录动作和结果状态；除了屏幕，还要验证副作用（文件、数据库行、消息、剪贴板、网络/RPC）；mock 只能放在已有的生产边界之后；如果用了 dry-run，必须观察它实际跳过了什么，不能只信名字。
- **Cleanup**：只杀本次启动的实例，不按进程名杀；清理实例和临时状态，但**证据必须保留**，并在 skill 里写清楚证据路径。
- **Helpers**：随 skill 附带的脚本必须可执行，调用方式必须写在正文里；需要读者反推的 helper 不算 helper。

来源：[create-verification-skill/SKILL.md L23-L32](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-verification-skill/SKILL.md#L23-L32)

#### 7.1.4 生成物二：Feature Map

除了 `SKILL.md`，还会生成：

```text
.cursor/skills/verify-<app>/features/README.md
.cursor/skills/verify-<app>/features/<feature>.md
```

先从路由、命令、菜单、文档里识别 3–5 个用户可见 feature；每个 feature 文件固定四个 H2：

1. `Sub-features`
2. `How to get to it (user POV)`
3. `Driving it with <harness>`
4. `Gotchas`

`features/README.md` 不是简单索引，还包含：

- baseline preconditions：启动地址、一次性数据目录、seed 数据、`doctor` 期望值；
- driving conventions：ARIA 优先、命令按字面执行、浏览器走 `control-* browser`；
- proof / skip reporting：截图要带 App identity，UI proof 要 ARIA snapshot + screenshot，CLI proof 要 command/stdout/stderr/exit code，mutation proof 要第二次只读读取；
- feature entry contract：每个 feature 文件必须遵守的四个 H2。

来源：

- [feature-map-example/README.md L5-L42](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-verification-skill/references/feature-map-example/README.md#L5-L42)
- [feature-map-example/create-note.md L18-L39](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-verification-skill/references/feature-map-example/create-note.md#L18-L39)

这里有一个非常关键的约束：

> 如果 seed data 缺少某个 journey 的前置条件，这个 journey 必须报告失败并写明原因，**不能为了让 journey 通过而弱化它**。

来源：[create-verification-skill/SKILL.md L34-L36](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-verification-skill/SKILL.md#L34-L36)

#### 7.1.5 控制 CLI：让 agent 少烧 token、让证据可重复

`pstack` 指南明确建议：当 agent 反复写一次性脚本点击 App 时，应该把动作提炼成一个小型 control CLI，让 skill 调用它。好的 CLI 有这些特征：

- 少量可组合命令，而不是很多很薄的命令；
- 破坏性操作有 `--dry-run`；
- 子命令逐步暴露功能；
- 错误信息直接说“应该怎么做”；
- `--help` 足够丰富；
- 有机器可读输出，比如 JSON。

来源：[06-verify-and-ship.md L75-L84](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/06-verify-and-ship.md#L75-L84)

公开示例 `verify-atlas` 展示了这种 CLI 的形状：

```bash
node .cursor/skills/verify-atlas/control-atlas.mjs doctor
node .cursor/skills/verify-atlas/control-atlas.mjs new-session
node .cursor/skills/verify-atlas/control-atlas.mjs send "list open tasks in this project"
node .cursor/skills/verify-atlas/control-atlas.mjs press "Meta+KeyN"
node .cursor/skills/verify-atlas/control-atlas.mjs snapshot
node .cursor/skills/verify-atlas/control-atlas.mjs screenshot /tmp/atlas-proof.png
node .cursor/skills/verify-atlas/control-atlas.mjs wait-settle
node .cursor/skills/verify-atlas/control-atlas.mjs feature-flag rooms_v2 on
```

它还做了 checkout 隔离：

- 主工作区：CDP 9222，共享 user-data-dir；
- 隔离 checkout：所有命令带 `--checkout`，端口和 user-data-dir 按树派生；
- 从 checkout 直接连主实例会被拒绝；
- `doctor` 检查 checkout 上下文、端口归属、watcher 存活、build 是否过期。

来源：[verification-skill-example/.cursor/skills/verify-atlas/SKILL.md L13-L54](https://github.com/poteto/verification-skill-example/blob/d5abe70d0d8c671672b6cef4069363f26c488feb/.cursor/skills/verify-atlas/SKILL.md#L13-L54)

它的 proof bar 也很具体：不要提交“你看，它打开了”的截图；必须在同一条录制里展示触发动作和稳定终态；除了像素，还要验证 DOM 属性、剪贴板、网络/RPC 日志、文件内容，或者 reload/switch-away 往返。

来源：[verify-atlas/SKILL.md L82-L104](https://github.com/poteto/verification-skill-example/blob/d5abe70d0d8c671672b6cef4069363f26c488feb/.cursor/skills/verify-atlas/SKILL.md#L82-L104)

#### 7.1.6 自证：生成的 skill 必须先跑一遍

这是最容易忽略的落地细节。生成器不能写完 `SKILL.md` 就交付，它必须自己按生成的说明跑一遍：

1. launch
2. doctor
3. drive 一个 feature
4. 捕获证据
5. cleanup
6. 确认 cleanup 后证据仍在

失败就修；修完再跑。**一个从未执行过的 verification skill 只是草稿，不是交付物。**

来源：[create-verification-skill/SKILL.md L38-L40](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-verification-skill/SKILL.md#L38-L40)

#### 7.1.7 维护循环：防止 Feature Map 腐烂

`maintain-verification-skill` 是一个定期审计流程，只有三种结局：

- `clean`：每个 feature 都有源码覆盖 + live 覆盖，没有需要提交的修改；不建 branch、不开 PR。
- `changed`：开一个 PR，只包含被证明的文档/harness/map 修正。
- `blocked`：覆盖没跑完，或证明了修复但不能安全提交；必须说明卡在哪里。

编辑范围被严格限制在 verification skill 自己的目录（`SKILL.md`、`features/`、它拥有的 harness scripts）。**绝不允许在维护流程里改产品代码。** 如果 App 行为真的坏了，报告产品回归；不能改文档把它盖过去。

来源：[maintain-verification-skill/SKILL.md L11-L21](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/maintain-verification-skill/SKILL.md#L11-L21)

它的执行顺序是：

1. **Index hygiene**：读 feature map README，修 missing/extra/duplicate/dead entries。
2. **Source wave**：每个 feature 文件一个只读 subagent，并发跑；每个返回“功能怎么工作 / 源码入口 / 可能的 drift / 一条 live recipe”。子 agent 不驱动 App，也不改文件。
3. **Reconcile**：每个 feature 都有 summary；合并重复 recipe；抽查 drift；扫描最近 churn 是否漏了用户可见 surface。
4. **Live pass**：即使源码看起来很干净也必须跑。coordinator 自己拥有所有驱动；server/UI 用一个长生命周期实例串行驱动，短生命周期 CLI 每次开独立 session。每个 feature 至少走一次。
5. **Triage**：用户视角描述错误 → doc drift；行为能工作但 harness 驱动不了 → harness gap；App 行为真的坏 → product gap，记录给用户，不进这个 PR。
6. **Ship or stop**：`changed` 只提交一个 PR，提交前重读每个改动文件；`clean`/`blocked` 不开 PR。

来源：[maintain-verification-skill/SKILL.md L23-L37](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/maintain-verification-skill/SKILL.md#L23-L37)

Live pass 还有三个不变量：

- 驱动一个实例前必须 doctor；每次 fresh session 要 doctor；失败后要重新 doctor；doctor 看不出的 wedged UI 状态，要 reset 或重启，不能“希望它没事”。
- 已经捕获的证据必须在 cleanup 后仍然存在于指定路径。
- 驱动产生的残留不能活过本次运行；失败迭代也要清理。

#### 7.1.8 事实边界

`verification-skill-example` 是“重度虚构”的示例，README 明确写了：

- Atlas / Harbor Labs / `control-atlas` 都是虚构的；
- driver 脚本故意省略，只展示命令面；
- 示例约 30 个 feature 文件，是为了展示大型 App 的 map 如何保持可导航。

来源：[verification-skill-example/README.md L1-L39](https://github.com/poteto/verification-skill-example/blob/d5abe70d0d8c671672b6cef4069363f26c488feb/README.md#L1-L39)

所以，公开仓库能证明的是：

- 生成器的结构、约束和自证流程是真实存在的；
- 示例 skill 的 command surface 和 feature map 形态是可检查的；
- 但它不是一个“通用 App 驱动库”，真正的 `control-*` CLI 必须按项目生成。

---

### 7.2 Statechart：把 TLA+ 的模型检查结果翻译成“用户能看的状态图”

#### 7.2.1 它到底是什么

`/statechart` 不是 UI 截图工具，也不是“让模型画一张流程图”。它的实际链路是：

```text
TLA+ spec + TLC config + view module
        -> SANY 解析
        -> TLC 模型检查
        -> 找出每条 INVARIANT/PROPERTY 的最短反例路径
        -> 生成 Mermaid stateDiagram-v2
        -> 生成 markdown report
```

它要回答的问题是：**系统在状态之间移动时，是否存在一条路径，会让某条规则被打破？** 图上的节点和箭头要用“读图的人”的语言表达，而不是 TLA+ 变量名。

来源：[statechart/SKILL.md L7-L9](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/SKILL.md#L7-L9)

这对应她在演讲里说的：用 TLA+ 检查跨设备通知等用户流程，再用 `statechart` 把状态机从用户视角画出来，方便 review。演讲时间点：[1:12:14](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4334s)、[1:14:28](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4468s)。

#### 7.2.2 输入：TLA+ spec、config、view

使用方式写在 SKILL 里：

```bash
<skill dir>/scripts/statechart SPEC.tla [--config FILE] [--view FILE] [--out DIR]
```

- `SPEC.tla`：系统模型。
- `--config`：TLC 配置，默认找同目录的 `SPEC.cfg`。
- `--view`：一个模块，负责把 TLA+ 变量映射成读者看得懂的状态和箭头。
- `--out`：输出目录，必须是新目录或空目录。

第一次运行会通过 `mise` 安装 TLC 和 Java，需要网络；也可以用 `TLA2TOOLS` 和 `JAVA` 环境变量指定已有工具链。

来源：

- [statechart/SKILL.md L13-L21](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/SKILL.md#L13-L21)
- [statechart/scripts/statechart.ts L9-L23](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/statechart.ts#L9-L23)

#### 7.2.3 规则必须先写成可检查的 INVARIANT

SKILL 要求：

- 每条读图人认可的规则，都写成 `INVARIANT`；规则可以关于屏幕、结果、存储值或消息。
- 如果模型里没有变量能表达这条规则，就新增变量。
- **绝不能为了让模型通过而弱化规则。**
- `Next` 要写成动作的析取，比如 `YouPressPlay \/ YouPressStop`，否则 TLC 会把每一步都叫 `Next`。
- 没有出边的状态会破坏 `NoDeadlock`，即使它是正确的终态；需要给终态加一个 `Done == ... /\ UNCHANGED vars` 的 stutter action，并在 `step()` 里给它 label。

来源：[statechart/SKILL.md L23-L27](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/SKILL.md#L23-L27)

这几条很关键：它把“产品规则”变成“模型不变量”，而不是让 agent 写一个看似合理的故事。

#### 7.2.4 View module：把变量翻译成用户语言

`--view` 模块可以导出：

```js
export const state = (vars) => {
  // string -> 扁平图
  // array  -> 父子状态
  // object -> 每个 key 一个并行区域
};

export const step = (action, from, to) => {
  // 返回箭头标签，例如 "you press play"
};
```

还可以导出：

- `group(vars)`：给状态分组，决定颜色；
- `colors`：组名到颜色类；
- `title`：图表标题。

规则是：

- 状态标签写读者看得见或关心的事，比如 “Paying”“Lease held, write pending”，不要写变量名；
- 箭头标签写用户看到的事情，比如 “you press play”“the connect fails”，不要写代码或 TLA+ action 名；
- 有条件才发生的 step，在 label 末尾写 `[while the file loads]`；
- 目标控制在 20 条箭头以内；
- `state()`、`group()` 每个模型状态最多调用一次，`step()` 每个 step 最多调用一次，所以必须只依赖参数，不能有隐藏状态。

来源：[statechart/SKILL.md L29-L60](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/SKILL.md#L29-L60)

公开 corpus 里有一个很直观的例子：`TwoPhase/view.mjs` 只写了一行，把 TLA+ 变量映射成三个并行区域：

```js
export const state = (v) => ({ Manager: v.tmState, r1: v.rmState.r1, r2: v.rmState.r2 });
```

来源：[TwoPhase/view.mjs L1](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/test/corpus/TwoPhase/view.mjs#L1)

#### 7.2.5 执行链：SANY -> TLC -> 反例 -> Mermaid

`run.ts` 的真实执行链：

1. 用 `tla2sany.xml.XMLExporter` 解析 spec，拿到变量和规则。
2. 用 pinned 的 TLC 1.7.4 + Java 25 跑模型检查。
3. 固定参数：
   ```text
   -workers 1 -fp 0 -lncheck final
   ```
   这是为了让结果可复现，而不是追求跑得快。
4. TLC 找到某条规则被打破后，记录反例，把这条规则从下一轮移除，再跑其余规则。
5. 第一次发现 break 后，后续运行最多探索 100,000 个 distinct states，避免大模型跑不完。
6. 如果模型 distinct states <= 500，画完整状态图；否则只画到 bug 的路径。若没有规则被打破且状态数超过 500，则**不生成 `chart.mmd`**。

来源：

- [run.ts L67-L70](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/run.ts#L67-L70)
- [run.ts L270-L380](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/run.ts#L270-L380)
- [run.ts L412-L477](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/run.ts#L412-L477)
- [ir.ts L137-L139](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/ir.ts#L137-L139)

#### 7.2.6 输出：`report.md` + `chart.mmd` + TLC 原始输出

每次成功运行会产出：

```text
report.md
chart.mmd
tlc.out
tlc-<RULE>.out      # 某条规则在图上没有画出路径时，单独保存它的 TLC 输出
```

退出码：

- `0`：所有规则成立；
- `1`：有规则被打破；
- `2`：TLC 出错、被信号杀掉或命令本身无法运行；
- 只有 `0` 和 `1` 会写输出。

来源：[statechart.ts L18-L23](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/statechart.ts#L18-L23)

`pipeline.ts` 会把所有 bug path 按长度排序，最短的放前面，并把 chart/report/TLC 输出打包：

来源：[pipeline.ts L57-L75](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/pipeline.ts#L57-L75)

`mermaid.ts` 会把状态图写成 `stateDiagram-v2`，并加上这些视觉标记：

- `breaks`：确定会破规则，红色；
- `mayBreak`：某些模型状态会破，橙色；
- `bugPath`：最短反例路径上的状态，蓝色边框；
- `repeats`：PROPERTY 反例会永远重复，紫色虚线；
- Legend 自动列出规则名；
- 多个并行区域会自动生成 `state "At the same time"` 容器。

来源：[mermaid.ts L96-L199](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/backends/mermaid.ts#L96-L199)

一个真实的 corpus 输出能说明它长什么样。`TwoPhase` 的报告写着：

```text
TLC reached 76 states and 192 steps. The chart draws 10 states and 16 arrows.
The chart does not draw 59 steps that stay in one chart state.

## TCConsistent breaks
The shortest path has 5 steps:
0. Manager init, r1 working, r2 working
1. RMChooseToAbort: Manager init, r1 working, r2 aborted
...
```

它的图则是 `Manager`、`r1`、`r2` 三个并行区域，并且把 `TCConsistent` 的 5 步反例路径标成 `bugPath`。

来源：

- [TwoPhase/report.md L1-L20](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/test/corpus/TwoPhase/report.md#L1-L20)
- [TwoPhase/chart.mmd L1-L59](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/test/corpus/TwoPhase/chart.mmd#L1-L59)

#### 7.2.7 交付前必须把反例打回真实代码

这是 `statechart` 最重要的质量门槛之一：

> 当模型描述的是代码时，要把每条 bug path 按 action 逐步重放到真实代码里，做成测试或 live repro。如果 bug 没有发生，先假设模型错了，直到你能证明模型没错。

来源：[statechart/SKILL.md L78-L82](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/SKILL.md#L78-L82)

这一步防止把“建模错误”当成“产品 bug”交给 PM/设计。它也把 TLA+ 的反例变成了可复现的工程证据。

#### 7.2.8 它和 Lean 的关系

需要区分：

- `/statechart` 是 **TLA+ 模型检查 + Mermaid 可视化**；
- `/create-formal-verification-skill` 是更上层的“选工具”流程：根据问题选择 model checker、proof assistant、SMT-backed verifier 或其他工具；如果选 TLA+，再让 agent 用 `/statechart` 读结果。
- Lauren 在演讲里提到的 **Lean** 证明自研虚拟化库不闪烁，是 Grok Bot 内部实践；公开 `pstack` 仓库里没有 Lean 实现，不能把 `/statechart` 等同于 Lean。

来源：

- [create-formal-verification-skill/SKILL.md L17-L39](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-formal-verification-skill/SKILL.md#L17-L39)
- 演讲：[1:12:14](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4334s)

#### 7.2.9 可检查的工程证据

`statechart` 不是一段 prompt，它有一套真实测试：

- `scripts/test/corpus/` 下有 **33 个** TLA+ corpus；
- `corpus.test.ts` 对每个 corpus 跑 `statechart.ts`，把生成的 `report.md` 和 `chart.mmd` 与 committed snapshot 对比；
- `differential.test.ts` 用 `fast-check` 生成配置/值域，和 Java oracle 做差分测试；
- TLC 版本、JAR checksum、Java 版本都 pin 住，减少“机器不同结果不同”。

来源：

- [statechart/scripts/test/corpus.test.ts L15-L56](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/test/corpus.test.ts#L15-L56)
- [statechart/scripts/test/differential.test.ts L8-L70](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/test/differential.test.ts#L8-L70)

#### 7.2.10 适用边界

- 它验证的是**模型在给定 scope/bound 内**的性质，不是整个系统。
- TLC 会越过已经违反规则的状态继续探索，所以图里可能出现“bug 之后”的状态；报告会解释。
- 如果模型过大、触发 100k boundary 或 TLC 出错，报告会把未检查的规则列在 `Rules not checked` 下；未检查不等于成立。
- 它适合状态机、协议、并发/重试、用户流程；不适合替代运行时 UI 验证。

---

### 7.3 Swarm：并行 worker 的“编队协议”，不是调度器

#### 7.3.1 先纠正一个误解

`swarm` 不是一个独立的 scheduler，也没有一个 `swarm` 二进制。它的全部实现就是：

```text
pstack/skills/swarm/SKILL.md
```

这是一个写给父 agent 的编排协议：父 agent 用宿主的 subagent/Task API 一次性拉起 N 个 worker，然后收结果、审计、汇总。真正执行任务的是 Cursor / Grok Bot 的 subagent，而不是 pstack 自己。

来源：[swarm/SKILL.md L1-L41](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/swarm/SKILL.md#L1-L41)

#### 7.3.2 四个阶段：Frame -> Fan out -> Aggregate -> Report

**Phase A：Frame**

在拉起任何 worker 之前，父 agent 必须：

1. 写清楚 done predicate 和最终要返回的 artifact/report；
2. 选形态：分区（partition）、同一 brief 的 N 个 worker 竞速（race），或两者混合；
3. 如果是 race/mixed，必须在 spawn 前声明选择规则：`first pass`、`rank all` 或 `best-of`；
4. 选 worker model：从 `~/.cursor/rules/pstack-models.mdc` 的 `swarm workers` 行读；缺省是 `grok-4.7-xhigh-fast`；`auto`/`inherit-parent` 就不传 model；
5. 每个 worker 写文件时要有独立的 writable output；
6. 如果 worker 要验证/测量某个 commit，brief 里必须写 exact SHA；测量 brief 还要写方法：sample count、一个 sample 是什么、执行顺序。worker 必须在结果里记录这些信息。

来源：[swarm/SKILL.md L18-L23](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/swarm/SKILL.md#L18-L23)

**Phase B：Fan out**

父 agent 在**一条消息里**同时 spawn 所有 N 个 worker，参数是：

```text
subagent_type: generalPurpose
environment: "cloud"
run_in_background: true
```

- 只有 worker 必须访问用户电脑上的东西时，才用 `environment: "local"`；
- 如果 worker 必须从非默认的已推送 branch 开始，传 `cloud_base_branch`；
- 每个 brief 必须自包含：目标、范围、具体 slice/race arm、怎么验证、返回什么；
- 报告状态只能是 `PASS`、`ISSUES`、`BLOCKED`，并且必须带证据；
- 能证明缺陷的 worker 要列出**所有能证明的 issue**，不能只报第一个；
- 某个 worker 掉线，父 agent 可以带着 N-1 继续，但必须注明。

来源：[swarm/SKILL.md L25-L33](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/swarm/SKILL.md#L25-L33)

**Phase C：Aggregate**

父 agent 读 terminal results，并且执行这些质量门：

- 结果没有记录 brief 指定的 SHA 和 method → 丢弃，重拉该 worker 一次；
- 第二次仍缺失 → 记为 `gap`；
- **`gap` 不算 pass**；
- 如果是 coverage，每个 required slice 都必须有结果；
- 如果是 race，按 spawn 前声明的规则选，不能看到结果后再挑；
- 不粘贴原始 worker dump，要压缩成判断。

来源：[swarm/SKILL.md L35-L37](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/swarm/SKILL.md#L35-L37)

**Phase D：Report**

最后只返回一份 consolidated in-chat report，包含：

- 结果表；
- 每条 issue 一行；
- gaps/dropouts；
- race 规则（如果用了 race）。

来源：[swarm/SKILL.md L39-L41](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/swarm/SKILL.md#L39-L41)

#### 7.3.3 具体用法一：把 Feature Map 切成并行验证 lane

`pstack` 指南给的用法是：verification skill 可用之后，`/swarm` 可以按 feature-map entry 拆一个完整 pass，再聚合结果；也可以用足够的样本确认 perf win，或在 PR 前 fuzz 整个 App 找回归。

来源：[06-verify-and-ship.md L73](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/06-verify-and-ship.md#L73)

多阶段 PR 的 boot recipe 更具体：

- 每个 live lane 跑在**自己的 cloud VM** 上；
- 每个 lane 在 PR head 上 `git fetch` + `checkout <head SHA>`；
- 启动 backend 和 surface，等 ready；
- 只通过 control skill（如 `control-ui` / `control-cli`）输入；
- 截图保存到：
  ```text
  /tmp/swarm-<pr-id>/worker-<n>/<slug>.png
  ```
- root agent 在给 verdict 前审计 merge-ready report 里的 receipts。

来源：[multi-phase-plan.md L63-L77](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/multi-phase-plan.md#L63-L77)

一个 full swarm 的典型 lane 组成：

- 1 个 gate lane；
- 10 个 live lane（来自 PR 的 **Verify, live** 块）；
- 1 个 perf lane；
- 2 个以上 audit lane，各自有独立 focus，读 diff 和 receipts，默认不信任 PR body。

来源：[multi-phase-plan.md L65](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/multi-phase-plan.md#L65)

#### 7.3.4 具体用法二：让“写代码的人”和“给 verdict 的人”分离

`autopilot-full` 把这一点写成了硬规则：

> 你拥有 verdict，不拥有 PR。一个 owner 负责把 PR 从 build 带到 merge；在由没写过这份代码的 swarm 证明要 merge 的代码之前，什么都不 merge。

来源：[autopilot-full.md L3](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/autopilot-full.md#L3)

执行细节：

- full swarm 只在 **code-ready head** 跑一次；
- 只有出现新行为、重新设计或大 diff 时才再跑 full swarm；
- rebase、merge conflict、minor fix → 在新 head 上跑一个 verifier；
- 纯文案修改 → 不跑；
- verifier 必须重新跑 gates、通过 control skill 在真实 surface 上证明 load-bearing behavior，并审计 diff；
- **没有 live lane 的 verdict 不算 clean**。

来源：[autopilot-full.md L5-L17](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/autopilot-full.md#L5-L17)

这就是“2000/3000 PR”能保持质量的制度性原因之一：**不是让写代码的 agent 自己说“我验证过了”，而是让另一组 agent 在独立环境里重跑证据。**

#### 7.3.5 它和 `verification` 的关系

两者是上下层关系：

- `verification` 提供 worker 的**可执行 proof recipe**；
- `swarm` 提供 fan-out、隔离、聚合和“gap 不算 pass”的**编排规则**。

没有 verification skill，swarm 只能得到一堆“我看过了”的自然语言；没有 swarm，verification 只能串行跑。

#### 7.3.6 Swarm 的边界

- 它依赖宿主的 subagent/Task API；不同宿主支持的 model slug、cloud/local 能力不同。
- `SKILL.md` 没有固定并发上限；N 由任务决定，成本和限流由宿主环境承担。
- 它不保证每个 worker 都成功；掉线、缺证据、超时都会变成 gap，而 gap 明确不算通过。
- 它不是“多 agent 投票”。race 有预声明规则，coverage 要求每个 slice 都有结果，不能靠多数票掩盖缺口。

---

### 7.4 三条工作流如何接成一个闭环

把上面的细节拼起来，实际闭环是：

```text
/poteto-mode
  -> /create-verification-skill           # 一次性：生成项目级验证能力
  -> 修改代码
  -> /verify-<app>                       # runtime proof：真实 UI/CLI + 证据
  -> /create-formal-verification-skill   # 可选：并发/状态机/解析器性质
  -> /statechart                         # 可选：TLA+ 反例 -> Mermaid + 最短路径
  -> /swarm                              # 并行跑 feature/perf/fuzz lanes
  -> 独立 verifier 给 verdict
  -> autopilot / shipping                # 只在证据完整时 merge
```

对应的质量门是：

1. **Code-level**：lint/type/compiler/architecture 先挡住类别性错误。
2. **Runtime**：verification skill 走真实用户路径，留下截图/视频/日志/副作用证据。
3. **Formal**：状态机/并发/协议用 TLA+ 或更强的证明工具检查；`statechart` 把反例翻译成用户路径。
4. **Parallel**：swarm 把验证拆成独立 lane，在独立 cloud VM 上跑，最终只收一份有证据的 verdict。
5. **Merge**：没有 live lane、没有 receipts、有 gap 的 PR 不算 clean；写代码的 agent 不能自己给自己 verdict。

---

### 7.5 事实依据索引

| 事实 | 可检查的源码/材料 |
| --- | --- |
| verification 生成项目级 skill，包含 Launch/Doctor/Drive/Evidence/Cleanup/Helpers | [create-verification-skill/SKILL.md L23-L32](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-verification-skill/SKILL.md#L23-L32) |
| Feature Map 用四个固定 H2，且不能弱化 journey | [create-verification-skill/SKILL.md L34-L36](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-verification-skill/SKILL.md#L34-L36) |
| 生成的 skill 必须自己跑一遍，否则只是草稿 | [create-verification-skill/SKILL.md L38-L40](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-verification-skill/SKILL.md#L38-L40) |
| 维护循环只有 clean/changed/blocked，且不改产品代码 | [maintain-verification-skill/SKILL.md L11-L37](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/maintain-verification-skill/SKILL.md#L11-L37) |
| 示例 `control-atlas` 通过 CDP 驱动、支持 checkout 隔离 | [verify-atlas/SKILL.md L13-L104](https://github.com/poteto/verification-skill-example/blob/d5abe70d0d8c671672b6cef4069363f26c488feb/.cursor/skills/verify-atlas/SKILL.md#L13-L104) |
| 示例 driver 脚本被故意省略，只展示命令面 | [verification-skill-example/README.md L1-L39](https://github.com/poteto/verification-skill-example/blob/d5abe70d0d8c671672b6cef4069363f26c488feb/README.md#L1-L39) |
| statechart 输入 TLA+/cfg/view，输出 report/chart/TLC 日志 | [statechart/SKILL.md L13-L21](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/SKILL.md#L13-L21) |
| statechart 用 TLC 1.7.4、Java 25、固定 worker/fp 参数 | [run.ts L67-L70](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/run.ts#L67-L70) |
| 500 状态图预算、100k 重跑边界 | [ir.ts L137-L139](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/ir.ts#L137-L139) |
| TwoPhase 的 76 states/192 steps -> 10 states/16 arrows、5 步反例 | [TwoPhase/report.md L1-L20](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/test/corpus/TwoPhase/report.md#L1-L20) |
| 33 个 corpus + snapshot/differential 测试 | [corpus.test.ts L15-L56](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/scripts/test/corpus.test.ts#L15-L56) |
| swarm 是 Frame/Fan out/Aggregate/Report 协议 | [swarm/SKILL.md L18-L41](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/swarm/SKILL.md#L18-L41) |
| 每个 live lane 独立 cloud VM，截图路径固定 | [multi-phase-plan.md L63-L77](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/multi-phase-plan.md#L63-L77) |
| 写代码的 owner 不能自己给 verdict | [autopilot-full.md L3-L17](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/autopilot-full.md#L3-L17) |
| `/swarm` 可并行跑 verification、perf sample、fuzz | [06-verify-and-ship.md L73](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/06-verify-and-ship.md#L73) |

**仍然不可公开核验的部分**：Grok Bot / Dune 的内部 lint 和架构、Lean 证明细节、每月 3,000/11,000 PR、227 contributors、0.5% revert rate。这些属于演讲中的团队内部实践或自报数据，公开 `pstack` 只能证明方法论和工具形态，不能替代对这些数字的独立审计。

---

## 8. Lint 检查具体怎么做

先把口径说清楚：她说的 **lint** 不只是 ESLint。结合演讲和 `/correct`，它指的是一组**确定性的静态检查**，包括 lint 规则、类型检查、编译器约束、依赖图检查、CI check 和自定义脚本。运行时验证、TLA+、swarm 是后面的层，不能拿 lint 代替它们。

她在演讲里把 lint、类型系统、编译器、测试一起归入“代码层约束”；`/correct` 又给这组约束排了内部优先级：

```text
架构上消除
  -> 类型上禁止
  -> lint / CI check
  -> 测试
  -> 文档或 agent rule
```

这两套说法并不冲突：**lint 排在自然语言规则之前，但排在架构和类型之后。** 如果能靠 API 或类型让错误写法根本不存在，就不应该再写一条 lint 去追着它跑。

### 8.1 第一步不是写规则，而是找“重复错误类别”

`/correct` 的入口不是“列出好规则”，而是先挖事故史：

> “First, read recent commits, reverts, review comments, agent instruction files, and comments that explain workarounds. Group the mistakes into classes. A class counts once it has happened twice.”

中文：先读近期 commit、revert、review comment、agent 指令文件，以及解释 workaround 的注释；把错误归成类别；**同一类错误发生两次，才算一个值得固化的类别。**

来源：[correct/SKILL.md L13-L15](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/correct/SKILL.md#L13-L15)

具体挖掘方式是：

1. **commit**：看同一类修复是不是反复出现，例如每次都在加 defensive guard、每次都在补同一种空值判断。
2. **revert**：看被回滚的改动有什么共同结构，而不是只看“哪个 PR 失败了”。
3. **review comment**：把 reviewer 反复写的话归一化，例如“不要从 renderer import main”“不要用 useEffect 做这个”。
4. **agent instruction files**：如果 `AGENTS.md` 里已经写过，但错误还在发生，说明这条文字没有被任何机制执行。
5. **解释 workaround 的注释**：她说 agent 会把注释当成“不按正确方式做”的逃生通道；这些注释既是错误证据，也是下一层检查的候选。

这五类证据和 `/correct` 原文一一对应。两次阈值也很重要：**一次奇怪会话只是轶事，不能直接升级成全仓库规则。** `09-make-it-yours.md` 也写了同样的门槛：“add a skill or a check when the same failure shows up twice.”

来源：[09-make-it-yours.md L5](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/09-make-it-yours.md#L5)

### 8.2 第二步：选“能生效的最高层级”

`/correct` 的顺序不是审美偏好，而是按“能不能让错误根本不发生”排序：

| 层级 | 适合解决什么 | 对应做法或例子 | 为什么不是更低层 |
| --- | --- | --- | --- |
| 1. 架构消除 | 错误写法仍然很容易被写出来 | 把 Electron 拆成 `electron/main` 与 `electron/renderer`；把产品代码需要的生命周期能力收进 Dune API | 只写注释或规则，仍然要靠每次 review 抓 |
| 2. 类型约束 | 非法状态可以被表示出来 | 用类型让“同时处于两个互斥状态”无法编译 | 类型过不了，代码根本进不了 CI |
| 3. lint / CI check | 代码能编译，但模式是错的 | 产品代码禁用 `useEffect`；禁止 renderer import main | 测试未必覆盖，reviewer 不该反复抓同一类 |
| 4. 测试 | 行为错了但静态检查看不出来 | 给用户可观察行为补失败测试 | 静态规则不知道运行时语义 |
| 5. 文档 / agent rule | 只剩需要判断力的取舍 | `AGENTS.md` 里的风格和判断说明 | 没有东西会在 agent 跳过时失败 |

`/correct` 的原文是：

> “If bad code still compiles, add a lint or CI check whose error names the file, type, or function to use instead.”

中文：**如果错误代码还能编译，就加一条 lint 或 CI check，而且报错信息必须直接说出应该改用哪个文件、类型或函数。**

来源：[correct/SKILL.md L17-L22](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/correct/SKILL.md#L17-L22)

这一步还要回答一个审查问题：**为什么更高层没生效？** `/correct` 要求最后按类别汇报证据、选了哪一层、以及更高层为什么不可行。这能防止团队偷懒：不是所有问题都该用 lint 糊过去。

修复时按频率排序，**一个错误类别一个 commit**。这样每个 commit 都能独立 review、独立回滚，也方便把“这条规则是在修哪类事故”写进历史。

类型约束的通用表述可以在公开原则里核对：让编译器拒绝不可能的状态、混用的 primitive 和未处理的 variant。来源：[principle-type-system-discipline/SKILL.md L9-L13](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/principle-type-system-discipline/SKILL.md#L9-L13)

### 8.3 她在演讲里给出的四个真实案例

下面只写公开材料能支撑的部分，不把示意配置冒充成 Grok Bot 的内部文件。

#### 8.3.1 产品代码禁用 `useEffect`

她的原话是：`useEffect` 有合理用途，但“需要很多 nuance”，agent 不擅长；所以他们的做法是**在产品代码里禁用它，只允许在 Dune API 内部的少数位置使用**。结果是这个问题被“categorically eliminated”，以后不需要在 code review 里再抓。

来源：[演讲 1:07:00-1:07:34](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4020s)

这里可核验的落地事实是：

- 禁止范围是**产品代码**，不是整个仓库；
- 允许范围是 **Dune API 内部**，不是给每个业务文件开后门；
- 目的不是证明 hook 本身坏，而是消除一类需要大量判断力的误用；
- 检查放在代码层，让 review 不再承担这个职责。

**不可核验的是**：Grok Bot 具体用了哪条 ESLint 规则、规则叫什么、Dune 的包路径是什么。下面只给等价示意。

#### 8.3.2 禁止 `electron/renderer` import `electron/main`

她说 Cursor 是 Electron app，agent 经常把 main 线程代码 import 进 renderer，造成 long task 和 jank。于是他们把目录做成两个顶层边界：`electron/renderer` 和 `electron/main`，并用**依赖图分析器加 lint 规则**禁止两者之间的错误 import。

来源：[演讲 1:07:34-1:08:20](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4054s)

这里的落地重点是“目录结构本身就是上下文”：

- 目录名直接告诉 agent 自己位于哪一侧；
- 共享契约应放到第三处，而不是让 renderer 穿透 main；
- 依赖图分析器负责跨文件、跨模块的边，lint 负责局部的 import 写法；
- 错误信息应该告诉 agent 去用哪座桥，而不是只说 “forbidden import”。

同样，公开材料没有给出他们实际的依赖图配置或 ESLint rule 名称。

#### 8.3.3 禁掉 99% 的注释

她说注释会过期、人类不读，而且会给 agent 一个“解释自己为什么不按正确方式做”的逃生通道。更关键的是：**注释不可执行，无法被信任。** 所以在 Grok Bot 和 Dune 里，他们禁掉了 99% 的注释，并用带明确修复指引的 lint 错误代替。

来源：

- 注释问题：[演讲 1:08:20-1:10:16](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4100s)
- 99% 禁令：[演讲 1:09:47](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4187s)
- 带修复指引的 lint：[演讲 1:10:20](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4220s)

`pstack` 公开的不是“注释 lint 正则”，而是一套 **agent review 工作流**：

- `/no-comments` 会启动一个没有写过这段代码的 **Comment Sicko** 子 agent；
- 它只读 diff，不写产品代码；
- 只有五类注释可以保留：license header、公共 API 的 doc comment、解释外部约束的 issue/RFC 链接、外部依赖强制的非显然行为、`prettier-ignore`；
- 对“不能删”“有风险”“暂时这样”的声明，它会去查 nearby code、`/how` 或 `/why`；证明不了就删；
- 如果注释声称一个约束，`/no-comments` 会先提供最便宜的 type、runtime、test 或 CI lint 编码方式，再把注释删掉。

来源：

- [no-comments/SKILL.md L19-L23](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/no-comments/SKILL.md#L19-L23)
- [comment-sicko.md L14-L30](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/agents/comment-sicko.md#L14-L30)
- [05-build-and-clean.md L69-L79](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/05-build-and-clean.md#L69-L79)

“99%”是演讲里的口语比例，不是对外审计过的精确指标；能确认的是**默认删除，少数例外白名单保留**。

#### 8.3.4 imperative timers 是“反模式证据”，但不能夸大成已公开的禁用规则

她说 agent 很喜欢 `setTimeout`、`requestAnimationFrame`、`requestIdleCallback`，把它们当作 quick fix，用来掩盖 VS Code 命令式架构与 React 声明式架构之间的冲突。大量 timer 的创建和销毁带来 GC、卡顿和 jank。

来源：[演讲 1:08:49-1:09:44](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4129s)

**证据边界**：公开字幕能确认她把这类写法列为反模式，也能确认它造成了性能问题；但字幕没有明确说“Grok Bot 用某条 lint 禁用了这三个 API”。因此这里不能像 `useEffect` 那样写成“已确认禁用的具体规则”。如果要做等价落地，规则应是：

```text
产品代码不得直接调用 setTimeout / requestAnimationFrame / requestIdleCallback。
改用该 surface 的声明式调度原语；如果原语表达不了，修架构或补 API，不要在业务代码里加 timer。
```

这条文字是**根据她的架构批评重建的建议规则**，不是 Grok Bot 原始配置。

### 8.4 一条合格 lint 的写法：错误信息就是修复指令

她对 lint 的要求不是“报错”，而是让 agent **读到错误就知道下一步改哪里**。结合 `/correct`，可以把一条规则拆成六个要素：

| 要素 | 要求 | 反例 |
| --- | --- | --- |
| 选择器 | 精确命中错误构造，不用宽泛正则扫全文件 | `no-restricted-syntax` 只写一个巨大的 `.*` |
| 范围 | 只覆盖产品代码；允许的底层目录用路径白名单 | 全仓库一律禁用，连 Dune 自己也无法实现 |
| 信息 | 直接说出替代文件、类型、函数或 API | `Do not use this` |
| 严重级别 | correctness/safety 规则应为 error，不能只是 warning | CI 带 warning 仍然通过 |
| 可复现 | 同一个命令本地和 CI 都跑 | 本地跑 ESLint，CI 跑另一套脚本 |
| 有测试 | 用真实历史错误证明它会失败 | 规则写完从未见过它报错 |

以“产品代码禁用 `useEffect`”为例，等价的 ESLint flat config 可以写成下面这样。**这只是示意，不是 Grok Bot 的原始配置：**

```js
// eslint.config.mjs — 等价示意，不是 Grok Bot 原始配置
export default [
  {
    files: ["apps/**/*.{ts,tsx}"],
    ignores: ["packages/dune/**"], // 仅示意：只允许 Dune 内部实现使用
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.name='useEffect']",
          message:
            "Product code must not call useEffect. Use the lifecycle API exposed by Dune. If Dune cannot express this case, change Dune; do not patch around it here.",
        },
        {
          selector:
            "CallExpression[callee.object.name='React'][callee.property.name='useEffect']",
          message:
            "React.useEffect is forbidden in product code. Use Dune's lifecycle API instead.",
        },
      ],
    },
  },
];
```

这个例子还说明一个容易漏掉的点：只匹配 `useEffect()` 会漏掉 `React.useEffect()`。**规则必须配反例测试**，否则选择器本身就会成为逃生通道。

目录边界也可以用等价配置表达。实际工程里更稳的是把依赖图分析器作为主检查，把 ESLint 作为局部兜底：

```js
// eslint.config.mjs — 等价示意，不是 Grok Bot 原始配置
export default [
  {
    files: ["electron/renderer/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/electron/main/**", "@app/main/**"],
              message:
                "Renderer code must not import electron/main. Move shared contracts to electron/shared and cross through the typed preload/IPC bridge.",
            },
          ],
        },
      ],
    },
  },
];
```

这段配置的重点不在 API 名称，而在错误信息：它同时告诉 agent **哪边错了、共享代码放哪里、正确通道是什么**。这正对应她说的 “error messages telling the agent to fix the root cause ... rather than just patch around it.”

来源：[演讲 1:10:20-1:10:32](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4220s)

### 8.5 存量已经很多怎么办：只阻止“新增”

`/correct` 明确要求：

> “If the pattern is already common, fail only when a change adds more.”

中文：**如果错误模式已经大量存在，不要要求一次 PR 清完；只让新增违规失败。**

这在工程上叫 ratchet（棘轮）：干净度只能上升，不能下降。公开文档只给了策略，没有给具体插件名；一个忠实的落地方式如下：

1. 首次建立规则时跑一次全仓扫描，把现有违规按 `rule + file + symbol` 记入 baseline。
2. 正常 lint 仍然扫描全仓，但从结果里减去 baseline 中登记的已知违规。
3. 比较“当前违规数”和“baseline 允许数”：
   - 当前更少：通过，并鼓励顺手收紧 baseline；
   - 当前相同：通过；
   - 当前更多：失败。
4. baseline 不按行号记录，按符号或稳定指纹记录，否则一次格式化就会把所有旧违规变成“新增”。
5. baseline 的修改必须随 PR review；不能由 agent 自动把新违规写进去。

可以选择三种实现：

| 方式 | 做法 | 适合 |
| --- | --- | --- |
| 文件级配额 | 每个文件允许 N 个已知违规，超过就失败 | 违规集中在少数旧文件 |
| 规则级配额 | 某条规则全仓允许 N 个，超过就失败 | 跨很多文件的同一类旧问题 |
| diff-only 门禁 | 只检查本次新增/修改的行 | 规则成熟、想先止血 |

无论选哪种，**本地和 CI 必须调用同一个命令**，不能在本地用 diff-only、CI 用全仓，否则 agent 看到的反馈会和合并门禁不一致。

### 8.6 用真实历史错误做“会失败”的证明

`/correct` 的要求是：

> “Prove each new check fails on a real past mistake. Run the same command locally and in CI.”

中文：**每条新检查都要用一条真实发生过的历史错误证明它确实会失败；同一个命令要在本地和 CI 都跑。**

这里的“证明”不是贴一张截图，而是留下可复查的证据链：

| 证据 | 具体内容 |
| --- | --- |
| 错误来源 | 对应 commit、revert、review thread 或 workaround 注释的链接 |
| 失败证明 | 在引入修复前的代码或最小 fixture 上运行规则，记录退出码和命中行 |
| 失败原因 | 确认是目标规则命中，而不是语法错误、其他规则或整个仓库扫描失败 |
| 修复证明 | 应用正确写法后，同一条命令通过 |
| 回归证明 | 自定义规则用 `RuleTester` 或 fixture 测试固化正例、反例和绕过写法 |

对于 `no-restricted-syntax` 这类配置规则，最低限度也要有 fixture：

```text
fixtures/lint/use-effect/positive.tsx   -> 应命中
fixtures/lint/use-effect/react-member.tsx -> 应命中 React.useEffect()
fixtures/lint/use-effect/allowed.tsx    -> 不命中（Dune 内部）
```

否则很容易出现“规则看起来生效了，其实选择器漏掉了真实写法”的假安全感。

### 8.7 本地和 CI 用同一条命令

这里的“同一条命令”是字面意思。比如统一成一个入口：

```json
{
  "scripts": {
    "lint": "eslint . --max-warnings=0 && node scripts/check-boundaries.mjs",
    "lint:proof": "node scripts/lint-regression.mjs"
  }
}
```

CI 只调用：

```yaml
check:
  script:
    - pnpm lint
    - pnpm lint:proof
```

落地时要避免三种常见分叉：

- 本地只跑 IDE 的 ESLint 插件，CI 跑 CLI；
- 本地 `eslint src`，CI 对全仓跑；
- CI 加了 `|| true`、`continue-on-error`，或者把 correctness 规则设成 warning。

这些都会让“确定性检查”重新变成“看环境”。她的原则是把判断变成可执行的 check，而不是让 check 只在某台机器上讲道理。

### 8.8 例外：写在出错行，带原因、过期时间和人工批准

`/correct` 对例外的要求非常具体：

> “Exceptions go on the offending line with a reason, an expiry date, and a human's approval.”

中文：**例外写在出错的那一行，必须同时包含原因、过期日期和人工批准。**

示意写法：

```ts
// eslint-disable-next-line no-restricted-syntax -- reason: legacy IPC bridge until v2 lands; expires: 2026-12-31; approved-by: @platform-lead
const legacyBridge = makeLegacyBridge();
```

这条规定解决四个问题：

- 例外不会跑到团队 wiki 里，读代码时就能看到；
- 没有原因的例外会被审计出来；
- 没有过期日的例外会永久腐烂；
- agent 不能自己批准自己的例外。

建议再加一条机械化检查：扫描所有 `eslint-disable`、`@ts-ignore`、`@ts-expect-error` 和等价指令，缺 `reason:`、`expires:`、`approved-by:` 或已经过期的直接失败。这个扫描器不是她公开仓库里的实现，而是把她的三项要求变成 check 的自然做法。

注意：**例外机制不是 correctness/safety suppression 的后门。** Comment Sicko 明确要求：

- 对 `eslint-disable`、`@ts-ignore`、`@ts-expect-error` 要查规则本身；
- 如果规则抓的是真实 bug，或保护 correctness/safety，就必须修掉 suppression，并把具体符号标成 `MUST KILL`；
- 只有规则本身是错的、过于学究或纯风格问题时，suppression 才可以保留。

来源：[comment-sicko.md L24-L30](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/agents/comment-sicko.md#L24-L30)

### 8.9 维护“规则 ↔ 执行者”表，并删除过时规则

`/correct` 的最后一步是在 agent instruction file 里维护一张表，把每条规则和真正执行它的机制配对：

| 规则 | 为什么需要 | 谁在执行 | 命令 | 例外 |
| --- | --- | --- | --- | --- |
| 产品代码禁止 `useEffect` | agent 容易误用，review 反复抓 | `no-restricted-syntax` | `pnpm lint` | 行内 reason + expiry + approval |
| renderer 不得 import main | 跨线程 import 造成 long task/jank | 依赖图分析器 + import lint | `pnpm lint` | 仅白名单桥接层 |
| 注释默认删除 | 注释会过期，且可以成为逃生通道 | `/no-comments` + Comment Sicko | `/no-comments the diff` | 五类 keep-list |

原文的要求是：

> “If the rule was already there and nothing enforces it, that's a repeat, so fix it at the highest level in the same change. Drop a rule once its mistake can't happen.”

中文：**如果规则早就写了却没有任何执行者，它本身就是一次重复错误，必须在同一次修改里升级；当某类错误已经不可能发生时，删除旧规则。**

这避免两个极端：

- 规则越写越多，`AGENTS.md` 变成没人执行的愿望清单；
- 旧规则永远不删，agent 把过时约束也当成真的。

如果某个判断确实无法编码，`encode-lessons-in-structure` 要求提高指令的显著度，并补一个失败模式的例子，而不是继续堆抽象原则。

来源：[principle-encode-lessons-in-structure/SKILL.md L7-L11](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/principle-encode-lessons-in-structure/SKILL.md#L7-L11)

### 8.10 这套方法的完整执行顺序

把上面的细节压成一条可执行链：

```text
1. 从 commit / revert / review / AGENTS.md / workaround 注释里收集错误
2. 归一化成错误类别；同类至少发生两次才升级
3. 先问能否用架构或类型消除
4. 仍能编译通过，就写 lint / CI check
5. 报错信息直接给出替代文件、类型、函数或 API
6. 对存量违规做 baseline，只阻止新增
7. 用真实历史错误证明规则会失败
8. 本地和 CI 跑同一个命令
9. 例外写在出错行：reason + expiry + human approval
10. 在 agent instruction file 里维护“规则 ↔ 执行者”表
11. 错误已经不可能发生时删除规则
```

其中第 1-3、7-10 步都能在公开 `pstack` 的 `/correct` 和 `no-comments` 文档里直接核实；第 4-6 步的具体实现因仓库而异，上面给的是忠实于该策略的工程化落法，不是 Grok Bot 的原始源码。

### 8.11 证据边界：不能伪造她的 ESLint 配置

截至固定 commit `6e359ce0aba9e927914d8a940510aa2ef66a8f23`，在公开 `pstack` 目录中检索 `eslint`、`biome`、`oxlint`、`dependency-cruiser`，没有发现对应的配置文件；两个 `package.json` 也只有测试和 typecheck 脚本，没有 lint 脚本。

可检查的仓库树：

- <https://github.com/cursor/plugins/tree/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack>

因此必须区分三类事实：

| 类别 | 能确认什么 | 不能确认什么 |
| --- | --- | --- |
| 演讲 | 她确实说产品代码禁用 `useEffect`、目录边界由依赖图分析器和 lint 禁止、注释默认删除、timers 是反模式 | 没有给出规则名、配置文件和完整 selector |
| `pstack` | `/correct` 的发现、分级、证明、例外、规则表流程；`/no-comments` 的具体 keep-list | 没有 Grok Bot/Dune 的真实 ESLint、Biome 或依赖图配置 |
| 本文代码块 | 如何用等价 ESLint 写法实现这些策略 | **不是她的原始配置，不能反过来当成她说过的话** |

这就是“有事实依据”的边界：**方法论和部分案例可以逐条溯源；具体 rule 名称、内部路径和 99% 的精确统计不能。**

---

## 9. 全量方法论落地手册

第 7、8 章已经把 verification、statechart、swarm、lint 做了源码级拆解。这一章补的是演讲中其余容易被一句带过的部分，并把它们接成一条真正能执行的工程路线。

证据仍然分三层：

1. **演讲直接事实**：有时间戳和原话/近原话。
2. **公开实现**：在固定 commit 的 `pstack`、示例仓或 Bombadil 官方仓库里能打开对应文件。
3. **复刻方案**：公开资料没有给出 Grok Bot 的内部实现，我按可核验的公开接口重建，并明确标注“不是她的原始系统”。

### 9.0 演讲方法论全景

| # | 方法论 | 演讲位置 | 公开可核验的实现 | 本文位置 |
| --- | --- | --- | --- | --- |
| 1 | 信任来自 agent 环境，不是盲信模型 | 1:02:56-1:04:23 | `/correct` 的约束优先级 | 3.1、8.2 |
| 2 | 代码库是最大输入，要像花园一样保持干净 | 1:04:25-1:06:19 | `migrate-callers`、`subtract-before-add`、`sequence-verifiable-units` 原则 | 9.1 |
| 3 | 需要大量 nuance 的 API 是 slop 温床 | 1:06:50-1:07:34 | 产品代码禁 `useEffect` 的公开案例 | 8.2、8.3、9.1 |
| 4 | 用目录、API、类型、lint 让 agent 默认做对 | 1:07:34-1:10:32 | `/correct` + Dune/Electron 案例 + lint 工作流 | 第 8 章 |
| 5 | 每次纠正都转成确定性检查 | 1:10:34-1:11:01 | `/correct` 的发现、分级、证明、规则表 | 第 8 章 |
| 6 | Runtime verification：Feature Map + 自定义 CLI + CDP + 证据 | 1:11:04-1:12:14 | `create-verification-skill`、`maintain-verification-skill` | 7.1、9.2 |
| 7 | Formal verification：TLA+ 检查流程，Lean 证明算法 | 1:12:14-1:12:59 | 两个 formal verification skill；statechart | 7.2、9.3 |
| 8 | Property-based UI testing | 1:12:59-1:13:15 | Antithesis Bombadil 官方仓库 | 9.4 |
| 9 | 验证是新的主要成本，也是新的产能 | 1:13:17-1:14:18 | `prove-it-works`、`benchmark-checklist` | 9.5 |
| 10 | Code review 从读代码转向读证据 | 1:11:13-1:11:25 | PR 的 `## Verification` 契约 | 9.5、9.6 |
| 11 | 夜间运行 / 持续内循环 | 1:03:09-1:03:18、1:16:35-1:17:13 | Autonomous run、Overnight contract、decision log | 9.7 |
| 12 | 发布级自动 fuzz、自动开修复 PR、自动合并 | 1:17:31-1:18:16 | 公开组件只有部分对应；`autopilot-full` + benny + Bombadil | 9.8、9.9 |
| 13 | 用吞吐、revert、性能、贡献者数量共同看质量 | 1:14:56-1:16:33 | `benchmark-checklist` 的七问 | 9.10 |
| 14 | prose/rule/skill 只处理无法结构化的判断 | 1:04:12-1:04:20 | `encode-lessons-in-structure` | 3.1、8.2、8.9 |

### 9.1 代码库“花园化”：把可复制反模式清掉

她的判断很直接：agent 从输入里学习，而代码库是最大的输入。旧 workaround、反模式、废弃代码看起来像“仓库里已经成立的写法”，于是会被下一个 agent 复制，像杂草一样扩散。

> “you want to make your codebase as pristine as possible so that agents are always copying the good stuff.”

来源：[演讲 1:04:25-1:06:19](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=3865s)

`pstack` 把“agent 会复制最近例子”写成了一个设计前提：

> “Assume every contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles.”

中文：假设每个贡献者都是 agent，它只看见自己打开的文件，复制最近的例子，并选择一条能编译的最短路径。

来源：[correct/SKILL.md L9-L11](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/correct/SKILL.md#L9-L11)

这句话可以变成一个很实际的设计测试：**一个新 agent 只打开这个目录，最可能抄哪条路？如果那条路是错的，目录和 API 就还没设计好。**

#### 9.1.1 先冻结新增，再清理存量

她在结尾把顺序说得非常具体：

> “start with a lint rule to prevent new occurrences of anti-patterns and then clean up those old patterns as well and then make sure that your verification story is really strong.”

中文：**先用 lint 阻止新的反模式，再清理旧模式，然后把验证做好。**

来源：[演讲 1:16:35-1:16:56](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4595s)

这是最现实的迁移顺序。先清存量会让同一个 agent 在清理过程中继续制造新实例；先加严格全仓门禁又会因为存量太多而无法合并。正确顺序是：

```text
发现反模式
  -> 加检查，冻结新增
  -> 用 baseline 接受历史欠账
  -> 迁移调用者
  -> 删除旧 API / 旧路径
  -> 收紧 baseline，直到清零
  -> 用 verification 证明行为没退化
```

#### 9.1.2 一次迁移的具体执行步骤

以“旧 repository API 仍被大量直接调用”为例，我会按下面的顺序落地；这不是她某条私有脚本的原样复刻，而是把她的“花园”方法与公开原则接起来：

1. **建立反模式清单。** 用搜索和事故史找出真实调用点，不用凭印象列。
   ```bash
   rg -n "legacy|deprecated|workaround|TODO|FIXME" .
   rg -n "@ts-ignore|@ts-expect-error|eslint-disable" .
   git log --grep="revert" --oneline -n 100
   ```
2. **归类并计数。** 同一错误至少出现两次才升级成规则；一次例外先记录，不急着全仓改造。
3. **冻结新增。** 加 lint、类型或 CI 检查；历史违规进 baseline，先阻止“这次改动又多加一个”。
4. **迁移调用者。** 把调用方改成新 API，同时把测试改成断言新契约。旧测试如果只保护旧实现细节，直接删除。
5. **同一波删除旧 API。** 没有外部兼容义务时，不保留一层永远没人敢删的 compatibility shim。公开原则明确要求“migrate callers and delete the old API in the same wave”。
6. **先减后加。** 在搭新抽象前先删死代码、重复 validator、stub 和无使用证据的 speculative guard。
7. **逐单元验证。** 每个迁移单元都先记录 known-good 状态，做一个改动，跑一次真实检查，再进入下一个；不要在最后一次性验证整批。
8. **最后收紧 baseline。** 旧调用点为零后，把旧 API 和对应 baseline 一起删掉，防止未来重新长回来。

来源：

- [principle-migrate-callers-then-delete-legacy-apis/SKILL.md L7-L13](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md#L7-L13)
- [principle-subtract-before-you-add/SKILL.md L9-L18](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/principle-subtract-before-you-add/SKILL.md#L9-L18)
- [principle-sequence-verifiable-units/SKILL.md L9-L15](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/principle-sequence-verifiable-units/SKILL.md#L9-L15)

完成标准也必须可检查：

| 检查项 | 通过条件 |
| --- | --- |
| 调用方 | 旧 API 的调用点为零，而不是“只剩几个特殊地方” |
| 旧实现 | 旧 API、旧路径、旧兼容层已删除；不是只标记 deprecated |
| 新检查 | 再写一次旧模式会让 CI 失败 |
| 测试 | 测试断言新契约；没有测试继续锁死旧实现细节 |
| Baseline | 对应规则的历史例外已删除或只降不升 |
| 行为 | verification skill 在真实 App/CLI 上走完受影响路径，证据可复查 |

#### 9.1.3 “需要 nuance 的 API”是优先治理对象

她说：

> “anything that requires nuance to use well often leads to slop.”

中文：**任何必须靠大量经验和细节判断才能用好的 API，往往会制造 slop。**

来源：[演讲 1:06:50-1:07:00](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4010s)

这给了一个很实用的 API 评审问题：**一个只看当前文件和最近例子的 agent，能不能默认用对？** 如果答案是否定的，按下面顺序处理：

1. 能把误用变成类型错误 → 改类型。
2. 能把复杂判断藏进更窄的 API → 改 API，让调用方只表达意图。
3. 仍然需要很强上下文 → 只允许框架/平台层使用，产品代码用 lint 禁止。
4. 连限制都无法表达 → 写 agent rule，并附一个真实失败例子；这是最后手段。

`useEffect` 正是第 3 类：不是 hook 永远错，而是它需要太多 nuance，于是产品代码禁用，只允许 Dune API 内部使用。

### 9.2 Runtime verification 的生产化 SOP

第 7.1 节已经拆过 `create-verification-skill` 的生成物。这里补的是团队每天怎么用它，避免把 verification skill 当成一次性文档。

#### 9.2.1 一次验证必须交出的东西

一次“已验证”至少包含：

| 项目 | 最低证据 |
| --- | --- |
| 环境 | 从空数据目录启动成功；`doctor` 通过；版本/构建 SHA 对得上 |
| 用户路径 | 从 Feature Map 的某个入口进入，不用内部 setter 或 test-only endpoint |
| 动作 + 终态 | 同一段视频/截图里能看到触发动作和稳定终态，不是只截最后一张图 |
| 副作用 | 文件、数据库行、消息、剪贴板、网络/RPC 中至少验证真正承重的那一项 |
| 失败路径 | 若声称处理了错误，必须实际触发错误并观察恢复行为 |
| 清理 | 本次启动的进程/实例已清理；证据仍在指定路径 |
| 可复查 | PR 里给出命令、Feature ID、证据路径或视频链接 |

这些标准不是“截图越多越好”。核心是 **用用户能触发的动作，证明一个用户能观察到的结果，并验证屏幕之外的承重副作用。**

来源：[create-verification-skill/SKILL.md L23-L32](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-verification-skill/SKILL.md#L23-L32)

#### 9.2.2 Feature Map 是并行验证的接口

`/swarm` 能按 Feature Map 拆 lane，不是因为它懂 App，而是因为 Feature Map 已经把“用户能到达什么、怎么驱动、什么算成功”写成了统一接口。没有它，多 agent 只能各自猜“左边那个按钮”。

落地时先做 3–5 个最重要的用户可见 feature，不要一开始追求全覆盖。每个 feature 文件只回答四件事：

1. 它有哪些子行为；
2. 用户从哪些入口到达；
3. agent 用哪条精确命令驱动；
4. 哪些坑会让这次验证无效。

维护循环应至少每天或每次大改后跑一次；它只能产出 `clean`、`changed`、`blocked`，且不能改产品代码。App 行为坏掉时报告回归，不能改 Feature Map 掩盖。

来源：[maintain-verification-skill/SKILL.md L9-L37](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/maintain-verification-skill/SKILL.md#L9-L37)

#### 9.2.3 控制 CLI 是降低验证成本的杠杆

她明确说自定义 CLI 能复用 driver，减少 token，并且可测试。公开指南把好 CLI 的特征写成了可检查项：

- 少量可组合命令，每条做真实工作；
- destructive 操作支持 `--dry-run`；
- 渐进揭示子命令，不要把全部复杂度一次倒给 agent；
- 错误信息直接说下一步怎么做；
- `--help` 足够完整；
- 输出机器可读，例如 JSON；
- dev 环境一条命令起好，seed data、test user 可重复。

来源：[06-verify-and-ship.md L73-L84](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/06-verify-and-ship.md#L73-L84)

这也是 `principle-build-the-lever` 的具体应用：不要让每个 agent 临时写一遍点击脚本；让它们调用同一个经过验证的 driver。

### 9.3 Formal verification：TLA+ 查时序，Lean 证性质

演讲里有两类 formal verification，不能混为一谈：

- **TLA+**：建模 major user flows，例如跨设备、跨平台的通知流程；模型检查器探索事件顺序。
- **Lean**：证明某些算法性质；她举的是自研 virtualization library 不出现 flickering / jittering。

她说这两类已经抓到 bug，但仍在实验，“不是 silver bullet”，只是 agent 环境里的又一层工具。

来源：[演讲 1:12:14-1:12:59](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4334s)

#### 9.3.1 先选工具，再写证明

`create-formal-verification-skill` 的选型规则很适合直接照用：

| 要回答的问题 | 优先工具 | 原因 |
| --- | --- | --- |
| 事件是否可能以错误顺序发生？ | 小模型 + model checker；TLA+ 是默认 | 检查的是设计与协议，不是某一条执行路径 |
| 代码对每一个输入是否都满足性质？ | 直接跑在代码上的 verifier / SMT-backed verifier | 证明对象是真实代码，不只是一个手写模型 |
| 性质必须在任意 size 下成立，bound 不够？ | proof assistant，例如 Lean | 需要对所有规模做证明，而不是枚举有限状态 |
| 语言没有可用 verifier？ | 对真实代码做 generated-input testing | 不要用“手写模型通过”冒充真实代码通过 |

来源：[create-formal-verification-skill/SKILL.md L17-L19](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-formal-verification-skill/SKILL.md#L17-L19)

一个常见错误是“用 Lean 证了一个和产品代码无关的玩具模型”。公开 skill 对“true to the code”的要求很严格：

- 模型/证明的每一部分都要能指回 reviewer 能打开的代码；
- 模型里当作一个不可分割步骤的动作，在代码里也必须是一个不可分割步骤；
- 名字使用仓库里的真实名词；
- 必须诚实写出 bound、assumption 和没有覆盖的范围。

来源：[create-formal-verification-skill/SKILL.md L21-L29](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-formal-verification-skill/SKILL.md#L21-L29)

#### 9.3.2 TLA+ 的落地链路

对“跨设备通知”这种问题，实际链路是：

1. **把用户承诺写成不变量。** 例如“离线时永远不显示 Synced”“同一通知不会同时处于 Delivered 和 Failed”。
2. **建一个小模型。** 只保留影响该性质的设备、消息、重试、在线状态和事件顺序。
3. **写 config，限定检查范围。** 明确有哪些设备/消息数量、哪些 fairness/constraint。
4. **用 TLC 检查。** 违反时拿最短反例路径。
5. **把反例翻译回真实代码。** 逐步检查模型里的每一步在真实系统能否发生；不能发生就是模型错。
6. **在真实代码中复现。** 只有真实路径能复现，才算产品 bug，而不是把建模错误交给 PM。
7. **用 `/statechart` 生成用户视角 Mermaid 图。** 图从同一个 TLA+ 模型生成，避免“图一套、模型一套”；超过 500 状态预算时只画 bug path。
8. **记录 coverage + sync commit。** 代码改到受验证区域后，必须知道这份模型是否还描述当前代码。

第 1–6 步来自 formal verification skill；第 7 步来自 `/statechart`，其命令、TLC 参数、500 状态预算和反例复现细节已在 7.2 节逐行拆过。

来源：

- [create-formal-verification-skill/SKILL.md L31-L39](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-formal-verification-skill/SKILL.md#L31-L39)
- [statechart/SKILL.md L13-L21](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/SKILL.md#L13-L21)

#### 9.3.3 Lean 的落地链路

公开 `pstack` 没有 Grok Bot 的 Lean 源码、定理或 virtualization 模型。因此不能伪造“她具体证了哪条 theorem”。能确认的是：**Lean 被用于证明自研算法，例子是 virtualization 的 flicker/jitter 性质。**

如果要复刻这一类工作，最低限度的可审计流程是：

1. **抽出纯算法核心。** 把滚动偏移、viewport、item size、overscan 等输入和可见范围计算，从 UI 框架中抽成纯函数/纯模型。
2. **写出“flicker/jitter”的可检查定义。** 不能把自然语言直接丢给证明器；要拆成数学性质，例如：
   - 可见区间没有 gap/overlap；
   - 同一输入得到稳定输出；
   - 相邻 scroll offset 的映射单调；
   - 不出现 A→B→A 的无意义振荡；
   - item 顺序和 key 映射保持稳定。
3. **形式化状态和转移。** 在 Lean 里定义数据结构和纯函数语义。
4. **写 theorem。** 每条 theorem 对应一条用户能理解的性质，而不是只证“函数等于它自己”。
5. **证明并记录假设。** 浮点、边界、size 上限、输入范围都要写清楚。
6. **建立模型—代码对应关系。** 这一步最关键：要么从同一份定义生成代码/模型，要么用 conformance/property tests 证明真实实现与模型在输入域内一致。**只证模型、不证明模型等于产品代码，不能称为产品已证明。**
7. **把证明变成一键检查。** 固定工具版本，保留一个命令；记录覆盖的代码文件和 sync commit。
8. **代码改动后跑 maintain。** 输出 `in sync` / `updated` / `bug` / `blocked`，并区分“验证漂移”和“真实 bug”。

第 6 步是公开 formal skill 的核心要求“true to the code”；第 8 步来自 `maintain-formal-verification-skill`：

来源：

- [create-formal-verification-skill/SKILL.md L21-L29](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-formal-verification-skill/SKILL.md#L21-L29)
- [maintain-formal-verification-skill/SKILL.md L9-L24](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/maintain-formal-verification-skill/SKILL.md#L9-L24)

上面的五条 virtualization 性质是**复刻建议**，不是 Grok Bot 公开过的 theorem 列表。

#### 9.3.4 形式化验证的完成标准

只有同时满足下面几条，才应说“我们有形式化验证”：

| 门槛 | 必须回答 |
| --- | --- |
| 目标 | 具体承诺是什么？坏了对用户有什么伤害？ |
| 工具 | 为什么是 model checker / code verifier / proof assistant？ |
| 真实性 | 模型或 harness 的每一步能指回哪段代码？ |
| 可失败 | 是否故意破坏代码一次，证明检查能抓到？ |
| 范围 | 检查了哪些 bound、假设和排除项？ |
| 反例 | 失败时能否用代码里的步骤复现？ |
| 复跑 | 是否一条命令、固定版本、足够快？ |
| 同步 | 覆盖哪些文件/函数，最后一次确认对应的 commit 是什么？ |

其中“可失败”是 formal verification 最容易被忽略的验收项。公开 skill 的原话是：**一个你从未见过失败的 check，什么也证明不了。**

来源：[create-formal-verification-skill/SKILL.md L23-L25](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-formal-verification-skill/SKILL.md#L23-L25)

### 9.4 Property-based UI testing：把 Bombadil 接到 agent 流程里

她在演讲里说，团队刚开始用 **Bombadil** 做 UI 的 property-based testing，而且已经抓到一些 UI bug。

来源：[演讲 1:12:59-1:13:15](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4379s)

Bombadil 是 Antithesis 的公开项目，不是 `pstack` 自带模块。本文核对的是固定 commit：

- 仓库：<https://github.com/antithesishq/bombadil>
- commit：`85951425e647b382f29e64ab03d2998f165d3d52`

#### 9.4.1 它解决什么问题

普通 E2E 测试写的是“这几个固定步骤应该得到这个固定结果”。维护 Playwright/Cypress/终端脚本的成本高，而且只覆盖作者想到的少数状态。

Bombadil 反过来：你写**一般性质**和**动作生成器**，它随机而系统地探索状态空间，包括意外动作顺序、奇怪时序和遗忘的输入。

来源：[Bombadil 01-introduction.md L8-L49](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/01-introduction.md#L8-L49)

它的大致循环是：

```text
读取当前 UI 状态
  -> 检查所有 property
  -> 依据当前状态选择一个 action
  -> 执行 action
  -> 等待 DOM/导航/输出变化或 timeout
  -> 回到第一步
```

来源：[Bombadil 01-introduction.md L71-L80](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/01-introduction.md#L71-L80)

#### 9.4.2 安装与最短可运行链路

官方支持 macOS/Linux 原生运行，也提供 Docker 和 GitHub Action。Windows 开发机应通过 WSL2/Linux、CI 或 Docker 运行，不要假设有原生 Windows binary。

来源：[Bombadil 02-getting-started.md L3-L9](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/02-getting-started.md#L3-L9)

最短落地：

```bash
npm install --save-dev @antithesishq/bombadil

# 先用默认规范验证工具链能跑；没有 violation 也会产生 trace
npx bombadil browser test --time-limit=1m \
  --output-path=artifacts/bombadil/smoke.run \
  https://your-app.example.com

# 查看 trace、截图和状态转移
npx bombadil browser inspect artifacts/bombadil/smoke.run
```

注意：`--output-path` 指向的是**文件**，不是目录；父目录必须预先存在。

来源：[Bombadil 02-getting-started.md L192-L230](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/02-getting-started.md#L192-L230)

#### 9.4.3 写一个项目规范：property + extractor + action

Bombadil 规范是普通 TypeScript/JavaScript ES module。顶层只能 export **properties** 和 **action generators**；其他值要留在模块内部。

来源：[Bombadil 03-specification-language.md L23-L39](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/03-specification-language.md#L23-L39)

一个官方示例是“通知最多同时出现 5 条”：

```ts
import { extract, always } from "@antithesishq/bombadil";

export * from "@antithesishq/bombadil/browser/defaults";

const notificationCount = extract(
  (state) =>
    state.document.body.querySelectorAll(".notification").length,
);

export const max_notifications_shown = always(
  () => notificationCount.current <= 5,
);
```

这里的三层结构值得记住：

- `extract`：从真实 DOM 中提取随时间变化的 cell；
- `always`：在当前状态和所有未来状态都必须成立；
- `export`：名字会进入 violation 报告，所以要写业务含义。

来源：[Bombadil 03-specification-language.md L155-L241](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/03-specification-language.md#L155-L241)

默认 action/property 集可以先 import，再叠加项目自己的逻辑。浏览器默认集会检查 uncaught exception、unhandled rejection、error log、HTTP 4xx/5xx 等；action 覆盖语义化 HTML 导航和交互。

来源：[Bombadil 03-specification-language.md L80-L140](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/03-specification-language.md#L80-L140)

#### 9.4.4 哪类性质最适合先写

| 性质类型 | Bombadil 写法 | 适合测什么 |
| --- | --- | --- |
| 全局不变量 | `always(() => ...)` | 通知数不超过上限、同一屏不出现两个 modal、列表 key 不重复 |
| 最终保证 | `always(now(precondition).implies(eventually(postcondition).within(...)))` | 提交后 loading 最终消失、错误在 5 秒内消失、保存后出现成功提示 |
| 有上下文的保证 | 外层闭包记住输入，内层 `eventually` 比较 | 输入 name 后通知里必须包含刚才的 name |
| 状态机约束 | `always(unchanged.or(increment).or(decrement))` | counter、wizard、连接状态只能走合法边 |
| 资源泄漏 | `noResourceLeak(...)` | DOM nodes、event listeners、heap 在滑动窗口内异常增长 |

这些例子都来自 Bombadil 官方规范文档，不是 Grok Bot 的私有 spec。

来源：

- [Bombadil 03-specification-language.md L704-L838](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/03-specification-language.md#L704-L838)
- [Bombadil 03-specification-language.md L638-L687](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/03-specification-language.md#L638-L687)

#### 9.4.5 在 CI 和 agent 流程里怎么用

本地跑短测，CI/定时任务跑长测：

```yaml
- uses: antithesishq/bombadil-action@v2
  with:
    driver: browser
    origin: https://your-staging.example.com
    specification: ./bombadil/specification.ts
    time-limit: 5m
    exit-on-violation: true
    output-path: bombadil-output
```

来源：[Bombadil 02-getting-started.md L113-L140](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/02-getting-started.md#L113-L140)

agent 侧应把命令写进项目 skill，而不是每次临时想：

1. 从 Feature Map 选一个承重不变量；
2. 在 `bombadil/specification.ts` 里 export property；
3. 用真实业务 action 驱动，而不是只点随机 DOM；
4. 本地跑 1–5 分钟，出现 violation 后先 `inspect`；
5. 用 `--reproduce` 重放原 trace；
6. 用 `shrink` 把长 trace 缩成最短反例；shrink 目前是 experimental；
7. 修复后用同一规范复跑，并在 PR 里附 trace、最短步骤和修复前后结果。

重放和缩短命令：

```bash
npx bombadil browser test --reproduce=artifacts/bombadil/failure.run \
  https://your-app.example.com bombadil/specification.ts

npx bombadil browser shrink --headless \
  --trace artifacts/bombadil/failure.run \
  https://your-app.example.com bombadil/specification.ts
```

来源：[Bombadil 04-workflows.md L7-L74](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/04-workflows.md#L7-L74)

#### 9.4.6 边界与坑

- **Windows 原生不支持。** 使用 WSL2/Linux、Docker 或 CI。
- **property 仍需要领域判断。** 工具能随机探索，但“什么永远不能发生”必须由人/agent 写正确。
- **action generator 决定探索质量。** 默认点击能发现通用异常，但业务流程需要自定义 action。
- **时间性质要写 bound。** “最终会消失”必须加 `within(...)`，否则可能一直等到超时。
- **heap 指标有 GC 噪声。** 官方建议优先看 DOM nodes 或 event listeners；看 heap 时阈值要高于正常 GC spike。
- **shrink 仍是实验特性。** CLI 和输出格式可能变化，不能把它当稳定协议。
- **公开证据只能证明她“使用 Bombadil”并抓到 bug；她的私有 spec、action 集和 CI 配置没有公开。** 上面的规范和命令是官方用法，不是 Grok Bot 原文件。

### 9.5 验证经济性：把验证当产能，而不是收尾成本

她引用同事 Cindy 的观察：六个月前，团队不信任 agent，是因为 subtle bugs 被合并；补上的关键不是模型，而是 verification process。六个月后，Cindy 说 70% 的 daily token 花在验证上；Lauren 说自己的情况也一致。

来源：[演讲 1:13:17-1:13:46](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4397s)

她还说，这些东西没有一项是全新发明；它们本来就是好的软件工程工具，只是过去理解、编写、维护成本太高。agent 把这些成本大幅降低，所以现在可以对更多东西做测试和验证。

来源：[演讲 1:13:46-1:14:18](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4426s)

#### 9.5.1 不要把 70% 当 KPI

70% 是团队自报，不是一个应该照抄的目标。真正可迁移的原则是：**验证应该有独立预算，并且用证据质量衡量，而不是用“测试跑过了”衡量。**

如果要仪表化，建议在 agent 运行层按阶段打标：

| 阶段 | 记录什么 | 用途 |
| --- | --- | --- |
| plan | token、工具调用、产出计划 | 判断规划是否过度 |
| implement | token、改动文件数、commit 数 | 判断实现成本 |
| verify | token、真实驱动次数、证据数 | 判断验证投入是否足够 |
| rework | 因验证失败产生的重做 token | 判断内循环质量 |
| review | reviewer 花的时间、被打回的 PR 数 | 判断证据是否可读 |

建议观察的派生指标：

- 每个 merged PR 的 verification token；
- 每个 PR 的平均证据数；
- 一次验证通过率；
- 验证后仍被 revert/回滚的比例；
- 因同一类错误重复返工的比例。

这些是**工程化建议**，不是公开 `pstack` 已经内置的仪表盘。

#### 9.5.2 Reviewer 只看四件事

当 lint、类型、测试和 verification 都跑过之后，人类 review 不应该重新做机器已经做完的事。更有效的顺序是：

1. **意图**：这个 PR 是否在解决正确的问题？`## Why` 和 `## Scope` 是否一致？
2. **风险**：`## Blast Radius` 是否覆盖真正可能坏的路径？
3. **证据**：`## Verification` 是否真的走了用户路径，而不是内部 setter/单元测试冒充 E2E？
4. **取舍**：`## Tradeoffs` 里有没有一个 reviewer 本来会问、但作者已经诚实回答的选择？

代码本身当然要看，但重点转向“这段代码有没有绕过已经声明的约束”，而不是重新抓格式、空值、重复 import 这类可自动化问题。

她说的 code review 收缩成看 verification artifacts，直接对应 `pstack` 的 PR 契约：视频、截图、图、formal verification 结果，而不是只有一句“我测过了”。

#### 9.5.3 失败的验证必须报 inconclusive

公开指南对“完成”的定义很严格：如果检查没跑成，好的回复要说 **inconclusive**，不能把“没证据”说成“通过”。一个自信但没有 artifact 的回复是警告信号。

来源：[06-verify-and-ship.md L9-L27](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/06-verify-and-ship.md#L9-L27)

这条应写进团队的 agent rule：**没有证据 = 未验证；验证没跑成 = inconclusive；只有证据通过 = done。**

### 9.6 PR 交付：从 worktree 到可审查的变更单元

演讲讲的是外循环的规模；公开 `pstack` 把单个 PR 的交付协议写得很细。两者可以这样接：

#### 9.6.1 生成 PR 之前

1. **在 worktree 里工作。** 每个并行任务一个独立 checkout，避免互相污染。
2. **先多提交，再 rebase 成少量有序 commit。** 每个 commit 都应该是未来可独立落地的单元。
3. **先跑 `/deslop` 和 `/no-comments`。** 去掉 narrating comments、死兼容路径、unsupported guards 和无关改动。
4. **用 `/technical-writing` + `/unslop` 写标题、描述和 commit body。**

来源：[opening-a-pr.md L5-L9](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/opening-a-pr.md#L5-L9)

#### 9.6.2 PR 大小与标题

公开 playbook 的建议是“五个窄 PR 胜过一个胖 PR”。每个 commit 是一个 future PR，顺序本身要能讲故事。

标题使用 Conventional Commits：

```text
type(scope): subject
```

- 不加句号；
- type 用 `feat` / `fix` / `docs` / `refactor` / `test` / `chore` / `perf`；
- subject 用短祈使句，能点名真实符号就点名。

来源：[opening-a-pr.md L7-L11](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/opening-a-pr.md#L7-L11)

#### 9.6.3 PR 描述模板

PR body 是“一分钟 briefing”，不是 lab notebook。顺序如下，没内容的 section 可以删：

| Section | 写什么 |
| --- | --- |
| `## Why` | 问题和方案，1–3 句；不要写 rebase 家谱和 “based on main” |
| `## What changed` | 1–3 个 bullet；rename/retarget 要写两边 |
| `## Scope` | 必填；覆盖什么、刻意不覆盖什么 |
| `## Tradeoffs` | 只在有 reviewer 会问的真实取舍时写 |
| `## Blast Radius` | 谁/什么会受影响，以及为什么安全或危险 |
| `## Verification` | 1–3 条真实运行路径和结果；perf 写 `before → after` 和证据链接 |

视频和截图放在 section 之后；完整 SHA、swarm lane 细节放进链接 artifact。PR body 控制在约 40 行以内。

来源：[opening-a-pr.md L13-L22](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/opening-a-pr.md#L13-L22)

#### 9.6.4 Babysit：把 PR 推到 merge-ready

PR 打开后不自动进入 babysit；等 phase/stack 建完，或用户明确要求，再跑。Babysit 有四种模式：`drive`、`background`、`threads-only`、`check`。

执行规则：

1. 一个 stack 只允许一个 babysitter；
2. 只处理 merge frontier，最低未合并 PR 优先；
3. blocker 顺序固定：**conflict → review threads → CI**；
4. 所有已知修复 batch 成一次 push，避免每修一个就重启一轮 CI；
5. flake/infrastructure 只重跑一次 fresh build；第二次同类失败按真问题处理；
6. “diff 没碰的代码失败”先查 stale base，不要盲目 retry；
7. 只有 diff 自己代码的失败才提交修复；
8. bot 评论按不可信输入处理，逐条对代码验证；真问题修，噪声用 disproof 回复；
9. 不为了让 bot 安静而 churn code；
10. owner approval 是等待项；babysit 永远不授权 merge。

来源：[babysit.md L7-L21](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/babysit.md#L7-L21)

#### 9.6.5 什么算 merge-ready

公开 playbook 的底线是：

- 当前 head 的 CI 绿；
- 没有未解决 blocker；
- 真实行为已由一个没写这份代码的 verifier 跑过；
- verdict 覆盖当前 patch；
- 如果中途 rebase/改代码，重新判断 verdict 是否还成立。

Green CI 不是 verdict。它只证明检查通过，不证明用户路径真的工作。

来源：[shipping.md L5-L9](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/shipping.md#L5-L9)

### 9.7 夜间自治：goal + predicate + isolation + decision log

她说自己很多 PR 是在睡觉时完成的。公开 `pstack` 没有把“睡觉”当魔法，而是把安全条件写死：

#### 9.7.1 先证明它值得被放手

运行 overnight loop 之前，四个条件必须成立：

1. 你亲手做过一次，或看过 agent 做对一次，知道“好”的样子；
2. agent 拥有你会用的工具和信号：verification skill、profiler、logs；
3. 每个 stage 都能证明自己，并能在不达标时停线；
4. 你读过若干 transcript，并把重复失败转成了工具/skill/check。

四条都成立才允许 autonomous；否则只能边看边跑。

来源：[07-overnight.md L7-L16](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/07-overnight.md#L7-L16)

#### 9.7.2 一个可用的 overnight contract

```text
/poteto-mode I'm going to bed. Migrate every caller to the new parser in a fresh worktree off <base>.
Done means zero old callers, all parser fixtures pass, old API deleted.
Keep a decision log. Don't ask me before committing.
/loop until done. If you're truly stuck after a few hours, stop and write up why.
```

每一行都对应一个失败模式：

| 行 | 防止什么 |
| --- | --- |
| “I'm going to bed” | agent 停下来等你批准 |
| “Done means ...” | 目标变成 mood，无法判断是否完成 |
| “fresh worktree off base” | 和当前工作区互相污染 |
| “Don't ask me before committing” | 夜间停在可逆操作上 |
| `/loop until done` | 只跑一轮就停 |
| “If truly stuck ... write up why” | 八小时 creative goal reinterpretation |

`/loop` 是宿主的唤醒机制，不是 `pstack` 自带技能。`autonomous-run` 要求先把 exit condition 写成可检查 predicate，再按事件或 heartbeat 唤醒。

来源：

- [07-overnight.md L18-L38](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/07-overnight.md#L18-L38)
- [autonomous-run.md L3-L13](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/autonomous-run.md#L3-L13)

#### 9.7.3 每次迭代只做一件可验证的事

公开 loop 的形状是：

```text
检查 finish condition
  -> 做最小的 justified change
  -> 在真实 artifact 上验证
  -> 有进展则 commit，无进展则 discard
  -> 记录一行 decision
  -> 回到检查
```

“plateau is not a stop”：遇到平台期应换方法，不是降低 predicate。真正的 dead end 才停，并写清为什么。

来源：[07-overnight.md L42-L56](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/07-overnight.md#L42-L56)

#### 9.7.4 decision log 是最小审计接口

每行至少记录：

| 字段 | 含义 |
| --- | --- |
| time | 何时做的决定 |
| phase | 当前处于哪个阶段 |
| decision | 做了什么选择 |
| reason | 为什么这样选 |
| evidence | 指向命令输出、截图、trace、视频或日志 |
| result | predicate 前进了、没动、还是失败 |

默认写到 `decisions.tsv`；多个 run 共用目录时写 `.audit/<task-slug>.tsv`。只有 ambition 大到 reviewer 必须靠 trail 才能信任结果时，才提交这个日志。

早上不要重读整晚 transcript；先看 Attention section，再抽查它指向的 decision rows。

来源：[07-overnight.md L58-L68](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/07-overnight.md#L58-L68)

#### 9.7.5 夜间运行的停止条件

必须明确写：

- predicate 达到；
- 发现真实 dead end，写清尝试过什么；
- 需要不可逆操作；
- 需要产品/偏好决策，实验无法解决；
- 用户明确 stop / pause。

“work on this for 4 hours”不是 finish condition。时间只能决定何时重新检查，不能决定何时算完成。

### 9.8 Autopilot：谁能写代码、谁能给 verdict、什么能合并

这是公开 `pstack` 最接近演讲“自动合并”的部分，但它比“让 agent 自己合并”严格得多。

#### 9.8.1 角色分离

核心句：

> “You own the verdicts, never the PRs. One owner carries each PR from build to merge, and nothing merges until your swarm, which never wrote the code, has proven the code that lands.”

中文：**root 拥有 verdict，不拥有 PR；每个 PR 有一个 owner 从 build 跟到 merge；只有没写过这份代码的 swarm 证明通过，才允许合并。**

来源：[autopilot-full.md L3](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/autopilot-full.md#L3)

角色分工：

| 角色 | 能做什么 | 不能做什么 |
| --- | --- | --- |
| owner | 写代码、开 PR、修 CI、按 verdict 合并 | 给自己的代码出最终 verdict |
| verifier / swarm lane | 在独立环境重跑 gate、走真实 surface、审 diff | 写被验证的代码 |
| root / coordinator | 分派 owner、审 receipts、守 operator gate | 代替 owner 写 PR |
| operator | 给 queue/grant、处理不可逆决策、最终 countersign | 被 agent 绕过审批 |

#### 9.8.2 完整执行顺序

1. **operator gate 先于一切。** grant 只覆盖 queue 内项目；queue 外的 PR 停在 merge-ready。
2. **每个 PR 一个 owner。** owner 是独立 cloud agent，早开 PR 让 CI/bot 并行跑。
3. **code-ready 前先清 slop。** 跑 `/deslop` 和 `/no-comments`，然后 rebase 到当前 trunk，报告 code-ready head。
4. **full swarm 只跑一次。** 在 code-ready SHA 上并行跑独立 verifier；每个 lane 重跑 gate、通过 control skill 在真实 surface 证明承重行为、审 diff。
5. **没有 live lane 的 verdict 不算 clean。** 只有静态检查或读 diff 不够。
6. **owner 只能在验证过的 patch 上合并。** 合并前要确认它落在的 trunk 仍然匹配；如果 trunk 改了依赖/调用者，重新跑受影响检查。
7. **任何放宽 gate 的动作要 countersign。** 提高预算、加 allowlist、禁用/软失败检查，都要 verifier 证明 + root 重新批准。
8. **停止时 zero-writes。** operator 说停，所有 owner 停止写，报告状态，等 release。

来源：[autopilot-full.md L5-L23](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/autopilot-full.md#L5-L23)

#### 9.8.3 什么时候重跑 full swarm

| 变更 | 验证要求 |
| --- | --- |
| 新行为、重新设计、大 diff | 新 head 上重跑 full swarm |
| rebase、merge conflict、minor fix | 新 head 上至少一个 fresh verifier |
| 纯文案改动 | 不跑 |
| 同一 patch 只改测试/文档/lint 配置 | 用 `git patch-id` 判断旧 verdict 是否覆盖 |
| 新 head 有任何代码变化 | 重新跑 CI；旧 verdict 不自动覆盖新 head |

来源：[autopilot-full.md L5](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/autopilot-full.md#L5)

#### 9.8.4 Autopilot-stack：验证但不合并

如果团队还没准备好让 agent 合并，使用 `autopilot-stack`：跑同一套 owner + verifier 流程，但停在“每个 PR 当前 head 已验证且 CI 绿”，把 PR 交给人类。

这是从“agent 写代码”过渡到“agent 合并代码”的安全中间态。公开 playbook 明确：handoff 后没有 operator 的 go，不允许再 push。

来源：[autopilot-stack.md L1-L8](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/autopilot-stack.md#L1-L8)

#### 9.8.5 公开 autopilot 与演讲 automerge 的差别

演讲说的是：发布后自动 fuzz，发现 bug 自动开修复 PR，甚至 automerge。

公开 `autopilot-full` 能自动合并，但不是“fuzz 出 bug 就直接合”：

- 必须有独立 live verifier；
- 必须审 receipts；
- 必须当前 head CI 绿；
- 必须落在实际 trunk 上验证过；
- 放宽 gate 必须 countersign；
- operator gate 仍然优先。

所以**不能把演讲里的 automerge 简化成“CI 绿就合”**。公开材料支持的是“有证据的受控自动合并”，不是无条件自动合并。

### 9.9 发布触发的外循环：从 release 到确认 bug、修复和受控合并

这是整场演讲里最容易被截成一句标题、也最容易被误读的部分。她在结尾给出的是一条**发布后自动运行、自动找 bug、自动修复**的外循环。先把演讲事实和公开可复刻件分开，再给一条可以真正上线的实现。

#### 9.9.1 演讲里到底承诺了什么

她的原话是：

> “whenever we cut a new release now, Grokbot will automatically spin up a new cursor project for us that will fuzz the entire application, the entire build, and it will find bugs by running the app and using it like a real user. And then it's going to open fixed PRs for each of those bugs that it finds and it's going to automerge it as crazy as that sounds. And that's because our code base is good enough that pull requests tend to just be good by default.”

中文：**每次切新 release，Grok Bot 自动创建 Cursor project，fuzz 整个应用和构建产物；像真实用户一样运行 App 来发现 bug；为每个 bug 开修复 PR，并自动合并。她给出的理由是代码库已经足够好，PR 默认就倾向于正确。**

来源：[演讲 1:17:31-1:18:16](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4651s)

这段直接确认了六件事：

| # | 演讲直接事实 | 不能从这句话推出什么 |
| --- | --- | --- |
| 1 | 触发器是“cut a new release” | 不知道是 tag、构建完成、CI 成功还是人工按钮 |
| 2 | 每次 release 创建一个新的 Cursor project | 不知道 project 的模板、权限和资源上限 |
| 3 | fuzz 的是整个 application / build | 不知道使用的是 Bombadil、随机点击、录制回放还是内部工具 |
| 4 | bug 通过“像真实用户一样运行 App”发现 | 不知道具体 feature map、账号、fixture 和属性 |
| 5 | 每个 bug 自动开修复 PR | 不知道是一个根因一个 PR，还是一个 trace 一个 PR |
| 6 | 修复 PR 会自动合并，且多数产品代码不再需要深度人工 review | 不知道 automerge 的具体 gate、风险分层和回滚机制 |

**最重要的边界：公开 `pstack` 没有给出 Grok Bot 这条 release→fuzz→automerge 流水线的配置。** 固定 commit 的公开目录里能查到 `benny` 的“Slack 报告→复现→draft PR”流程、`autopilot-full` 的“owner + 独立 verifier + 受控 merge”流程，以及 Bombadil 的属性测试，但没有 release 事件绑定、fuzz lane 编排和她的 automerge 策略文件。

可检查的公开目录：

- [pstack/automations](https://github.com/cursor/plugins/tree/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/automations)
- [pstack/skills/poteto-mode/playbooks](https://github.com/cursor/plugins/tree/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks)

#### 9.9.2 公开实现能拼到哪一步

| 公开件 | 能证明的能力 | 缺少的发布级连接 |
| --- | --- | --- |
| `benny` | 从外部报告触发；等待可信 triage；在真实 UI 复现两次；证据化修复；只开 draft PR | 触发源是 Slack 报告，不是 release；明确禁止 merge/deploy |
| `autopilot-full` | 每个 PR 一个 owner；独立 swarm 在 code-ready SHA 上验证；当前 head CI 绿；operator gate；受控 merge | 没有“release 后自动 fuzz 全 App”的事件和 fuzz 结果输入 |
| `autopilot-stack` | 同一套 owner/verifier 流程，但停在已验证、不自动 merge | 不能证明她的 automerge 已经成熟 |
| Bombadil | 属性测试、动作生成、状态探索、trace、截图、shrink | 官方没有给出“release 事件→批量 lane→逐 bug PR”的编排 |
| `07-overnight.md` | 事件驱动自动化可以启动维护流水线；每个 stage 都能停线；每个 stage 必须交证据 | 示例是问题 triage/reproduce/fix/verify，不是发布后全量 fuzz |

`benny` 的安全边界写得非常明确：

> “Open a draft pull request. Never merge or deploy from this workflow.”

来源：[reproduce-and-fix-issues/SKILL.md L284-L291](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/automations/benny/skills/reproduce-and-fix-issues/SKILL.md#L284-L291)

它的触发也不是 release：

来源：[FOR_AGENTS.md L16-L24](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/automations/benny/FOR_AGENTS.md#L16-L24)

而 `autopilot-full` 允许 merge，但不是“fuzz 出 bug 就合”：

> “The owner merges only what you verified, tested on the trunk it lands on. Green CI alone never authorizes a merge.”

来源：[autopilot-full.md L17](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/autopilot-full.md#L17)

所以公开材料能支持的结论是：**她的组件都存在，公开件也覆盖了其中大多数安全机制；但她那条“每次 release 自动全量 fuzz、逐 bug 修、直接 automerge”的具体编排，只能算演讲自述，不能冒充公开源码事实。**

#### 9.9.3 一条可信的发布外循环

下面是复刻方案。它不是 Grok Bot 内部实现，但每一段都能映射到上面可核验的公开能力。

```text
release.published
  -> 锁定 release artifact 和 source SHA
  -> 创建隔离的 verification project
  -> 启动/doctor/记录基线
  -> 按 Feature Map 分成并行 fuzz lanes
  -> 收集 property violation + trace + media + logs
  -> 去重、分类、两次真实 UI 复现
  -> 一个根因一个 bug owner
  -> 最小根因修复 + 回归属性
  -> 未写代码的 verifier 在 patched artifact 上复跑
  -> 默认 draft PR；满足成熟度 gate 才 automerge
  -> 灰度/指标/回滚；把逃逸问题转成确定性检查
```

关键不是“多开几个 agent”，而是四条隔离：

1. **artifact 隔离**：fuzz 的对象必须是 CI 产出的 release artifact，而不是某个 agent 从源码随手 build 的版本。
2. **环境隔离**：每个 lane 独立 profile、端口、数据目录、账号和 fixture；禁止写生产。
3. **写权限隔离**：发现 bug 的 lane 只读；只有 bug owner 能改代码；verifier 不能改被测 patch。
4. **决策隔离**：owner 不能给自己的 patch 出最终 verdict；operator 不能绕过风险 gate。

这四条分别对应公开 `benny` 的“fail closed + 真实 UI + 只读证据”、`autopilot-full` 的“owner/verifier 分离”和 Bombadil 的“每次新环境探索”。

#### 9.9.4 release envelope：先让输入无歧义

自动化最容易死在“拿到了一个 tag，但不知道它对应哪个构建”。每次触发都先生成并持久化一个 release envelope：

```json
{
  "schema_version": 1,
  "release": {
    "tag": "v1.42.0",
    "channel": "stable",
    "source_sha": "0123456789abcdef0123456789abcdef01234567",
    "published_at": "2026-11-13T08:00:00Z",
    "previous_known_good": "v1.41.3"
  },
  "artifact": {
    "platform": "darwin-arm64",
    "url": "https://artifacts.example.invalid/app/v1.42.0.dmg",
    "sha256": "sha256:...",
    "signature_verified": true,
    "build_id": "build-8842"
  },
  "environment": {
    "image": "release-verification@sha256:...",
    "account_fixture": "e2e-standard",
    "feature_flags": "release-defaults",
    "network_profile": "controlled",
    "seed": 20261113
  },
  "policy": {
    "mode": "draft_only",
    "max_parallel_lanes": 8,
    "fuzz_budget_minutes": 45,
    "fix_budget_minutes": 90
  }
}
```

上线时的硬校验：

- artifact 的 `sha256` 必须和构建系统记录一致；
- artifact 必须能追溯到 `source_sha`，同一 tag 出现不同 digest 直接停线；
- `signature_verified` 为 false 时不允许在共享机器运行；
- 环境、fixture、flag、seed 必须进入证据目录；
- 上一次 known-good 必须存在，否则没有回滚基线；
- envelope 缺字段时 fail closed，不要用“默认值”猜。

`benny` 已经证明这种设计是公开实践：配置、control adapter 或 feature map 任一缺失就 fail closed；证据和 token 不进入源码；control adapter 必须证明当前窗口就是目标 App，而不是相似窗口或生产实例。来源：[control-adapter.md](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/automations/benny/skills/reproduce-and-fix-issues/references/control-adapter.md)。

#### 9.9.5 发布 fuzz 的 12 步 SOP

| 步骤 | 具体动作 | 产出 | 通过条件 | 失败动作 |
| --- | --- | --- | --- | --- |
| 1. 接收 release | 校验 tag、SHA、digest、签名、channel | `release.json` | 全部可追溯 | 拒绝启动并通知 release owner |
| 2. 建 project | 每个 release 一个新 project，绑定固定 commit 和 artifact | project id | 无跨 release 写冲突 | 不启动 lane |
| 3. 启动环境 | 用 control adapter 启动目标版本，跑 doctor | 启动日志、版本截图 | App、端口、账号、数据目录均匹配 | 报告环境失败，不把启动失败算 bug |
| 4. 建立基线 | 跑 5–10 条关键用户路径和性能 smoke | baseline evidence | 关键路径可完成 | release-blocker |
| 5. 切 lane | 按 Feature Map 划分表面；每个 lane 一个只读 worker | lane manifest | 覆盖所有高风险 feature | 标记未覆盖，不宣称“全量” |
| 6. 跑属性测试 | 固定 seed + 随机 seed；记录 property、动作、trace | trace + violation | 有可重放 trace | 保留 artifact，lane 停止 |
| 7. 去重 | 按 property + 动作序列 + 根因指纹合并 | bug cluster | 一个根因一个 cluster | 不把同一 bug 开成十个 PR |
| 8. 真实复现 | 通过真实 UI 把 exact symptom 跑两次；状态检查只读 | 截图、视频、日志、状态值 | 两次出现同一判别性症状 | 转 inconclusive，不修 |
| 9. 根因定位 | 追代码和历史；列竞争假设并逐一排除 | root-cause note | 有运行时证据，不是猜测 | 停在 repro 报告 |
| 10. 修复 | 一个 owner 做最小根因修改；廉价测试先失败再修复 | patch + test | 回归测试 baseline 失败、patched 通过 | 丢弃或重做 |
| 11. 独立验证 | 未写代码的 verifier 在 patched artifact 上复跑同一路径两次 | verdict + receipts | baseline 坏、patched 好、blast radius smoke 通过 | 不合并 |
| 12. 交付/监控 | 默认 draft PR；过 gate 才 merge；灰度并观察指标 | PR + rollout record | 回滚可用、指标正常 | 回滚并转 incident |

第 8 步不是可选项。公开 `benny` 把“同一判别性症状必须通过真实 UI 出现两次”写成 hard safety rule，且明确禁止通过内部状态、DOM 注入或隐藏方法制造症状。来源：[reproduce-and-fix-issues/SKILL.md L25-L32](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/automations/benny/skills/reproduce-and-fix-issues/SKILL.md#L25-L32)。

#### 9.9.6 fuzz lane 怎么切，才算“整个应用”

“fuzz 整个应用”不能等于一个 agent 从首页随机点 45 分钟。可执行的切法是**Feature Map × 属性 × 动作生成器**：

| 维度 | 例子 | 每个 lane 必须写清 |
| --- | --- | --- |
| 用户表面 | 登录、编辑器、聊天、设置、更新 | 用户如何进入；错误表面是什么 |
| 前置状态 | 空数据、已有数据、离线、权限不足、服务超时 | fixture、账号、flag、服务 mock 边界 |
| 属性 | 不崩溃、不丢写、不重复、最终一致、可恢复、无卡死 | property 的自然语言和可执行版本 |
| 动作集合 | click、type、scroll、resize、重启、切会话、断网 | 哪些动作允许，哪些绝不能做 |
| 证据 | trace、截图、录像、日志、只读状态 | 哪些证据能证明判别性终态 |

一个 release 的第一版不需要覆盖所有组合。至少要覆盖：

1. 启动和恢复；
2. 最常用的三条写入路径；
3. 最贵的三条失败路径；
4. 最近 90 天改动最多的两个模块；
5. 过去两次事故的回归表面；
6. 所有会导致数据丢失、权限穿透或无法启动的风险点。

对每一类属性，优先写“用户可观察的规则”，而不是内部实现：

| 属性 | 用户语言 | 典型失败 |
| --- | --- | --- |
| Safety | 任何操作都不应让 App 崩溃或白屏 | 进程退出、renderer crash |
| No lost write | 显示“已保存”后，切走/重启仍能看到内容 | 乐观 UI 成功、实际写失败 |
| Idempotence | 重试一次不应产生重复消息或重复扣费 | 双击提交生成两条 |
| Eventual consistency | 操作完成后，最终状态应稳定到预期 | 永远 loading、状态回滚 |
| Termination | 每个异步流程都应到达成功/失败终态 | 卡在 pending |
| Reversibility | 可撤销操作应能恢复到操作前状态 | undo 只改 UI 不改存储 |
| No duplicate side effect | 重放、重连、切账号不应重复执行副作用 | 重试导致双写 |

这些不是 Bombadil 强制规定的属性；Bombadil 提供的是 `always`、`eventually`、`next`、`extract` 和自定义 action 的表达能力。把一个产品规则写成哪个组合，是项目自己的建模工作。来源：[Bombadil 03-specification-language.md](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/03-specification-language.md)。

#### 9.9.7 失败分类：不要让 fuzzer 的每个报错都变成 PR

每个 violation 进入以下六类之一，分类本身要写理由：

| 分类 | 判定 | 后续 |
| --- | --- | --- |
| `product_bug` | 真实用户路径可重复出现，违反产品规则 | 建 bug cluster，进入修复 |
| `known_bug` | 已有 issue、PR 或明确 owner | 只关联，不重复修 |
| `test_bug` | property 写错、extractor 读错、动作不合法 | 修测试，不计产品缺陷 |
| `environment` | App 起不来、依赖服务坏、fixture 错 | 修环境，不写产品 PR |
| `flake` | 同一 artifact、同一 seed 不能稳定重现 | 限定次数重跑；第二次同类失败按真问题处理 |
| `inconclusive` | 证据不足或无法安全复现 | 保留报告，不声称修好 |

这里可以沿用公开 Babysit 的 flake 规则：基础设施/flake 只重跑一次 fresh build；第二次同类失败按真实问题处理；diff 没碰的代码失败先查 stale base，不要盲目 retry。来源：[babysit.md L7-L21](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/babysit.md#L7-L21)。

去重指纹建议至少包含：

```text
repo + release_sha + feature + violated_property + normalized_action_sequence + root_cause_symbol
```

不要只用错误文本。相同异常可能来自不同根因；同一个根因也可能产生不同堆栈。

#### 9.9.8 修复阶段的最小预算

公开实践要求“bounded fix”，但没有给 Grok Bot 的具体数值。把自己的预算写成配置，不要靠“看起来不大”：

```yaml
fix_budget:
  max_changed_files: 5          # 示例，不是她的参数
  max_net_lines: 200            # 示例
  max_minutes: 90               # 示例
  allowed_paths:
    - "src/**"
  forbidden_paths:
    - "db/migrations/**"
    - "infra/**"
    - "auth/**"
  stop_when:
    - "修复需要改变公共 API 契约"
    - "需要不可逆数据迁移"
    - "无法在真实测试环境复现"
    - "需要关闭或弱化已有检查"
```

预算超限时保留 repro 和根因分析，交给人，而不是继续“顺手重构”。公开 `benny` 也把“根因证据、预算内、baseline 和 patched 都能跑”作为尝试修复的前置条件。来源：[reproduce-and-fix-issues/SKILL.md L226-L238](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/automations/benny/skills/reproduce-and-fix-issues/SKILL.md#L226-L238)。

#### 9.9.9 独立验证与 evidence gate

修复 PR 必须带一条能复算的证据链：

| 证据 | 最低要求 | 不允许的替代品 |
| --- | --- | --- |
| baseline | 同一 release artifact、同一路径、坏状态出现两次 | “我读了代码，觉得会坏” |
| root cause | 代码位置 + 运行时现象 + 已排除的竞争假设 | 只贴异常文本 |
| regression test | 修复前失败、修复后通过；或保留可重放 property | 只跑全仓测试 |
| after | patched artifact 上同一路径跑两次，坏状态消失、预期状态出现 | 编译通过、单元测试绿 |
| side effect | 文件、数据库、消息、网络、剪贴板等只读交叉验证 | 只有一张成功截图 |
| blast radius | 邻近状态、权限、平台、失败路径 smoke | 只验证 bug 那一行 |
| verdict | 未写代码的 verifier 产出 PASS / PASS+NOTES / FAIL | 作者自评、bot 评论、green CI |

公开 `benny` 的原话是：“A compile, unit test, code review, or plausible diff is not after evidence.” 来源：[reproduce-and-fix-issues/SKILL.md L267-L282](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/automations/benny/skills/reproduce-and-fix-issues/SKILL.md#L267-L282)。

`shipping.md` 则把“谁有资格给 verdict”写死：一个 verifier 一个 PR；verifier 必须像用户一样跑 parent 和 head；只有没写代码的 agent 的 verdict 才算；green CI 和 approving bot review 都不算 verdict。来源：[shipping.md L5-L7](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/shipping.md#L5-L7)。

#### 9.9.10 automerge 的成熟度 gate

她的“automerge”不能被实现成“PR 一开就合”。建议把合并权限拆成风险层：

| 风险层 | 例子 | 默认交付 | 允许 automerge 的条件 |
| --- | --- | --- | --- |
| R0 | 文案、纯注释、无行为文档 | 可直接 PR | CI 绿 + 当前 head 可追溯 |
| R1 | 单模块、可逆、无 schema/权限变化 | 默认 draft | 连续成熟期 + 独立 live verdict + 回归属性 |
| R2 | 跨模块、公共契约、状态机、性能关键路径 | 人工 review | 两位独立 reviewer + verifier + benchmark |
| R3 | 认证、权限、加密、支付、迁移、删除、自更新 | 永不自动合并 | 人类 owner + 安全/数据 owner + 回滚演练 |

一个可执行的 automerge gate：

```text
PASS iff
  1. release artifact 和 source SHA 可追溯
  2. violation 通过真实 UI 复现两次
  3. 根因唯一，且 patch 在 fix budget 内
  4. regression property 在 baseline 失败、在 patch 通过
  5. after evidence 覆盖原始症状和关键副作用
  6. 独立 verifier 没有写过该 patch
  7. 当前 head CI 绿，且 merge result 在目标 trunk 上验证过
  8. 变更不触碰 R3，且不在 forbidden_paths
  9. 回滚方式已记录并可执行
 10. 没有任何 gate 被放宽；若放宽，有 verifier proof + operator countersign
```

这与公开 `autopilot-full` 的 merge 逻辑一致：owner 只合并经过 swarm 验证、且在实际落地的 trunk 上测过的代码；green CI 单独不够；放宽 gate 需要 verifier 证明和 root 的 fresh countersign；operator 的 stop 会变成 zero-writes。来源：[autopilot-full.md L3-L23](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/autopilot-full.md#L3-L23)。

**成熟期建议**：先用 `autopilot-stack` 跑 4 周，只验证不合并；再对 R0/R1 开启 merge queue。R2 仍需人类审批，R3 永远不进入自动修复链路。这是复刻建议，不是演讲给出的数值。

#### 9.9.11 夜间/发布运行的停止条件

发布 fuzz 不能无限运行。以下任一条件触发就停：

- 发现 P0：启动失败、数据丢失、权限穿透、更新失败、严重安全/隐私问题；
- artifact 或环境不可信；
- fuzz lane 连续超时或产生无法分类的噪声；
- fix 超预算、触碰 forbidden path、需要 schema/权限变更；
- 两个独立 verifier 结论冲突；
- 需要放宽 gate 才能继续；
- operator 发出 stop / pause。

“跑满 8 小时”不是完成条件。公开 overnight guide 明确说持续时间不是 finish condition，必须给一个能 pass/fail 的 predicate。来源：[07-overnight.md L120](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/07-overnight.md#L120)。

#### 9.9.12 发布闭环的指标

不要只报“找到多少 bug”，这会被噪声和重复计数刷高。至少同时看：

| 指标 | 定义 | 防止什么 |
| --- | --- | --- |
| 每千次动作的独立 violation | 去重后的 violation / 总动作数 | 用重复 trace 冲数量 |
| 确认 bug 率 | `product_bug` / 全部 violation | fuzzer 噪声太高 |
| 重复率 | 发布前已被 issue/回归测试覆盖的比例 | 只测旧问题 |
| 逃逸率 | 发布后 30 天由本次 fuzz 覆盖表面产生的 P0/P1 | 只看 fuzz 数量不看效果 |
| 修复接受率 | merged fix / confirmed bug | 自动修一堆不能合的 PR |
| 误报成本 | 环境/测试/flake 分类耗时 | “零 bug”其实是零有效信号 |
| 回滚率 | 自动修复 PR 被 revert 的比例 | automerge 质量 |
| 单确认 bug 成本 | agent/token/CI/人工总成本 / confirmed bug | 用高成本换低价值 bug |

这些指标应该按 release cohort 计算，并保留 lane、property、surface 的维度，否则无法解释“为什么这个月数字变好”。

### 9.10 指标与反 Goodhart：她报的数字怎么定义、怎么复核

#### 9.10.1 她报告的原始数据

| 她的话 | 时间戳 | 证据等级 |
| --- | --- | --- |
| 上个月个人交付 3,000 个 PR 到 production | 1:02:06-1:02:14 | 自报 |
| 花六个月做到每晚大量 PR | 1:03:09-1:03:18 | 自报 |
| 团队上个月交付 11,000 个 PR 到 production | 1:14:56-1:15:08 | 自报 |
| 稳定版大约每天切一次 | 1:15:12-1:15:18 | 自报 |
| 10 月约 227 人至少贡献一个 PR | 1:15:30-1:15:38 | 自报 |
| PR 回滚率相对下降，稳定在约 0.5% | 1:15:45-1:15:54 | 自报 |
| 启动、输入、打开/切换聊天都比发布时更快 | 1:15:56-1:16:15 | 自报 |

来源：[演讲 1:14:56-1:16:33](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4496s)

她使用的“几个月、约、大约”说明这些是运营观察，不是审计后的 KPI。本文不会把它们升级成“已被独立验证的事实”。

#### 9.10.2 每个指标的精确定义

| 指标 | 建议的分子 | 建议的分母/窗口 | 必须披露的歧义 |
| --- | --- | --- | --- |
| production PR 量 | 被纳入 production stable release 的唯一 PR 数 | 一个自然月；按 `released_at` | opened 不等于 merged；merged 不等于 released；backport 要按 PR 去重；bot PR 单列 |
| 个人 PR 量 | 该作者作为 PR author 的唯一 PR 数 | 同上 | 是否包含 bot 代提交、co-author、backport、revert PR |
| 回滚率 | cohort 中被 revert 的唯一 PR 数 | 同 cohort 的 merged PR 数；观察窗 7/30/90 天 | 直接 revert、整包 rollback、fix-forward 要分开；聚合 revert 要拆到 PR |
| 贡献者数 | `COUNT(DISTINCT author_id)`，至少一个符合条件的 PR | 一个月 | “开过 PR”还是“PR 被合并”；是否排除 bot；co-author 是否单列 |
| 稳定版节奏 | production stable release tag 数 | 自然日/月 | nightly、pre-release、重发同版本、hotfix 是否计入 |
| 性能 | 用户操作端到端 p50/p95 | 同机、同构建、同数据、同并发；至少 5 轮交替 | 冷启动/热启动、数据规模、缓存状态、平台 |

如果目标只是尽量贴近她的原话：

- “11,000 PR to production”应优先解释为**被 production release 收录的 merged PR**；
- “227 people contributed at least one PR”按字面应统计**至少开过一个 PR 的人**，同时另报“至少一个 merged PR”，不要偷偷换成后者；
- “0.5% reverted”按字面是**被回滚的 PR / merged PR**，不是 change failure rate，也不是 bug escape rate；
- “about once a day”应报 release tag 的实际分布和 hotfix 比例，而不是“平均”一个数字。

#### 9.10.3 一套可复算的数据模型

建议至少落这几张事实表：

```sql
fact_pull_request(
  pr_key, repo_id, pr_number, author_id, author_type,
  opened_at, merged_at, base_branch, merge_commit_sha, is_backport
)

fact_release(
  release_key, channel, tag, source_sha,
  released_at, is_stable, is_hotfix
)

bridge_release_pull_request(release_key, pr_key)

fact_revert(
  revert_pr_key, reverted_commit_sha,
  reverted_pr_key, detected_at, revert_kind
)
```

月度 production PR 量：

```sql
WITH shipped AS (
  SELECT DISTINCT b.pr_key
  FROM bridge_release_pull_request b
  JOIN fact_release r USING (release_key)
  WHERE r.channel = 'production'
    AND r.is_stable
    AND r.released_at >= :month_start_utc
    AND r.released_at <  :month_end_utc
)
SELECT COUNT(*) AS shipped_prs
FROM shipped;
```

回滚率：

```sql
WITH cohort AS (
  SELECT DISTINCT b.pr_key
  FROM bridge_release_pull_request b
  JOIN fact_release r USING (release_key)
  WHERE r.channel = 'production'
    AND r.released_at >= :cohort_start_utc
    AND r.released_at <  :cohort_end_utc
),
reverted AS (
  SELECT DISTINCT f.reverted_pr_key AS pr_key
  FROM fact_revert f
  JOIN cohort c ON c.pr_key = f.reverted_pr_key
  WHERE f.detected_at >= :cohort_start_utc
    AND f.detected_at <  :observation_end_utc
)
SELECT
  (SELECT COUNT(*) FROM reverted)::numeric
  / NULLIF((SELECT COUNT(*) FROM cohort), 0) AS revert_rate,
  (SELECT COUNT(*) FROM reverted) AS numerator,
  (SELECT COUNT(*) FROM cohort) AS denominator;
```

贡献者数要同时报两个口径：

```sql
-- 口径 A：至少开过一个 PR（更接近“contributed a PR”的字面）
SELECT COUNT(DISTINCT author_id)
FROM fact_pull_request
WHERE author_type = 'human'
  AND opened_at >= :month_start_utc
  AND opened_at <  :month_end_utc;

-- 口径 B：至少有一个 PR 进入 production（更接近“有效贡献”）
SELECT COUNT(DISTINCT p.author_id)
FROM fact_pull_request p
JOIN bridge_release_pull_request b USING (pr_key)
JOIN fact_release r USING (release_key)
WHERE p.author_type = 'human'
  AND r.channel = 'production'
  AND r.released_at >= :month_start_utc
  AND r.released_at <  :month_end_utc;
```

#### 9.10.4 PR 量和回滚率能说明什么，不能说明什么

| 能说明 | 不能单独说明 |
| --- | --- |
| 交付事务的数量增加了 | 每个 PR 的用户价值增加了 |
| 团队能把更多小改动送进生产 | 系统设计变好了 |
| 回滚动作占 merged PR 的比例 | 没有被回滚就等于没有 bug |
| release 频率 | 发布质量和可恢复性 |

尤其要防止四种 Goodhart：

1. **拆 PR 冲量**：把一个大改动拆成十个机械 PR，吞吐上升但价值不变；
2. **不回滚掩盖 bug**：用 fix-forward 或长期 feature flag 代替 revert，回滚率自然下降；
3. **bot/依赖 PR 灌水**：自动依赖升级和生成代码把作者数、PR 数冲高；
4. **只报相对变化**：没有绝对分母、观察窗和 cohort，就无法判断 0.5% 是好还是坏。

建议的主指标不是 PR 量，而是“用户影响 × 变更安全”：P0/P1 逃逸、change failure rate、回滚率、恢复时间、关键路径 p95。PR 量和 release cadence 只作为产能上下文。

#### 9.10.5 性能数据必须过七问

公开 `benchmark-checklist` 要求在报告任何 speedup/regression 前回答七个问题：

| # | 问题 | 对 Grok Bot 场景的含义 |
| --- | --- | --- |
| 1 | 为什么不能快一倍？limiter 是什么？ | 启动受 Electron 进程、bundle parse、磁盘、扩展初始化限制；不能只说“优化了 React” |
| 2 | 两边都按生产方式调过吗？ | release build、production flags、真实数据规模、冷/热缓存、相同版本 |
| 3 | 有没有突破物理/算术上限？ | 例如只占端到端 10% 的模块，优化到 0 也最多快约 11% |
| 4 | 有没有报错或返回错误结果？ | 快但白屏、丢输入、切错会话都不算优化 |
| 5 | 能复现吗？ | 每边至少 5 次交替跑，报 median + range；差距小于波动就是 no measurable difference |
| 6 | 对用户有影响吗？ | micro benchmark 必须放回启动、输入、切会话的端到端路径 |
| 7 | 工作真的发生在计时区吗？ | 请求真的发出、DOM 真的绘制、消息真的写入；懒执行和超时会产生假数字 |

来源：[benchmark-checklist/SKILL.md L13-L33](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/benchmark-checklist/SKILL.md#L13-L33)

具体到她说“startup、typing、opening/switching chats”：

| 用户动作 | 计时起点 | 计时终点 | 必带上下文 |
| --- | --- | --- | --- |
| 冷启动 | 进程 launch | 输入框可交互且首屏稳定 | 平台、构建、插件、账号、数据目录 |
| 热启动 | 第二次 launch | 同上 | 是否复用缓存、上次退出状态 |
| 输入 | keydown/input event | 字符出现在可见编辑器且无后续 jank | 文本长度、IME、语法高亮/自动完成 |
| 打开新聊天 | 点击 | 新会话可输入 | 网络、模型、历史列表规模 |
| 切换聊天 | 点击目标会话 | 目标 transcript 稳定、滚动位置恢复 | 会话长度、附件、虚拟化状态 |

一个合格报告长这样：

```text
启动（cold，macOS arm64，release build，同一 fixture）
p50: 2.84s -> 2.31s
p95: 3.61s -> 2.92s
7 轮/边，交替执行；after range 2.22-3.08s
limiter: bundle parse + extension init；不是磁盘 I/O
errors: 0/14；每次均到达可输入状态
end-to-end: 该路径占用户首屏等待的主要部分
```

**不能写成**“启动快了 20%”却没有平台、构建、样本数、range、limiter 和错误数。公开 checklist 明确要求：不能命名 limiter、有一边未调优、或无法检查第 4/7 问时，结论必须是 `inconclusive`。来源：[benchmark-checklist/SKILL.md L31-L33](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/benchmark-checklist/SKILL.md#L31-L33)。

#### 9.10.6 一个反 Goodhart 的记分卡

| 维度 | 主指标 | 护栏指标 | 复盘问题 |
| --- | --- | --- | --- |
| 用户结果 | P0/P1 逃逸、关键任务成功率 | crash-free sessions、p95 | 自动化有没有让用户更可靠？ |
| 变更安全 | change failure rate、revert rate、MTTR | 回滚演练通过率 | 失败能不能快速恢复？ |
| 交付速度 | production PR 量、lead time、release cadence | PR 大小分布、review 时长 | 增长来自真实价值还是拆单？ |
| 验证效果 | 独立 verdict 覆盖率、逃逸缺陷数 | 误报率、inconclusive 率 | 验证有没有抓住真问题？ |
| 协作 | 有效贡献者、review 负载 | bus factor、owner 覆盖 | 是否只靠少数人维持？ |
| 成本 | 每合并 PR / 每确认 bug 的 token+CI+人工成本 | 预算超支率 | 产能提升是否经济？ |

落地规则：

1. 每月先冻结指标定义和查询版本，再跑数；
2. 分子、分母、窗口、排除项和 bot 规则全部写进 metadata；
3. 任何比较都必须同 cohort、同 release channel、同平台；
4. 回滚率必须同时报 numerator/denominator 和 7/30/90 天窗口；
5. 性能必须报 p50/p95、轮数、range、limiter、错误数和端到端占比；
6. 每季度抽样审计 20 个 merged PR 和 10 个 revert，人工核对自动映射；
7. 指标只用于学习和发现系统性问题，不直接做个人绩效排名。

这套记分卡是复刻建议，不是她演讲里的原文。她给出的数字只能作为“某个团队在那个时间窗口的自报观察”，不能被当成行业基准。

### 9.11 从 0 到发布自治：一条不会自欺的成熟度路线

下面不是她演讲里逐页展示的“官方成熟度模型”，而是按她的依赖关系重建的落地路线：**先能观察，再能约束；先能验证，再能并行；先能受控合并，最后才让 release 自动找 bug。** 反过来做，通常只是把已有的 slop 自动化得更快。

#### 9.11.1 七个阶段总表

| 阶段 | 目标 | 关键产物 | 进入条件 | 退出条件 | 明确不做 |
| --- | --- | --- | --- | --- | --- |
| 0. Observe | 知道现在坏在哪 | 5 条关键用户路径、错误清单、性能/回滚基线 | 有仓库、测试环境和负责人 | 5 条路径可人工复现；基线可复算；回滚演练通过 | 不改规则、不上 agent 自动修复 |
| 1. Constrain | 让错误默认写不出来 | 架构边界、类型、lint/CI、baseline、规则表 | 阶段 0 完成 | 新违规被阻止；历史欠账不增加；规则用真实错误证明会失败 | 不追求全仓一次清零 |
| 2. Verify | 让 agent 能证明用户路径真的工作 | verification skill、Feature Map、control CLI、evidence gate | 阶段 1 完成 | agent 能独立跑关键路径；seeded fault 被抓到；证据可复查 | 不用单测/截图冒充 E2E |
| 3. Formalize | 对高风险逻辑做模型/性质检查 | TLA+ 或 Lean 项目、property suite、维护 owner | 有明确不变量和高风险表面 | 坏变体失败、真实代码通过；反例能回到真实代码；scope 有记录 | 不对所有代码形式化 |
| 4. Swarm | 写作与 verdict 分离 | lane 计划、独立 verifier、receipts、merge-ready 报告 | 阶段 2 稳定；有足够并行任务 | 独立 verdict 覆盖候选 PR；误报/漏报可度量；无人越权写 | 不自动 merge |
| 5. Autopilot | 在受控范围内自动推进到合并 | operator gate、风险分层、countersign、回滚预案 | 阶段 4 连续稳定；审计通过 | 所有自动合并都有独立 verdict；无 bypass；事故可回滚 | 不碰 R3；不跳过人类 gate |
| 6. Release loop | 发布后自动探索并修复 | release envelope、fuzz lanes、去重、draft PR、受控 automerge | 阶段 5 稳定；属性测试和 triage 有产能 | 连续多个 release 无可归因 P0/P1；误报和成本可接受 | 不宣称“全量覆盖”；不无条件合并 |

#### 9.11.2 阶段 0：先建立可反驳的基线

这一阶段最重要的不是工具，而是**把“我觉得 agent 不太行”变成可检查的现状**。

必须产出：

1. **关键路径清单。** 选 5 条真正影响用户的路，不选 20 条 demo 路径。每条写清入口、成功终态、失败终态、fixture、权限和证据。
2. **错误来源清单。** 从最近 90 天的 commit、revert、review comment、workaround 注释、agent instruction、事故复盘里抽样；按错误类别归并，不按文件归并。
3. **重复性证据。** 同一类错误至少出现两次才进入下一阶段的规则候选；只出现一次的先写成已知风险。
4. **性能基线。** 启动、输入、切会话至少各一条端到端路径；记录平台、构建、数据规模、缓存状态、5 次以上样本和 range。
5. **变更基线。** 最近 90 天的 merged PR、revert、hotfix、incident、回滚时长；必须能回到 PR 和 release。
6. **安全测试环境。** 一次性账号、fixture、数据目录、端口和 artifact 目录；确认不会写生产。
7. **回滚演练。** 从 known-good 恢复一次，记录总时长和人工步骤。

退出条件：

- 另一个人只读文档，也能把 5 条路径跑通；
- 每条路径都有 baseline evidence；
- 错误清单能排出前 5 个类别，并指出每类出现过的真实位置；
- 性能报告能回答 `benchmark-checklist` 的第 4、5、7 问；
- 回滚不是“理论上可以”，而是实际演练过。

这一阶段禁止做两件事：一是直接加一堆 lint，二是直接开 autopilot。没有基线，后面无法判断是变好还是只是变忙。

#### 9.11.3 阶段 1：确定性约束和 ratchet

把阶段 0 的高频错误按公开 `/correct` 的顺序处理：

```text
architecture / API boundary
  -> type system / compiler
  -> lint / CI / dependency graph
  -> tests
  -> documentation / AGENTS.md
```

最小检查集：

| 检查 | 最低实现 | 何时才加 |
| --- | --- | --- |
| 构建/类型 | `pnpm typecheck`、编译器严格模式 | 第一天 |
| 单测/集成 | 受影响的本地测试目标 | 第一天 |
| 架构边界 | import boundary / dependency graph | 同一错误出现两次，且真实跨层发生过 |
| 危险 API | `no-restricted-syntax` 等等价规则 | 规则能指向替代 API，且代理能自动修 |
| 行为回归 | 真实用户路径的 smoke/verification | 有可重复 fixture 后 |
| 自定义脚本 | 只检查一个明确的错误类别 | 现有工具表达不了，且有真实失败样例 |

Ratchet 的最低要求：

1. 存量违规进入 baseline；baseline 只能减少，不能由 agent 自动增加；
2. 本地和 CI 跑同一条命令，CI 不允许 `|| true`、`continue-on-error` 或把 correctness 规则降成 warning；
3. 每条规则在真实历史错误上跑出失败，而不是“配置写了就算”；
4. 例外必须写在出错行，包含 `reason`、`expires`、`approved-by`；
5. 增删规则必须更新“规则 ↔ 执行者”表；
6. 同一错误第二次出现时，优先升级约束层级，不要再写一条更长的 prose rule。

退出条件：

- 至少一条真实规则在修复前失败、修复后通过；
- baseline 数量没有上升；
- 代码里不再有无法追溯到 owner/期限的 suppression；
- 新 agent 只拿最近的一个正确例子，也能通过检查；
- 团队能在一次 review 里解释“这条规则防的是哪次真实错误”。

#### 9.11.4 阶段 2：项目级 runtime verification

这一阶段把“能跑测试”升级为“能证明用户路径”。产物应至少包括：

```text
<agent-config>/skills/verify-<app>/SKILL.md
<agent-config>/skills/verify-<app>/features/README.md
<agent-config>/skills/verify-<app>/features/<feature>.md
<agent-config>/skills/verify-<app>/control-<app>
```

Feature Map 的每条记录要回答：

- 用户怎么到达这个功能；
- 正常、空、loading、error、disabled、selected 等状态怎么进入；
- 用什么稳定 selector/命令驱动；
- 动作完成后看哪个终态；
- 用什么只读状态交叉验证；
- 哪些表面是错误表面；
- 如何 reset 并做第二次独立复现。

最小 PR gate：

| 变更类型 | 必跑证据 |
| --- | --- |
| UI 行为 | 一条成功路径、一条失败/空状态、截图或录像、ARIA/DOM 交叉检查 |
| CLI/TUI | 命令、stdout/stderr、退出码、第二次只读读取 |
| 持久化/写操作 | 写入前后状态、reload/restart 后仍存在、重复提交不重复副作用 |
| 纯文档 | 链接和渲染检查；不假装跑了 App |
| 配置/构建 | 从干净目录启动、版本/端口/doctor 验证 |

退出条件：

- agent 能独立跑至少 3 条关键路径，不需要人补命令；
- 人为注入一个用户可见错误，agent 能发现并给出证据；
- 修复前后使用同一路径、同一 fixture、同一判别性终态；
- 另一个 agent 能只读 skill 复现结果；
- 证据不是“页面打开了”，而是动作 + 状态变化 + 副作用。

公开 `benny` 的 control-adapter 契约可以直接作为验收模板：bring up、drive UI、drive mapped features、inspect state、screenshot、recording、cleanup 七类能力缺一不可；状态检查只读，不能注入症状。来源：[control-adapter.md](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/automations/benny/skills/reproduce-and-fix-issues/references/control-adapter.md)。

#### 9.11.5 阶段 3：形式化和属性测试的窄试点

先选一个“错了很贵、测试又覆盖不到”的点，不要从最容易写 spec 的点开始。

| 问题类型 | 首选工具 | 典型目标 | 不适用 |
| --- | --- | --- | --- |
| 事件顺序、并发、重试、租约、状态机 | TLA+ | 不会双执行、不会丢消息、不会进入非法状态 | 纯 UI 审美、没有明确不变量 |
| 算法性质、边界、数据结构 | Lean 或代码级 verifier | 对所有输入/所有大小成立的性质 | 规格仍在快速变化 |
| 用户界面的长序列交互 | Bombadil | 不崩溃、不丢写、最终状态正确 | 视觉像素、无法自动驱动的表面 |

形式化试点的最低交付：

1. 一句人话性质 + 一句人话危害；
2. 每个模型步骤能指回真实代码；
3. 一个故意破坏的变体必须让检查失败；
4. 真实代码若违反性质，反例必须能重放到测试或 live repro；
5. 记录工具版本、scope、bound、假设和未覆盖项；
6. 记录覆盖文件和最后一次同步 commit；
7. 提供一条可在 CI 里重复运行的命令。

公开 `create-formal-verification-skill` 把“检查必须见过失败”和“pass 只覆盖模型或 bound，不覆盖整个系统”写成硬要求。来源：[create-formal-verification-skill/SKILL.md L17-L39](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-formal-verification-skill/SKILL.md#L17-L39)。

**什么时候不要用形式化**：

- 说不清“永远不能发生什么”；
- 规格每周都改，模型永远追不上代码；
- 变更风险低，现有测试已经很便宜；
- 没有 owner 维护；
- 工具链无法在 CI 复现；
- 模型反例无法回到真实代码；
- 证明成本明显高于事故成本。

退出条件：

- 坏变体确实失败，而不是只证明“能编译”；
- 真实代码通过，且 scope 诚实；
- 反例能被工程师或 PM 读懂；
- 维护命令进入 CI/维护轮；
- 失败时能区分“代码 bug”和“模型 bug”。

#### 9.11.6 阶段 4：独立 swarm，但人类合并

先采用 `autopilot-stack` 的形态：owner 写、verifier 验、流程停在 merge-ready，人类决定合不合。

角色和边界：

| 角色 | 可写代码 | 可给 verdict | 可合并 | 关键约束 |
| --- | --- | --- | --- | --- |
| owner | 是 | 否（自己的 patch） | 否/仅在授权后 | 一个 PR 一个 owner；先开 PR，早跑 CI |
| verifier | 否 | 是 | 否 | 在独立环境跑真实表面；只对自己没写过的 patch 出 verdict |
| coordinator | 否 | 汇总，不替代 | 否 | 分派 lane、审 receipts、处理冲突 |
| operator | 否 | 最终 countersign | 是 | 只处理 queue 内事项；stop 即 zero-writes |
| 人类 reviewer | 否 | 决策 | 是 | 看意图、风险、取舍和证据缺口 |

试点建议：连续两周或 20 个 PR（取较大者），全部走 owner/verifier 分离，但只到 merge-ready。期间记录：

- verifier 发现而作者没发现的真问题数；
- 误报数、漏报数、inconclusive 数；
- 重跑 full swarm 的比例；
- 平均从 code-ready 到 verdict 的时间；
- 证据缺失导致的打回次数；
- 人类 reviewer 实际花在看证据上的时间。

退出条件：

- 所有候选 PR 都有独立 verdict；
- 没有任何 owner 给自己的代码出最终 verdict；
- verdict 明确覆盖当前 head；
- rebase/minor fix 会触发 fresh verifier 或重新判断 patch-id；
- 人类能靠 PR body 和证据在几分钟内判断是否继续看代码；
- 审计抽样没有发现“verdict 说 PASS，但用户路径没跑”的情况。

#### 9.11.7 阶段 5：受控 autopilot 与有限 automerge

进入本阶段前，先满足四个组织条件：

1. 有明确 operator，能处理 queue 外请求、预算放宽和不可逆决策；
2. 有独立 verifier 产能，不靠 owner 兼任；
3. CI、测试环境和 artifact 都可追溯；
4. 回滚演练通过，且有人 on-call。

按风险分层开启：

| 风险 | 自动修复 | 自动合并 | 人工审批 |
| --- | --- | --- | --- |
| R0 文案/无行为文档 | 可 | 可，CI 绿即可 | 抽查 |
| R1 单模块、可逆、无权限/schema | 可 | 成熟期后，有 live verdict | 抽查 |
| R2 跨模块/公共契约/状态机/性能 | 可出 draft PR | 否 | 必须 |
| R3 认证/权限/加密/支付/迁移/删除/自更新 | 默认不允许 | 永远不允许 | 必须，安全/数据 owner 参与 |

开启 automerge 的前 4 周，采用“merge queue + 每日审计”：

- 每个自动合并 PR 记录 owner、verifier、verdict、当前 head、trunk merge result、CI、证据链接、回滚方式；
- 每天抽 3 个自动合并 PR，人工重放至少一条用户路径；
- 每周统计一次误合并、回滚、补丁修正和人工干预；
- 出现一次 P0/P1，自动暂停该风险层的 automerge，直到复盘完成；
- 任何放宽 gate 的动作（提高预算、加 allowlist、禁用检查）必须 verifier proof + operator countersign；
- operator stop 必须传播到所有 owner，变成 zero-writes，而不是“等当前任务跑完”。

退出条件（建议阈值，不是演讲数据）：

- 连续 4 周没有 gate bypass；
- 自动合并候选 100% 有独立 verdict；
- 自动合并 PR 的 revert 率不高于基线；
- 0 个可归因于自动合并的 P0/P1；
- 每日审计抽样通过率 ≥ 95%；
- 所有自动合并都能在 15 分钟内回滚（按团队 SLA 调整）。

#### 9.11.8 阶段 6：release-triggered fuzz

只有阶段 5 稳定后才进入。第一版按三档开启：

| 档位 | 行为 | 开启条件 | 退出条件 |
| --- | --- | --- | --- |
| 6A 观察 | release 后跑 fuzz，只写 report，不修 | artifact/环境可追溯，有 Feature Map | 连续 3 个 release 无环境噪声爆炸 |
| 6B 修复 | 确认真 bug 后开 draft PR，人类合并 | triage/去重/复现有产能 | 自动修复接受率 ≥ 60%，误报 ≤ 10% |
| 6C 自动合并 | R0/R1 修复过 gate 后 automerge | 6B 连续 4 周稳定，回滚演练通过 | 连续 8 周无 P0/P1，revert 不高于基线 |

每个 release 的完成标准不是“跑满时间”，而是：

- 所有高风险 lane 有明确状态：passed / violation / blocked / not covered；
- 每个 confirmed bug 有两次真实 UI 复现和证据；
- 每个 fix PR 有 baseline/after、回归属性、blast radius；
- 每个 automerge 有独立 verdict 和回滚记录；
- 未覆盖项被明确列出，不用“全量 fuzz”掩盖；
- release 结束后把本次逃逸问题转成规则、测试或属性。

#### 9.11.9 30/60/90 天落地表

| 时间 | 主要工作 | 交付物 | 评审 gate |
| --- | --- | --- | --- |
| 第 1-14 天 | 阶段 0：选 App、5 条路径、错误清单、性能基线、回滚演练 | baseline pack | 另一个人能照文档复跑 |
| 第 15-30 天 | 阶段 1：架构/类型优先，新增 1-3 条真实 lint/CI，ratchet + 例外 | rule table、proof runs | 历史错误会失败；baseline 不升 |
| 第 31-45 天 | 阶段 2：verification skill + Feature Map + control adapter | 3 条关键路径的可执行 skill | agent 独立跑通，证据可复查 |
| 第 46-60 天 | 阶段 2 加固 + 阶段 3 试点：TLA+/Lean/Bombadil 三选一或三选二 | 一个窄 scope 的 formal/property 检查 | 坏变体失败，反例可回真实代码 |
| 第 61-75 天 | 阶段 4：owner/verifier 分离，autopilot-stack，只到 merge-ready | 独立 verdict 的 PR 队列 | 连续两周无越权、证据完整 |
| 第 76-90 天 | 阶段 5：R0/R1 小流量 automerge，日报/抽样审计 | merge ledger、rollback drill | 4 周 gate 预演通过；否则回退 |
| 第 91 天以后 | 阶段 6：release fuzz 6A→6B→6C | release report、draft PR、受控 merge | 3 个 release 的误报/成本/回滚达标 |

这是示例节奏，不是固定日历。**任何阶段都应由退出证据推进，而不是因为“已经过了两周”。**

#### 9.11.10 角色与最低投入

| 角色 | 责任 | 不可外包给 agent 的判断 |
| --- | --- | --- |
| Executive sponsor | 预算、跨团队优先级、风险接受 | 是否允许自动合并高风险代码 |
| Platform owner | lint/CI、control adapter、artifact、证据存储 | 工具是否真的可复现 |
| Domain owner | Feature Map、业务不变量、事故语义 | 用户看到的状态是否正确 |
| Verification owner | lane 设计、verifier 轮值、证据审计 | PASS 是否覆盖当前 patch |
| Release operator | queue、gate、countersign、停止/回滚 | 是否可以放宽 gate |
| Security/data owner | 权限、密钥、数据保留、R3 变更 | 自动修复是否触碰不可逆边界 |

一个最小团队配置可以是：platform owner 50%、domain owner 20%、verification owner 30%、release operator 20%，持续 90 天；这是建议值，不是她给出的编制。投入不足时先缩小范围，不要减少隔离。

#### 9.11.11 产物目录

建议把方法变成仓库里能找到的物件：

```text
quality/
  scorecard.md                 # 指标定义、窗口、分母
  error-inventory.md           # 真实错误类别和证据
  rule-enforcement.md          # 规则 ↔ 执行者 ↔ 命令 ↔ 例外
  feature-map/
    README.md
    <feature>.md
  verification/
    SKILL.md
    control-<app>
  formal/
    <property>/
  policies/
    risk-tiers.md
    automerge.md
    release-fuzz.md
  evidence/
    <release>/<lane>/           # 大文件放 artifact store，仓库只放链接和摘要
  decisions/
    decisions.tsv
```

证据目录不应把截图、视频和大日志直接塞进 git；保留 manifest、hash、链接和保留期限，原始 artifact 放受控存储。

#### 9.11.12 三个决策卡

**形式化决策卡**

```text
YES iff
  有一个明确、可写的性质
  AND 违反后果高
  AND 状态空间/输入空间可以建模
  AND 工具能在 CI 复现
  AND 有 owner 维护
  AND 成本低于预期事故成本
```

**Automerge 决策卡**

```text
YES iff
  风险层是 R0/R1
  AND 独立 live verdict 覆盖当前 head
  AND CI 绿且 trunk merge result 已验证
  AND 回归属性 baseline 失败/patched 通过
  AND 回滚可执行
  AND 没有 gate 被放宽
```

**Release fuzz 决策卡**

```text
YES iff
  artifact 可追溯
  AND 环境可隔离
  AND Feature Map 覆盖高风险表面
  AND 有 triage/去重产能
  AND 有安全数据/fixture
  AND 有证据存储和保留策略
```

#### 9.11.13 90 天记分卡

以下是建议的初始阈值，用来防止“只看 PR 量”。组织应根据自己的基线调整：

| 指标 | 建议初始门槛 | 为什么 |
| --- | --- | --- |
| 高风险用户路径覆盖 | Top 10 = 100% | 防止只测容易测的 |
| 证据完整性 | 100% 必需字段 | 没有证据就是未验证 |
| 自动合并候选独立 verdict | 100% | 防止作者自证 |
| lint baseline | 不增加 | 防止边清理边新增 |
| fuzz 误报率 | ≤ 10% | 防止 triage 被噪声淹没 |
| 自动修复接受率 | ≥ 60% | 防止量产不可合并 PR |
| revert rate | 不高于上线前基线 | 防止速度换质量 |
| P0/P1 逃逸 | 0 | 自动化的红线 |
| 关键路径 p95 | 回归 ≤ 5% | 防止性能被吞吐掩盖 |

#### 9.11.14 前 10 个工作日

| 天 | 动作 | 当日产出 |
| --- | --- | --- |
| 1 | 选 App、owner 和 5 条关键路径 | 范围声明 |
| 2 | 建立一次性环境、fixture、artifact 目录 | 可重复启动记录 |
| 3 | 写 control adapter 的 bring-up/doctor/drive/evidence/cleanup | 最小驱动链 |
| 4 | 人工跑 5 条路径并录屏 | baseline evidence |
| 5 | 跑性能基线：启动、输入、切会话 | 带 range 的报告 |
| 6 | 抽样错误来源，归并类别 | 前 5 类错误 |
| 7 | 选一类出现两次的错误，写第一条规则 | 规则 + 失败样例 |
| 8 | 在修复前代码上证明规则失败 | 退出码/命中行 |
| 9 | 修复并证明通过；建立 baseline/例外 | ratchet 记录 |
| 10 | 复盘：哪些能自动化，哪些仍需判断 | 进入阶段 1/2 的决议 |

### 9.12 第 9 章证据账本

这一节把第 9 章所有承重结论压成可审计的表。它不是“文献列表”，而是明确每条结论属于哪一类证据。

#### 9.12.1 证据代码与固定版本

| 代码 | 含义 |
| --- | --- |
| `T` | 演讲直接事实；有时间戳和原话/近原话 |
| `P` | 公开实现；固定 commit 的源码/文档可打开 |
| `S` | 演讲者自报数据；没有独立审计 |
| `R` | 本文复刻/工程建议；不是 Grok Bot 原始实现 |
| `N` | 公开材料中的负证据；例如某个配置确实不存在于公开树 |

固定材料：

- 演讲：<https://www.youtube.com/watch?v=ZZ19zhYnDKY>，主体段落 1:00:20-1:18:35。
- `pstack`：[cursor/plugins @ 6e359ce](https://github.com/cursor/plugins/tree/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack)。
- Bombadil：[antithesishq/bombadil @ 8595142](https://github.com/antithesishq/bombadil/tree/85951425e647b382f29e64ab03d2998f165d3d52)。
- Verification 示例：[poteto/verification-skill-example @ d5abe70](https://github.com/poteto/verification-skill-example/tree/d5abe70d0d8c671672b6cef4069363f26c488feb)。

#### 9.12.2 逐条账本

| ID | 结论/落地细节 | 证据 | 类型 | 已知限制 |
| --- | --- | --- | --- | --- |
| M01 | 代码库是 agent 最大的输入，必须像花园一样保持干净 | [演讲 1:04:25-1:06:19](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=3865s)；[correct L9-L11](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/correct/SKILL.md#L9-L11) | T+P | “花园”是隐喻，不是量化阈值 |
| M02 | 投入优先级是代码约束 > runtime/formal verification > rules/skills/AGENTS.md | [演讲 1:03:27-1:04:23](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=3807s)；[correct](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/correct/SKILL.md) | T+P | 公开实现是 `/correct` 流程，不是内部预算比例 |
| M03 | 修复顺序是 architecture/API → types → lint/CI → tests → docs | `/correct` 的分层；演讲 1:03:27-1:04:48 | T+P | 具体层级名因仓库而异 |
| M04 | 同一错误至少发生两次才升级成耐久规则 | [演讲 1:10:34-1:11:01](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4234s)；`correct` 的重复类别规则 | T+P | “两次”是门槛，不保证规则一定正确 |
| M05 | lint 报错必须给出替代文件/类型/函数/API | 演讲 1:10:20-1:10:32；`correct` repair guidance | T+P | 公开仓库没有她的完整 rule selector |
| M06 | 存量违规用 baseline/ratchet，先冻结新增 | `correct` 的 baseline/exception 流程；本文 8.5 | T+P | baseline 文件格式与实现因工具而异 |
| M07 | 例外必须带 reason、expiry、human approval | `correct`；本文 8.8 | P | 人类审批的具体系统未公开 |
| M08 | 产品代码禁 `useEffect`，Dune 内部例外 | [演讲 1:07:00-1:07:34](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4020s) | T | 没有公开 ESLint/Biome 配置 |
| M09 | `electron/renderer` 不能 import `electron/main`，靠目录/依赖图/lint | [演讲 1:07:34-1:08:20](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4054s) | T | 没有公开依赖图规则文件 |
| M10 | 99% 注释默认删除，少数 keep-list 保留 | [演讲 1:08:20-1:10:16](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4100s)；[no-comments L19-L23](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/no-comments/SKILL.md#L19-L23) | T+P+S | “99%”是口语比例，不是审计数字 |
| M11 | `setTimeout`/rAF/idleCallback 被视为反模式 | [演讲 1:08:49-1:09:44](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4129s)；本文 8.3.4 | T | 字幕没有确认具体禁用规则/selector |
| M12 | Runtime verification 的核心是 Feature Map + 真实驱动 + 证据 + 自证 | [演讲 1:11:04-1:12:14](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4264s)；[create-verification-skill L23-L40](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-verification-skill/SKILL.md#L23-L40) | T+P | 公开示例是虚构 Atlas/Harbor Labs，不是 Grok Bot |
| M13 | 自定义 control CLI 减少 token，并让同一路径可重复 | 演讲 1:11:35-1:12:14；[verify-atlas L13-L104](https://github.com/poteto/verification-skill-example/blob/d5abe70d0d8c671672b6cef4069363f26c488feb/.cursor/skills/verify-atlas/SKILL.md#L13-L104) | T+P | driver 脚本被示例故意省略 |
| M14 | 生成的 verification skill 必须自己跑一遍才算交付 | [create-verification-skill L38-L40](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-verification-skill/SKILL.md#L38-L40) | P | 没有公开她的具体项目 skill |
| M15 | Feature Map 会腐烂，需要 clean/changed/blocked 维护循环 | [maintain-verification-skill L11-L37](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/maintain-verification-skill/SKILL.md#L11-L37) | P | 维护频率由项目自定 |
| M16 | TLA+ 适合事件顺序/用户流程，statechart 把反例转成状态图 | [演讲 1:12:14-1:12:59](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4334s)；[statechart L13-L27](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/statechart/SKILL.md#L13-L27) | T+P | 只检查模型和 bound，不是整个系统 |
| M17 | Lean 用于证明自研虚拟化库不闪烁/不抖动 | 演讲 1:12:14-1:12:59 | T | 公开 `pstack` 没有 Grok Bot 的 Lean 实现 |
| M18 | 工具应由问题选择，而不是所有问题都用 TLA+ | [create-formal-verification-skill L17-L19](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-formal-verification-skill/SKILL.md#L17-L19) | P | 公开流程能选工具，不证明她的内部选择 |
| M19 | 检查必须在故意破坏的变体上失败 | [create-formal-verification-skill L21-L29](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/create-formal-verification-skill/SKILL.md#L21-L29) | P | 是公开方法要求，不是她的私有脚本 |
| M20 | 形式化仍属实验性，不是银弹 | 演讲 1:12:14-1:12:59 | T | 她没有公开成功率/成本数据 |
| M21 | Bombadil 是属性测试/ fuzzing 的 UI 工具 | [演讲 1:12:59-1:13:15](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4379s)；[Bombadil intro L8-L49](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/01-introduction.md#L8-L49) | T+P | 公开材料未给出她的 spec/action 集 |
| M22 | spec 用 TypeScript 导出 properties 和 action generators | [Bombadil intro L53-L80](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/01-introduction.md#L53-L80) | P | 具体 property 完全依赖项目 |
| M23 | 支持 `always`、`eventually`、`next`、`extract` 和自定义动作 | [Bombadil 03-specification-language](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/03-specification-language.md) | P | 时间性质需要 bound，否则可能等到超时 |
| M24 | 官方支持 macOS/Linux；Windows 需 WSL2/CI/Docker | [Bombadil getting-started L3-L9](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/02-getting-started.md#L3-L9) | P | 具体版本/依赖仍会变 |
| M25 | shrink 是实验特性 | [Bombadil 04-workflows L36-L74](https://github.com/antithesishq/bombadil/blob/85951425e647b382f29e64ab03d2998f165d3d52/docs/manual/src/04-workflows.md#L36-L74) | P | CLI/输出格式可能变化 |
| M26 | 验证是新的主要成本，团队约 70% daily token 花在验证上 | [演讲 1:13:17-1:14:18](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4397s) | T+S | 自报观察，不是审计 KPI |
| M27 | 人类 review 从逐行读代码转向意图、风险、证据、取舍 | 演讲 1:11:13-1:11:25；本文 9.5.2 | T+R | “四件事”是本文的整理，不是她的原句 |
| M28 | 没有证据就是未验证；验证失败应报 inconclusive | [06-verify-and-ship L9-L27](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/06-verify-and-ship.md#L9-L27) | P | 公开指南，不是她的内部 KPI |
| M29 | PR 在 worktree 中做，先多提交再 rebase 成有序 commit | [opening-a-pr L5-L9](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/opening-a-pr.md#L5-L9) | P | 具体 forge/分支策略可变 |
| M30 | 标题用 Conventional Commits；PR body 是 40 行以内的一分钟 briefing | [opening-a-pr L11-L22](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/opening-a-pr.md#L11-L22) | P | 团队可调整模板，但不应丢证据 |
| M31 | Babysit 按 conflict → review threads → CI；修复 batch 成一次 push | [babysit L7-L21](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/babysit.md#L7-L21) | P | 依赖 GitHub/Origin 等 forge 能力 |
| M32 | merge-ready 需要当前 head CI 绿 + 未解决 blocker + 独立 verifier 的真实行为证据 | [shipping L5-L9](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/shipping.md#L5-L9) | P | 仍是公开流程，不是她的内部合并记录 |
| M33 | 夜间自治前必须亲手做过一次、工具齐全、stage 能停线、重复失败已转成工具 | [07-overnight L7-L16](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/07-overnight.md#L7-L16) | P | 这是公开 guide 的前置条件 |
| M34 | overnight contract 要 goal、finish predicate、permission、escape hatch | [07-overnight L18-L38](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/07-overnight.md#L18-L38) | P | 具体 prompt 可按工具改写 |
| M35 | 每次迭代只做一个改动、一次验证、一行 decision log | [07-overnight L42-L56](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/07-overnight.md#L42-L56) | P | 决策日志字段应包含 time/phase/decision/evidence/result |
| M36 | 持续时间不是 finish condition，必须有可 pass/fail 的 predicate | [07-overnight L120](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/docs/guide/07-overnight.md#L120) | P | 适合异步/夜间任务，不适合高风险交互任务 |
| M37 | Autopilot 中 root 拥有 verdict，不拥有 PR；owner 不能自证 | [autopilot-full L3](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/autopilot-full.md#L3) | P | 公开 playbook，不是 Grok Bot 的内部组织图 |
| M38 | full swarm 只在 code-ready head 跑一次；rebase/minor fix 至少一个 fresh verifier | [autopilot-full L5-L14](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/autopilot-full.md#L5-L14) | P | “大变更”的判定需团队定义 |
| M39 | operator gate、放宽 gate 需 countersign、stop 即 zero-writes | [autopilot-full L7-L23](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/autopilot-full.md#L7-L23) | P | 需有真实 operator/审计系统 |
| M40 | `autopilot-stack` 验证但停在 merge-ready，不自动合并 | [autopilot-stack L3-L5](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/autopilot-stack.md#L3-L5) | P | 是从人工到自动的安全中间态 |
| M41 | 每次 release 自动创建 project、全量 fuzz、逐 bug 修复、automerge | [演讲 1:17:31-1:18:16](https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4651s) | T | 内部流水线，公开材料没有同等配置 |
| M42 | `benny` 从 Slack 报告触发，只开 draft PR，永不 merge/deploy | [FOR_AGENTS L16-L36](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/automations/benny/FOR_AGENTS.md#L16-L36)；[reproduce SKILL L284-L291](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/automations/benny/skills/reproduce-and-fix-issues/SKILL.md#L284-L291) | P | 公开 benny 不是 release fuzz 流水线 |
| M43 | 真实 UI 复现两次；状态检查只读；无 repro 不修 | [reproduce SKILL L25-L32](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/automations/benny/skills/reproduce-and-fix-issues/SKILL.md#L25-L32) | P | 需要项目自己的 control adapter |
| M44 | autopilot 的 merge 不是 CI 绿就合，必须验当前 patch/trunk | [autopilot-full L17-L19](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/poteto-mode/playbooks/autopilot-full.md#L17-L19) | P | 公开 playbook 能证明门禁形态，不证明她的实际合并率 |
| M45 | 公开 `pstack` 没有 release→fuzz→automerge 的事件配置 | 固定 commit 的 [automations 目录](https://github.com/cursor/plugins/tree/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/automations) | N | 负证据只说明公开树没有，不代表内部不存在 |
| M46 | 她自报个人一个月 3,000 PR、团队 11,000 PR | 演讲 1:02:06-1:02:14；1:14:56-1:15:08 | S | 无原始 PR 数据、去重规则、bot 口径 |
| M47 | 她自报 10 月约 227 位贡献者、稳定版约每日一次、回滚率约 0.5% | 演讲 1:15:12-1:15:54 | S | 未区分 PR 开启/合并、直接 revert/整包回滚 |
| M48 | 她自报启动、输入、开/切聊天变快 | 演讲 1:15:56-1:16:15 | S | 无 p50/p95、样本数、range、limiter |
| M49 | `benchmark-checklist` 要求七问、至少 5 轮交替、median/range | [benchmark-checklist L13-L33](https://github.com/cursor/plugins/blob/6e359ce0aba9e927914d8a940510aa2ef66a8f23/pstack/skills/benchmark-checklist/SKILL.md#L13-L33) | P | 是公开验证协议，不是她的原始性能报告 |
| M50 | 12 步 release fuzz SOP、automerge 风险层、budget 示例 | 本文 9.9 | R | 复刻建议，不是内部实现；数值需按组织基线调 |
| M51 | PR/回滚/贡献者/性能的可复算定义和 SQL | 本文 9.10 | R | 需接入真实 GitHub/发布系统/性能平台后才有数 |
| M52 | 0→6 阶段、30/60/90、角色、证据目录、阈值 | 本文 9.11 | R | 是路线图，不是她演讲中的官方阶段；阈值需校准 |
| M53 | 公开 `pstack` 没有 Grok Bot/Dune 的真实 ESLint/Biome/依赖图/Lean 配置 | 固定 commit 的 pstack 树；本文 8.11 | N | 只能说公开材料缺失，不能推断内部没有 |

#### 9.12.3 最后的事实边界

截至本文固定版本，可以安全地说：

1. 她的方法论主线是**先把代码约束好，再把验证做强，最后才自动化**；
2. verification、statechart、swarm、lint、PR/babysit、overnight、autopilot 都有公开材料或演讲依据；
3. Bombadil 的属性测试用法可以从官方仓库逐项复现；
4. release→全量 fuzz→逐 bug PR→automerge 是演讲直接自述，但公开 `pstack` 没有给出等价编排；
5. 3,000/11,000/227/0.5%/每日稳定版/性能提升都是自报运营数字，不能当作已审计事实；
6. 本文所有“12 步 SOP、风险层、30/60/90、SQL、阈值”都是可落地重建，不能反过来冒充成她的原话或原配置。

这条边界不是削弱她的方法，而是让方法真正可复用：**能打开的文件、能跑的命令、能失败的检查、能回放的证据，才算事实依据。**

