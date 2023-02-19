## Electron 简介

Electron 是 Github 公司推出，通过它我们可以轻松构建横跨各种 PC 操作系统的应用程序，学习成本低，开发效率高，就连微软和 Automattic 这样的世界顶级的科技公司都在广泛使用（分别使用在 Visual Studio Code 和 WordPress Desktop），国内现在很多公司也在大量使用。

Electron 早期的名字叫 Atom Shell，Atom 团队早期就是使用 Atom Shell 开发 Atom 编辑器，后面越做越觉得这东西有发展价值，然后单独将其发布出来。

在此之前，也有一个国产的叫 Node-Webkit 用来做桌面应用程序的

- 核心思想：希望通过一套代码在不同平台打包成不同平台的程序。

### Electron 的构成

Electron 是 Chromium+Nodejs 的有机结合

- 浏览器内核 Chromium。执行 HTML+CSS+JS 的代码，结果就是图形化的界面
- Nodejs。执行一些功能性的 JS 脚本，比如读写文件

**依赖 Chromium 内核的话，岂不是受限于 Chromium 版本？？？**

### Electron 执行流程

electron 在一开始会通过 node 去执行当前 main.js 文件

- `const electron = require('electron')`中，electron 模块是 electron 平台中内置的，提供了所有的 API
- `electron.app`模块控制整个应用生命周期
- `electron.BrowserWindow`用于创建一个原生浏览器窗口

### API Demos

可以去 electron 官网下载 electron-api-demos 这个包并且在本地运行，这里可以查看 electron 提供的 api 都有哪些

### Electron 实现结构分析

Electron 启动之后会创建一个主进程，main.js 就是主进程负责执行的。主进程又会负责创建渲染进程(renderer process)，比如 index.html 里面的 js 代码就是 renderer process 负责执行的

## 进程和线程

- 线程是操作系统能够进行运算调度的最小单位。它被包含在进程之中，是进程中的实际运作单位

- 进程和线程之间的区别
  - 内存使用方面的区别。进程之间无法共享内存，线程之间可以共享内存
  - 通信机制方面的区别。进程之间可以通过 IPC 通信，线程之间通信就比较简单
  - 量级方面的区别。

## Electron：主进程和渲染进程

- 主进程（Main Process）的特点

  - 可以使用和系统对接的 Electron API：创建菜单，上传文件等等
  - 创建渲染进程：Renderer Process
  - 全面支持 Node.js
  - 只有一个，作为整个程序的入口点

- 渲染进程（Renderer Process）的特点
  - 可以有多个，每个对应一个窗口
  - 每个都是一个单独的进程
  - 全面支持 Node.js 和 DOM API
  - 可以使用一部分 Electron 提供的 API
