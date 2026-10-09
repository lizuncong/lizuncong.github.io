# Codex Desktop 浏览器默认实例分析

## 结论

本机安装的 Codex Desktop 实际是 `/Applications/ChatGPT.app`，内部包含：

1. **自带的 in-app browser**：Electron/Chromium 形态，运行时会用 `~/Library/Application Support/Codex` 作为独立 user-data-dir。
2. **外部 Chrome/Edge 控制通道**：不是通过 CDP 启动你的默认浏览器，而是依赖 ChatGPT/Codex 浏览器扩展连接到已经运行的浏览器。

## in-app browser 证据

当前运行中的主进程是：

```text
/Applications/ChatGPT.app/Contents/MacOS/ChatGPT
```

它的 Chromium helper 显示：

```text
--user-data-dir=/Users/lzc/Library/Application Support/Codex
--owl-scoped-user-agent-prefix=CodexBrowser
```

说明 in-app browser 使用的是 Codex Desktop 自己的 profile，不是 `Google Chrome` 的默认 profile。

## 外部 Chrome/Edge 证据

应用内置插件里有：

```text
/Applications/ChatGPT.app/Contents/Resources/plugins/openai-bundled/plugins/chrome
```

其中 `SKILL.md` 明确说明该能力用于：

- tabs
- logged-in sessions
- extensions

`extension-ids.json` 定义了 Chrome/Edge 的扩展 ID；文档中的流程是：

1. `agent.browsers.list()` 发现 `extension` 类型的浏览器。
2. `browser.user.openTabs()` 读取用户浏览器中已打开的 tab。
3. `browser.user.claimTab(tab)` 接管指定 tab。

所以外部浏览器登录态可见，是因为扩展运行在用户自己的浏览器 profile 内，而不是 Codex App 直接读取 Chrome 的 cookies。具体实现大致是：

1. **Chrome/Edge 里装扩展**
   - Codex/ChatGPT 有官方浏览器扩展。
   - 扩展运行在你的用户 profile 内，所以能看到你已经打开的页面和登录态。

2. **本地安装 native messaging host**
   - Codex App 会写一个 native host manifest，例如 `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.openai.codexextension.json`。
   - manifest 里的 `path` 指向 App 内置的 `ChatGPT for Chrome` 二进制。
   - `allowed_origins` 只允许指定扩展 ID 连接。

3. **扩展 ↔ native host ↔ Codex App**
   - 扩展通过 native messaging 和本地 host 进程通信。
   - host 再桥接到 Codex 的 app-server / 浏览器服务。
   - 通信内容是结构化 RPC，不是你手动开的 CDP。

4. **列出和接管 tab**
   - `browser.user.openTabs()` 对应后端 `getUserTabs`。
   - `browser.user.claimTab(tab)` 对应后端 `claimUserTab`。
   - 接管后，后续导航、截图、点击、读取 DOM 都通过扩展后端执行，而不是连接 DevTools 端口。

一句话：**外部浏览器控制不是 CDP，而是“扩展 + native messaging host + 本地 RPC”的桥接模型**。

## 与手动 CDP 的差异

| 方式 | 是否启动默认 profile | 是否需要 CDP | 登录态 |
| --- | ---: | ---: | --- |
| Codex in-app browser | 否，使用 `~/Library/Application Support/Codex` | 否 | 该 profile 内自己的登录态 |
| Codex 外部 Chrome/Edge | 否，接管已运行的浏览器 | 否，通过浏览器扩展 | 用户 profile 内已有登录态 |
| 手动 CDP 调试 | 否，必须独立 `user-data-dir` | 是 | 新独立 profile，默认无登录态 |

因此不能把“Codex 能操作我的浏览器”理解为“Codex 启动了默认 Chrome 实例”。它更像是通过浏览器扩展桥接到已有浏览器会话。



# 下面的待整理


Codex Desktop 并不是直接启动你的默认 Chrome。

**结论**
- 本机安装的是 `/Applications/ChatGPT.app`，内部集成 Codex。
- 它有两种浏览器形态：
  - **in-app browser**：Codex 自己的 Chromium，使用 `~/Library/Application Support/Codex`。
  - **外部 Chrome/Edge**：通过浏览器扩展接管你已打开的浏览器 tab。
- 所以 GPT 能拿到登录态，不是因为 Codex 启动了默认 profile，而是扩展运行在你的浏览器里，可以访问当前页面/会话。
- 你本地默认 Chrome 目前没有安装对应的 OpenAI/ChatGPT 扩展，所以我在 CDP 环境里看不到它。

**证据**
- 当前运行进程：
  - `/Applications/ChatGPT.app/Contents/MacOS/ChatGPT`
  - `--user-data-dir=/Users/lzc/Library/Application Support/Codex`
- 插件目录：
  - `/Applications/ChatGPT.app/Contents/Resources/plugins/openai-bundled/plugins/chrome`
- 文档流程是：
  - `agent.browsers.list()`
  - `browser.user.openTabs()`
  - `browser.user.claimTab(tab)`

我把分析写进了 `docs/Codex_Desktop_浏览器默认实例分析.md:1`。
## 为啥codex每次打开的浏览器窗口都是很干净的
是因为codex用的是独立调试 profile：`~/.cache/chrome-codex-debug`。

- Chrome 现在的安全策略会忽略默认用户目录上的 `--remote-debugging-port`。
- 为了开 CDP，必须用非默认 `--user-data-dir`。
- 这个目录里没有历史记录和登录态，所以看起来像无痕，但其实不是 Incognito，只是一个干净的独立 profile。
- 数据会保存在这个目录里；如果在里面登录一次，下次不会再是“无痕”状态。

可以把它改成一个更明确的持久化目录，比如 `~/.chrome-codex-debug-profile`

- Chrome 的 CDP 调试端口必须在启动时就传入参数。
- Chrome 还有一个安全限制：**默认用户目录下会忽略 `--remote-debugging-port`**，必须指定独立的 `--user-data-dir`。
- 所以打开的是 `~/.cache/chrome-codex-debug` 这个独立 profile

## Chrome 新版禁止默认用户目录开 CDP
出于安全考虑，Chrome 136+ 对默认 `user-data-dir` 忽略 `--remote-debugging-port`，防止自动化直接拿到你的默认登录态。所以我刚才必须用独立 profile：`~/.cache/chrome-codex-debug`。

也就是说，不是我不能点你这个 Chrome，而是 Chrome 不允许把默认 profile 直接暴露给 CDP。如果你想要持久化调试环境，我可以帮你做一个固定 profile 的一键启动脚本。
