import dynamicMenus from "@/dynamic/menus";
const MENU = [
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
  ...dynamicMenus,
];

export default MENU;
