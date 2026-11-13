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
- 她称在 Grok Bot 里**禁掉了 99% 的注释**，因为注释容易过期、不可执行，还会成为 agent “解释自己为什么不按正确方式做”的逃生通道。取而代之的是带明确错误信息的 lint 规则，直接告诉 agent 去修根因。
  - 对应时间点：<https://www.youtube.com/watch?v=ZZ19zhYnDKY&t=4100s>
- 他们还禁止了大量 imperative timers（`setTimeout`、`requestAnimationFrame` 等），因为 agent 会用它们快速掩盖 VS Code 命令式架构和 React 声明式架构之间的冲突。

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
