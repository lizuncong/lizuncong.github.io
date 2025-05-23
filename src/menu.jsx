import dynamicMenus from "@/dynamic/menus";
const MENU = [
  {
    label: (
      <a
        className="custom-menu"
        target="_blank"
        href="https://lizuncong.github.io/web-editor/"
        rel="noreferrer"
      >
        落地页低代码编辑器
      </a>
    ),
    key: "https://lizuncong.github.io/web-editor/",
  },
  {
    label: (
      <a
        className="custom-menu"
        target="_blank"
        href="https://lizuncong.github.io/excalidraw-app/"
        rel="noreferrer"
      >
        Canvas教程
      </a>
    ),
    key: "https://lizuncong.github.io/excalidraw-app/",
  },
  {
    label: (
      <a
        className="custom-menu"
        target="_blank"
        href="https://lizuncong.github.io/easy-webgl/"
        rel="noreferrer"
      >
        WebGL 3D绘图教程
      </a>
    ),
    key: "https://lizuncong.github.io/easy-webgl/",
  },
  {
    label: (
      <a
        className="custom-menu"
        target="_blank"
        href="https://lizuncong.github.io/react-ui/"
        rel="noreferrer"
      >
        React组件
      </a>
    ),
    key: "https://lizuncong.github.io/react-ui/",
  },
  {
    label: (
      <a
        className="custom-menu"
        target="_blank"
        href="https://github.com/lizuncong/egg-react-ssr"
        rel="noreferrer"
      >
        React服务端渲染实战
      </a>
    ),
    key: "https://github.com/lizuncong/egg-react-ssr",
  },
  {
    label: (
      <a
        className="custom-menu"
        target="_blank"
        href="https://github.com/lizuncong/mini-react"
        rel="noreferrer"
      >
        React源码深度解析
      </a>
    ),
    key: "https://github.com/lizuncong/mini-react",
  },
  {
    label: (
      <a
        className="custom-menu"
        target="_blank"
        href="https://github.com/lizuncong/mini-webpack"
        rel="noreferrer"
      >
        手写Webpack源码
      </a>
    ),
    key: "https://github.com/lizuncong/mini-webpack",
  },
  {
    label: (
      <a
        className="custom-menu"
        target="_blank"
        href="https://github.com/lizuncong/mini-webpack-dev-server"
        rel="noreferrer"
      >
        手写Webpack Dev Server源码
      </a>
    ),
    key: "https://github.com/lizuncong/mini-webpack-dev-server",
  },
  {
    label: (
      <a
        className="custom-menu"
        target="_blank"
        href="https://github.com/lizuncong/mini-tapable"
        rel="noreferrer"
      >
        手写WebpackTapable源码
      </a>
    ),
    key: "https://github.com/lizuncong/mini-tapable",
  },
  {
    label: (
      <a
        className="custom-menu"
        target="_blank"
        href="https://github.com/lizuncong/mini-react-redux"
        rel="noreferrer"
      >
        手写React Redux源码
      </a>
    ),
    key: "https://github.com/lizuncong/mini-react-redux",
  },
  {
    label: (
      <a
        className="custom-menu"
        target="_blank"
        href="https://github.com/lizuncong/mini-react-router"
        rel="noreferrer"
      >
        手写React Router源码
      </a>
    ),
    key: "https://github.com/lizuncong/mini-react-router",
  },
  {
    label: (
      <a
        className="custom-menu"
        target="_blank"
        href="https://github.com/lizuncong/mini-promise"
        rel="noreferrer"
      >
        手写Promise源码
      </a>
    ),
    key: "https://github.com/lizuncong/mini-promise",
  },
  {
    label: (
      <a
        className="custom-menu"
        target="_blank"
        href="https://github.com/lizuncong/mini-koa"
        rel="noreferrer"
      >
        手写Koa源码
      </a>
    ),
    key: "https://github.com/lizuncong/mini-koa",
  },
  {
    label: (
      <a
        className="custom-menu"
        target="_blank"
        href="https://github.com/lizuncong/babel-plugin-react-directives"
        rel="noreferrer"
      >
        Babel插件开发教程
      </a>
    ),
    key: "https://github.com/lizuncong/babel-plugin-react-directives",
  },
  {
    label: (
      <a
        className="custom-menu"
        target="_blank"
        href="https://github.com/lizuncong/web-monitor"
        rel="noreferrer"
      >
        前端性能监控SDK
      </a>
    ),
    key: "https://github.com/lizuncong/web-monitor",
  },
  ...dynamicMenus,
];

export default MENU;
