## module属性
在node.js中，我们通常使用module.exports或者exports导出模块。如果使用console.log(module)打印出module，会发现module包含以下属性：
```js
Module {
  id: '.',
  path: '/Users/lizuncong/Documents/ReactProjects/lizuncong.github.io',
  exports: {},
  parent: null,
  filename: '/Users/lizuncong/Documents/ReactProjects/lizuncong.github.io/test.js',
  loaded: false,
  children: [],
  paths: [
    '/Users/lizuncong/Documents/ReactProjects/lizuncong.github.io/node_modules',
    '/Users/lizuncong/Documents/ReactProjects/node_modules',
    '/Users/lizuncong/Documents/node_modules',
    '/Users/lizuncong/node_modules',
    '/Users/node_modules',
    '/node_modules'
  ]
}
```
module各属性简介：
- id：返回模块标识符，一般是一个绝对路径
- filename：返回文件模块的绝对路径
- loaded：返回布尔值，表示模块是否完成加载
- parent：返回对象，存放调用当前模块的模块
- children：返回数组，存放当前模块调用的其他模块
- exports：返回当前模块需要暴露的内容
- paths：返回数组，存放不同目录下的node_modules位置。在分析node模块加载查找位置的时候还是有用的。

上面这些属性不只是为了用于认识module属性，在之后分析node模块加载流程时都会用得上。

## module.exports与exports有何区别
在commonjs规范中，只规定了通过module.exports导出模块。而exports只是node.js为了方便操作，给每个模块都提供了一个exports变量，它只是指向了module.exports所对应的内存地址。因此我们就可以直接通过exports导出相应的内容。

由上可以看出，我们只能通过exports.xx导出内容，而不能给exports重新赋值，比如exports = {}。如果重新赋值，那exports就不是和module.exports共享地址的。

## require属性
本节介绍require常见属性，方便后面分析模块加载的源码实现

require的基本功能是读入并且执行一个模块文件，然后返回这个模块文件里的exports对象

可以通过console.log(require)输出require各属性
```js
[Function: require] {
  resolve: [Function: resolve] { paths: [Function: paths] },
  main: Module {
    id: '.',
    path: '/Users/lizuncong/Documents/node-server',
    exports: {},
    parent: null,
    filename: '/Users/lizuncong/Documents/node-server/index.js',
    loaded: false,
    children: [],
    paths: [
      '/Users/lizuncong/Documents/node-server/node_modules',
      '/Users/lizuncong/Documents/node_modules',
      '/Users/lizuncong/node_modules',
      '/Users/node_modules',
      '/node_modules'
    ]
  },
  extensions: [Object: null prototype] {
    '.js': [Function],
    '.json': [Function],
    '.node': [Function],
    '.mjs': [Function]
  },
  cache: [Object: null prototype] {
    '/Users/lizuncong/Documents/node-server/index.js': Module {
      id: '.',
      path: '/Users/lizuncong/Documents/node-server',
      exports: {},
      parent: null,
      filename: '/Users/lizuncong/Documents/node-server/index.js',
      loaded: false,
      children: [],
      paths: [Array]
    }
  }
}
```

require各属性简介：
- resolve：返回模块文件绝对路径
- extensions：依据不同后缀名执行解析操作
- main：返回主模块对象，即入口模块。可以利用它判断当前模块是不是主模块，即require.main === module。

## 模块分类及加载流程
### 模块分类
node模块分类可以大致分为两类：
- 内置模块。也称为核心模块。
    + 在Node源码编译时写入到二进制文件中，加载速度快。
- 文件模块。包括第三方依赖包（比如node_modules的依赖）以及自定义的文件。
    + 在代码运行时，动态加载，需要经历整个完整加载流程的。加载速度慢。

### 加载流程
- 路径分析：依据标识符确定模块位置。将当前的标识符转为绝对路径，找到目标模块
- 文件定位：确定目标模块中具体的文件及文件类型
- 编译执行：依据文件类型采用对应的方式完成文件的编译执行

#### 路径分析
基于标识符进行模块的查找。依据不同的格式，我们将标识符分为路径和非路径两种：
- 路径标识符。
- 非路径标识符。

非路径常见于核心模块，比如fs，http，path等，使用的时候直接写名字即可。对于自定义或者第三方的包来说，我们在使用的时候也可以直接写名字。

查找模块时，会有一个模块路径的概念，即module.paths属性。我们可以将它理解为node在定位模块具体文件时的查找策略。它的表现形式就是一个路径数组：
```js
Module {
  ...
  paths: [
    '/Users/lizuncong/Documents/ReactProjects/lizuncong.github.io/node_modules',
    '/Users/lizuncong/Documents/ReactProjects/node_modules',
    '/Users/lizuncong/Documents/node_modules',
    '/Users/lizuncong/node_modules',
    '/Users/node_modules',
    '/node_modules'
  ]
}
```
简单的分析module.paths的规律，就可以发现在这个数组中，存放的就是去不同的路径下查找node_modules目录。而这些路径刚好就是从当前文件的父级开始，直到当前项目所在的盘符根而结束。当我们使用require加载某个目标模块时，它会去遍历这个数组中的所有目录。如果最终还是没有找到目标文件，就会抛出查找失败的错误。

#### 文件定位
- 项目下存在m1.js模块，导入时使用require('m1')语法
- m1.js -> m1.json -> m1.node
- 查找package.json文件，使用JSON.parse()解析。
- main.js -> main.json -> main.node
- 将index作为目标模块中的具体文件名称。

在导入模块时，我们传入的标识符可能是没有扩展名的。比如，我们写了个自定义的模块叫m1.js，导入时使用require('m1')语法。在这种情况下，node在进行文件定位时，就无法直接拿到文件的扩展名。

此时node会按照 m1.js -> m1.json -> m1.node -> m1.mjs 的顺序补足扩展名。也就是说node会尝试着在之前所提到的路径中进行查找，查找的就是m1.js，m1.json，m1.node，m1.mjs。如果都没有找到，那么node就会认为require('m1')中的'm1'就是一个目录。那么就会将这个目录当作一个包来进行处理。首先在当前目录下查找package.json文件，然后使用JSON.parse进行解析，取出其中的main属性值。如果main属性值也是没有扩展名的，同样也会进行后缀的补全。如果main属性值所指定的文件在补足之后也不存在，或者package.json文件不存在，那么node默认就会将index作为目标模块中的具体文件名称，同样也是查找index.js，index.json，index.node。首先还是在当前目录下查找，如果没有，则会按照前面所说的模块路径数组一层一层地查找。如果最终也没有找到，就会抛出查找失败的异常。


#### 编译执行
- 将某个具体类型的文件按照相应的方式进行编译和执行。
- 创建新对象，按路径载入，完成编译执行

js类型的模块加载步骤：
- 使用fs模块同步读入目标文件内容
- 对内容进行语法包装，生成可执行JS函数
- 调用函数时传入exports，module，require等属性值

json类型的模块加载步骤：
- 将读取到的内容通过JSON.parse进行解析。


加载流程中还有个细节需要注意，那就是缓存优先原则。缓存的目的是提高模块加载速度。在通过标识符确定了绝对路径后，首先会去缓存中查找是否存在我们想要的模块。如果有，则直接返回当前的模块就可以了。如果没有，则经历一次完整加载流程。模块加载完成后，使用路径作为索引进行缓存。

