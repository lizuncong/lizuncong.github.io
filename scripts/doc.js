const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const docDir = "docs";
const root = path.join(process.cwd(), `./${docDir}/`);
const dynamicPages = path.join(process.cwd(), "./src/dynamic/pages");
const dynamicMenus = path.join(process.cwd(), "./src/dynamic/menus.jsx");
const dynamicRoutes = path.join(process.cwd(), "./src/dynamic/routes.jsx");
const dynamicPagesImp = "@/dynamic/pages/";
const whiteList = [];
const digestMessage = (message) => {
  return 'A_' + crypto.createHash('md5').update(message).digest('hex');
}
// 判断是否是文件夹
const isDirectory = async (dir) => {
  return new Promise((resolve, reject) => {
    fs.stat(dir, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.isDirectory());
      }
    });
  });
};
// 读取目录
const readDir = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, async (err, files) => {
      if (err) {
        return reject(err);
      }
      const res = await Promise.all(
        files.filter(item => item[0] !== '.').map(async (file) => {
          const isDir = await isDirectory(dir + file);
          if (isDir) {
            const children = await readDir(dir + file + "/");
            return {
              label: file,
              key: `${dir}${file}`,
              children,
            };
          } else {
            const items = file.split('.')
            const type = items[items.length - 1]
            const fileName = file.replace(`.${type}`, "");
            return {
              label: fileName,
              key: `${dir}${fileName}`,
              type
            };
          }
        })
      );
      resolve(res);
    });
  });
};
// 创建目录
const makeDir = (dir) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) {
        return reject(err);
      } else {
        resolve();
      }
    });
  });
};
const getAllFiles = async (dir) => {
  const files = await readDir(dir);
  return files;
};

const generatePagesJSX = async (files) => {
  return Promise.all(
    files.map(async (fileObj) => {
      if (fileObj.children) {
        const dynamicDir = path.join(
          dynamicPages,
          path.relative(root, fileObj.key)
        );
        await makeDir(dynamicDir);
        await generatePagesJSX(fileObj.children);
      } else {
        const filename = path.relative(root, fileObj.key);

        await new Promise(async (resolve, reject) => {
          if (whiteList.includes(filename)) {
            resolve();
            return;
          }
          if(fileObj.type === 'md'){
            fs.writeFile(
              `${path.join(dynamicPages, filename)}.jsx`,
              `import React from "react";
  import MarkDown from "@/components/markdown";
  import shape from "@${docDir}/${filename}.md";
  
  function Index() {
    return <MarkDown src={shape} />;
  }
  
  export default Index;`,
              function (err) {
                // 如果err为true，则文件写入失败，并返回失败信息
                if (err) {
                  reject(err);
                  return console.log("文件写入失败！" + err.message);
                }
                resolve();
                // 若文件写入成功，将显示“文件写入成功”
                // console.log("文件写入成功！");
              }
            );
          } else if(fileObj.type === 'html') {
         
            const content = fs.readFileSync(`${fileObj.key}.html`)
            const publicPath = path.join(process.cwd(), `./public/html`)
            const dynamicDir = path.join(
              publicPath,
              path.relative(root, fileObj.key).replace(fileObj.label, '')
            );
      
            await makeDir(dynamicDir);
            fs.writeFileSync(`${dynamicDir}/${fileObj.label}.html`, content)
            fs.writeFile(
              `${path.join(dynamicPages, filename)}.jsx`,
              `import React from "react";

              function Index() {
                return <iframe frameBorder={0} className="doc-iframe" src='html/${filename}.html' />;
              }
              
              export default Index;`,
              function (err) {
                // 如果err为true，则文件写入失败，并返回失败信息
                if (err) {
                  reject(err);
                  return console.log("文件写入失败！" + err.message);
                }
                resolve();
                // 若文件写入成功，将显示“文件写入成功”
                // console.log("文件写入成功！");
              }
            );
          }

        });
      }
    })
  );
};

const generateMenus = async (files) => {
  const generate = (dir, children) => {
    let template = "[";
    children.forEach((file) => {
      const filename = path.relative(dir, file.key);
      if (file.children) {
        template =
          template +
          `{
    label: "${filename}",
    key: "${filename}",
    children: ${generate(file.key, file.children)},
  },`;
      } else {
        const p = path.relative(root, file.key);
        if (whiteList.includes(filename)) {
          return;
        }
        template =
          template +
          `{\nlabel: <NavLink to="/${p}">${filename}</NavLink>,\nkey: "/${p}",\n},\n`;
      }
    });
    return template + "]";
  };

  return new Promise((resolve, reject) => {
    let temp = `
    import { NavLink } from "react-router-dom";
    const MENU = ${generate(root, files)};
    export default MENU;
    `;
    fs.writeFile(dynamicMenus, temp, function (err) {
      if (err) {
        console.log("菜单文件写入失败！" + err.message);
        return reject(err);
      }
      resolve();
      console.log("菜单文件写入成功！");
    });
  });
};

const generateRoutes = async (files) => {
  const generate = (idx, children) => {
    let template = "";
    children.forEach((child, index) => {
      if (child.children) {
        template = template + generate(`${idx}${index}`, child.children);
      } else {
        if (whiteList.includes(child.key)) {
          return;
        }
        template =
          template +
          `{
             path: "/${path.relative(root, child.key)}",
             element: (
                <React.Suspense fallback={<div className="loading"><Spin size="large" /></div>}>
                <${child.componentName} />
                </React.Suspense>
             ),
           },\n`;
      }
    });
    return template;
  };
  const generateImports = (idx, children) => {
    let str = "";
    children.forEach((child, index) => {
      if (child.children) {
        str = str + generateImports(`${idx}${index}`, child.children);
      } else {
        if (whiteList.includes(child.key)) {
          return;
        }
        const componentName = digestMessage(child.key)
        child.componentName = componentName;
        str =
          str +
          `const ${componentName} = React.lazy(() => import(/* webpackChunkName: "A${idx}${index}" */ "${dynamicPagesImp}${path.relative(
            root,
            child.key
          )}"));\n`;
      }
    });
    return str;
  };

  return new Promise((resolve, reject) => {
    let temp = `
    import React from "react";
    import { Spin } from 'antd';
    ${generateImports(0, files)}
    const routes = [\n${generate(0, files)}\n]

    export default routes;
    `;
    fs.writeFile(dynamicRoutes, temp, function (err) {
      if (err) {
        console.log("路由文件写入失败！" + err.message);
        return reject(err);
      }
      resolve();
      console.log("路由文件写入成功！");
    });
  });
};
const work = async () => {
  await makeDir(dynamicPages);
  const files = await getAllFiles(root);
  await generatePagesJSX(files);
  await generateMenus(files);
  await generateRoutes(files);
  console.log("文档生成完毕！");
};

module.exports = work;
