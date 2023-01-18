const fs = require("fs");
const dir = "./docs/";

const readDir = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        throw err;
      }
      resolve(files);
    });
  });
};
const MENUS = [];

const generateJSX = (dir, filename) => {
  return new Promise((resove, reject) => {
    fs.mkdir(`./src/pages/${dir}`, { recursive: true }, (err) => {
      fs.writeFile(
        `./src/pages/${dir}/${filename}.jsx`,
        `import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/${dir}/${filename}.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;

        `,
        function (err) {
          // 如果err为true，则文件写入失败，并返回失败信息
          if (err) {
            reject(err);
            return console.log("文件写入失败！" + err.message);
          }
          resove();
          // 若文件写入成功，将显示“文件写入成功”
          // console.log("文件写入成功！");
        }
      );
    });
  });
};

const generateRoute = () => {
  let temp = `import React from "react";
import { createHashRouter } from "react-router-dom";
import { Spin } from 'antd';
import Home from "../localPages/home";
import App from "../App";`;
  MENUS.forEach((menu, idx) => {
    menu.children.forEach((page, index) => {
      let filename = page.key.replace(".md", "");

      temp =
        temp +
        `\nconst A${idx}${index} = React.lazy(() =>
  import(/* webpackChunkName: "A${idx}${index}" */ "@/pages${filename}")
);`;
    });
  });
  const routes = [];
  MENUS.forEach((menu, idx) => {
    menu.children.forEach((page, index) => {
      let filename = page.key.replace(".md", "");
      const name = filename.split("/");
      routes.push(
        `{
        path: "${filename}",
        element: (
          <React.Suspense fallback={<div className="loading"><Spin size="large" /></div>}>
            <A${idx}${index} />
          </React.Suspense>
        ),
      }`
      );
    });
  });
  temp =
    temp +
    `
const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <React.Suspense fallback={<div className="loading"><Spin size="large" /></div>}>
            <Home />
          </React.Suspense>
        )
      },
      ${routes}
    ],
  },
]);

export default router;`;
  fs.writeFile("./src/router/index.js", temp, function (err) {
    // 如果err为true，则文件写入失败，并返回失败信息
    if (err) {
      return console.log("文件写入失败！" + err.message);
    }
    // 若文件写入成功，将显示“文件写入成功”
    console.log("文件写入成功！");
  });
};

const getMenus = async (dir) => {
  const res = await readDir(dir);
  await Promise.all(
    res.map(async (temp) => {
      const children = [];
      const files = await readDir(dir + temp);
      files.forEach((file) => {
        const fileName = file.replace(".md", "");
        if (fileName.includes(".DS_Store")) return;
        generateJSX(temp, fileName);
        children.push({
          // label: `<NavLink to="/${temp}/${fileName}">${fileName}</NavLink>`,
          label: fileName,
          key: `/${temp}/${file}`,
        });
      });
      const item = {
        label: temp,
        key: temp,
        children,
      };
      MENUS.push(item);
    })
  );
};

const generateMenus = () => {
  let m = "";
  MENUS.forEach((menu) => {
    let children = "";
    menu.children.forEach((child) => {
      // console.log("menu..", menu, child);
      children =
        children +
        `
         {
         label: <NavLink to="/${menu.label}/${child.label}">${child.label}</NavLink>,
         key: "/${menu.label}/${child.label}.md",
       },
      `;
    });
    m =
      m +
      `
     {
      label: "${menu.label}",
      key: "${menu.label}",
      children: [
        ${children}
     ],
    },`;
  });

  let menus =
    `import { NavLink } from "react-router-dom";

const MENU = [` +
    m +
    `];

export default MENU;
`;
  fs.writeFile("./src/menu.jsx", menus, function (err) {
    // 如果err为true，则文件写入失败，并返回失败信息
    if (err) {
      return console.log("文件写入失败！" + err.message);
    }
    // 若文件写入成功，将显示“文件写入成功”
    // console.log("文件写入成功！");
  });
};
getMenus(dir).then((res) => {
  generateRoute();
  generateMenus();
});
