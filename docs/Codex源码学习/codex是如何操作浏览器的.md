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
