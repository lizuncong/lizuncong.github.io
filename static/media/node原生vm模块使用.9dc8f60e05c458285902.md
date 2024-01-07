## VM模块
VM模块是Node内置的模块，核心作用是创建独立运行的沙箱环境。

## 如何执行一段字符串
- eval
- new Function。和eval最大的区别是，new Function有作用域
- vm.runInThisContext

## VM模块使用简介
新建一个test.txt文件，内容如下：
```txt
var age = 18;
```

新建一个vm.js文件，内容如下：
```js
const fs= require('fs')
const vm = require('vm')

const content = fs.readFileSync('test.txt', 'utf-8')

vm.runInThisContext(content)
```

## 简单模拟node require的实现
简单模拟nodejs中require方法加载js文件的实现：
```js
Module._extensions = {
    '.js'(module){
        // 读取
        let content = fs.readFileSync(module.id, 'utf-8');
        // 包装
        content = Module.wrapper[0] + content + Module.wrapper[1]

        // VM创建独立的沙箱环境
        const compileFn = vm.runInThisContext(content)

        // 准备参数的值
        const exports = module.exports
        const dirname = path.dirname(module.id)
        const filename = module.id

        //调用
        compileFn.call(exports, exports, myRequire, module, filename, dirname)
    },
    '.json'(module){
        const content = JSON.parse(fs.readFileSync(module.id, 'utf-8'))
        module.exports = content;
    }
}
Module.wrapper = [
    "(function (exports, require, module, __filename, __dirname){",
    "})"
]
```