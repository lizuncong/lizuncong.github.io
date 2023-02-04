## electron 多窗口实践

通过 window.open 打开子窗口，这种方案本身存在以下这些问题：

- 打开的子窗口没有 DOCTYPE 声明，处于怪异模式
- 主窗口如果调用 hide 隐藏的话，requestAnimation 不会执行。如果子窗口依赖了 requestAnimation，则会有问题。可以使用 setTimeout 模拟 raf 以解决这个问题
- 子窗口焦点的管理
