## electron 多窗口实践

通过 window.open 打开子窗口，这种方案本身存在以下这些技术问题：

- 打开的子窗口没有 DOCTYPE 声明，处于怪异模式
- 主窗口如果调用 hide 隐藏的话，requestAnimation 不会执行。如果子窗口依赖了 requestAnimation，则会有问题。可以使用 setTimeout 模拟 raf 以解决这个问题
- 子窗口焦点的管理
- 子窗口打开关闭时，事件会被卸载，应如何重新绑定事件？ react createportal
- 本地开发，css样式还没实现热更新
- 如何解决应用离线可用？一种方式是pwa，另一种是打包的产物丢在electron客户端
- 图片等静态资源无法使用相对路径，需要使用绝对路径
- 只能打开同源窗口
