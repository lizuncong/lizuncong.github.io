import { NavLink } from "react-router-dom";
const MENU = [
  {
    label: "SEO优化",
    key: "SEO优化",
    children: [
      {
        label: <NavLink to="/SEO优化/SEO优化指南">SEO优化指南</NavLink>,
        key: "/SEO优化/SEO优化指南",
      },
      {
        label: <NavLink to="/SEO优化/SEO优化清单">SEO优化清单</NavLink>,
        key: "/SEO优化/SEO优化清单",
      },
    ],
  },
  {
    label: "cicd",
    key: "cicd",
    children: [
      {
        label: <NavLink to="/cicd/基本介绍">基本介绍</NavLink>,
        key: "/cicd/基本介绍",
      },
    ],
  },
  {
    label: "css",
    key: "css",
    children: [
      {
        label: <NavLink to="/css/@import">@import</NavLink>,
        key: "/css/@import",
      },
      {
        label: <NavLink to="/css/BFC块格式化上下文">BFC块格式化上下文</NavLink>,
        key: "/css/BFC块格式化上下文",
      },
      {
        label: <NavLink to="/css/css权重">css权重</NavLink>,
        key: "/css/css权重",
      },
      {
        label: <NavLink to="/css/css能够继承的属性">css能够继承的属性</NavLink>,
        key: "/css/css能够继承的属性",
      },
      {
        label: (
          <NavLink to="/css/css选择器解析的顺序">css选择器解析的顺序</NavLink>
        ),
        key: "/css/css选择器解析的顺序",
      },
      {
        label: (
          <NavLink to="/css/transform等属性如何影像fixed定位">
            transform等属性如何影像fixed定位
          </NavLink>
        ),
        key: "/css/transform等属性如何影像fixed定位",
      },
    ],
  },
  {
    label: "git",
    key: "git",
    children: [
      {
        label: (
          <NavLink to="/git/git合并其他仓库的分支">
            git合并其他仓库的分支
          </NavLink>
        ),
        key: "/git/git合并其他仓库的分支",
      },
      {
        label: <NavLink to="/git/git补丁应用">git补丁应用</NavLink>,
        key: "/git/git补丁应用",
      },
      {
        label: (
          <NavLink to="/git/优雅查看git提交历史的方法">
            优雅查看git提交历史的方法
          </NavLink>
        ),
        key: "/git/优雅查看git提交历史的方法",
      },
      {
        label: (
          <NavLink to="/git/基于已有项目仓库初始化另一个新项目并保持git记录">
            基于已有项目仓库初始化另一个新项目并保持git记录
          </NavLink>
        ),
        key: "/git/基于已有项目仓库初始化另一个新项目并保持git记录",
      },
    ],
  },
  {
    label: "hybrid",
    key: "hybrid",
    children: [
      {
        label: <NavLink to="/hybrid/invoke">invoke</NavLink>,
        key: "/hybrid/invoke",
      },
      {
        label: <NavLink to="/hybrid/schema">schema</NavLink>,
        key: "/hybrid/schema",
      },
      {
        label: <NavLink to="/hybrid/基本知识">基本知识</NavLink>,
        key: "/hybrid/基本知识",
      },
      {
        label: (
          <NavLink to="/hybrid/客户端和js通信方式">客户端和js通信方式</NavLink>
        ),
        key: "/hybrid/客户端和js通信方式",
      },
    ],
  },
  {
    label: "javaScript",
    key: "javaScript",
    children: [
      {
        label: (
          <NavLink to="/javaScript/Object.create实现">
            Object.create实现
          </NavLink>
        ),
        key: "/javaScript/Object.create实现",
      },
      {
        label: (
          <NavLink to="/javaScript/compose高阶函数">compose高阶函数</NavLink>
        ),
        key: "/javaScript/compose高阶函数",
      },
      {
        label: (
          <NavLink to="/javaScript/generator&async-await">
            generator&async-await
          </NavLink>
        ),
        key: "/javaScript/generator&async-await",
      },
      {
        label: (
          <NavLink to="/javaScript/js创建对象的几种方法">
            js创建对象的几种方法
          </NavLink>
        ),
        key: "/javaScript/js创建对象的几种方法",
      },
      {
        label: (
          <NavLink to="/javaScript/js垃圾回收机制">js垃圾回收机制</NavLink>
        ),
        key: "/javaScript/js垃圾回收机制",
      },
      {
        label: <NavLink to="/javaScript/js基础知识">js基础知识</NavLink>,
        key: "/javaScript/js基础知识",
      },
      {
        label: (
          <NavLink to="/javaScript/js实现instanceof">js实现instanceof</NavLink>
        ),
        key: "/javaScript/js实现instanceof",
      },
      {
        label: <NavLink to="/javaScript/js的继承">js的继承</NavLink>,
        key: "/javaScript/js的继承",
      },
      {
        label: <NavLink to="/javaScript/new的过程">new的过程</NavLink>,
        key: "/javaScript/new的过程",
      },
      {
        label: (
          <NavLink to="/javaScript/script标签的async和defer属性">
            script标签的async和defer属性
          </NavLink>
        ),
        key: "/javaScript/script标签的async和defer属性",
      },
      {
        label: (
          <NavLink to="/javaScript/this的了解及call&apply&bind源码实现">
            this的了解及call&apply&bind源码实现
          </NavLink>
        ),
        key: "/javaScript/this的了解及call&apply&bind源码实现",
      },
      {
        label: (
          <NavLink to="/javaScript/尽量避免使用的API">
            尽量避免使用的API
          </NavLink>
        ),
        key: "/javaScript/尽量避免使用的API",
      },
    ],
  },
  {
    label: "less",
    key: "less",
    children: [
      {
        label: <NavLink to="/less/@media的嵌套">@media的嵌套</NavLink>,
        key: "/less/@media的嵌套",
      },
      {
        label: <NavLink to="/less/escaping">escaping</NavLink>,
        key: "/less/escaping",
      },
      {
        label: <NavLink to="/less/extend">extend</NavLink>,
        key: "/less/extend",
      },
      {
        label: <NavLink to="/less/less总览">less总览</NavLink>,
        key: "/less/less总览",
      },
      {
        label: <NavLink to="/less/mixins">mixins</NavLink>,
        key: "/less/mixins",
      },
      {
        label: <NavLink to="/less/自定义函数">自定义函数</NavLink>,
        key: "/less/自定义函数",
      },
    ],
  },
  {
    label: "node",
    key: "node",
    children: [
      {
        label: <NavLink to="/node/node基础知识">node基础知识</NavLink>,
        key: "/node/node基础知识",
      },
      {
        label: <NavLink to="/node/node多进程的实现">node多进程的实现</NavLink>,
        key: "/node/node多进程的实现",
      },
    ],
  },
  {
    label: "react",
    key: "react",
    children: [
      {
        label: <NavLink to="/react/React与Vue的区别">React与Vue的区别</NavLink>,
        key: "/react/React与Vue的区别",
      },
      {
        label: <NavLink to="/react/fiber">fiber</NavLink>,
        key: "/react/fiber",
      },
      {
        label: (
          <NavLink to="/react/fiber极简版本react">fiber极简版本react</NavLink>
        ),
        key: "/react/fiber极简版本react",
      },
      {
        label: (
          <NavLink to="/react/react-hooks的原理">react-hooks的原理</NavLink>
        ),
        key: "/react/react-hooks的原理",
      },
      {
        label: <NavLink to="/react/react.context">react.context</NavLink>,
        key: "/react/react.context",
      },
      {
        label: (
          <NavLink to="/react/react合成事件系统">react合成事件系统</NavLink>
        ),
        key: "/react/react合成事件系统",
      },
      {
        label: <NavLink to="/react/react生命周期">react生命周期</NavLink>,
        key: "/react/react生命周期",
      },
      {
        label: (
          <NavLink to="/react/setState同步异步更新的问题">
            setState同步异步更新的问题
          </NavLink>
        ),
        key: "/react/setState同步异步更新的问题",
      },
      {
        label: <NavLink to="/react/setState的过程">setState的过程</NavLink>,
        key: "/react/setState的过程",
      },
      {
        label: (
          <NavLink to="/react/为什么需要ReactHook">为什么需要ReactHook</NavLink>
        ),
        key: "/react/为什么需要ReactHook",
      },
    ],
  },
  {
    label: "redux",
    key: "redux",
    children: [
      {
        label: (
          <NavLink to="/redux/redux及react-redux">redux及react-redux</NavLink>
        ),
        key: "/redux/redux及react-redux",
      },
    ],
  },
  {
    label: "typescript",
    key: "typescript",
    children: [
      {
        label: (
          <NavLink to="/typescript/typescript基础总结">
            typescript基础总结
          </NavLink>
        ),
        key: "/typescript/typescript基础总结",
      },
      {
        label: (
          <NavLink to="/typescript/typescript装饰器">typescript装饰器</NavLink>
        ),
        key: "/typescript/typescript装饰器",
      },
    ],
  },
  {
    label: "webpack",
    key: "webpack",
    children: [
      {
        label: (
          <NavLink to="/webpack/loader和plugin的区别">
            loader和plugin的区别
          </NavLink>
        ),
        key: "/webpack/loader和plugin的区别",
      },
      {
        label: <NavLink to="/webpack/loader开发指南">loader开发指南</NavLink>,
        key: "/webpack/loader开发指南",
      },
      {
        label: <NavLink to="/webpack/plugin开发指南">plugin开发指南</NavLink>,
        key: "/webpack/plugin开发指南",
      },
      {
        label: <NavLink to="/webpack/sourcemap原理">sourcemap原理</NavLink>,
        key: "/webpack/sourcemap原理",
      },
      {
        label: <NavLink to="/webpack/tapable">tapable</NavLink>,
        key: "/webpack/tapable",
      },
      {
        label: (
          <NavLink to="/webpack/webpack热更新原理">webpack热更新原理</NavLink>
        ),
        key: "/webpack/webpack热更新原理",
      },
      {
        label: (
          <NavLink to="/webpack/如何提高webpack构建速度">
            如何提高webpack构建速度
          </NavLink>
        ),
        key: "/webpack/如何提高webpack构建速度",
      },
      {
        label: (
          <NavLink to="/webpack/生产环境如何运用sourcemap定义js错误">
            生产环境如何运用sourcemap定义js错误
          </NavLink>
        ),
        key: "/webpack/生产环境如何运用sourcemap定义js错误",
      },
    ],
  },
  {
    label: "web优化",
    key: "web优化",
    children: [
      {
        label: <NavLink to="/web优化/GPU加速">GPU加速</NavLink>,
        key: "/web优化/GPU加速",
      },
      {
        label: <NavLink to="/web优化/web优化总结">web优化总结</NavLink>,
        key: "/web优化/web优化总结",
      },
      {
        label: (
          <NavLink to="/web优化/web性能指标及前端监控体系">
            web性能指标及前端监控体系
          </NavLink>
        ),
        key: "/web优化/web性能指标及前端监控体系",
      },
      {
        label: <NavLink to="/web优化/什么是CDN">什么是CDN</NavLink>,
        key: "/web优化/什么是CDN",
      },
      {
        label: (
          <NavLink to="/web优化/使用webp优化图片资源">
            使用webp优化图片资源
          </NavLink>
        ),
        key: "/web优化/使用webp优化图片资源",
      },
      {
        label: <NavLink to="/web优化/图片srcset优化">图片srcset优化</NavLink>,
        key: "/web优化/图片srcset优化",
      },
      {
        label: (
          <NavLink to="/web优化/高性能浏览器网络">高性能浏览器网络</NavLink>
        ),
        key: "/web优化/高性能浏览器网络",
      },
    ],
  },
  {
    label: "web优化总结",
    key: "web优化总结",
    children: [
      {
        label: (
          <NavLink to="/web优化总结/less样式写法优化">less样式写法优化</NavLink>
        ),
        key: "/web优化总结/less样式写法优化",
      },
      {
        label: (
          <NavLink to="/web优化总结/webpack打包构建优化">
            webpack打包构建优化
          </NavLink>
        ),
        key: "/web优化总结/webpack打包构建优化",
      },
      {
        label: <NavLink to="/web优化总结/关键渲染路径">关键渲染路径</NavLink>,
        key: "/web优化总结/关键渲染路径",
      },
      {
        label: <NavLink to="/web优化总结/大纲">大纲</NavLink>,
        key: "/web优化总结/大纲",
      },
      {
        label: <NavLink to="/web优化总结/性能优化指标">性能优化指标</NavLink>,
        key: "/web优化总结/性能优化指标",
      },
      {
        label: <NavLink to="/web优化总结/渲染优化">渲染优化</NavLink>,
        key: "/web优化总结/渲染优化",
      },
      {
        label: (
          <NavLink to="/web优化总结/用户交互体验优化">用户交互体验优化</NavLink>
        ),
        key: "/web优化总结/用户交互体验优化",
      },
      {
        label: (
          <NavLink to="/web优化总结/移动端首屏优化">移动端首屏优化</NavLink>
        ),
        key: "/web优化总结/移动端首屏优化",
      },
      {
        label: <NavLink to="/web优化总结/组件代码优化">组件代码优化</NavLink>,
        key: "/web优化总结/组件代码优化",
      },
      {
        label: <NavLink to="/web优化总结/读写分离">读写分离</NavLink>,
        key: "/web优化总结/读写分离",
      },
    ],
  },
  {
    label: "web安全",
    key: "web安全",
    children: [
      {
        label: <NavLink to="/web安全/SQL注入">SQL注入</NavLink>,
        key: "/web安全/SQL注入",
      },
      {
        label: <NavLink to="/web安全/XSS攻击与防御">XSS攻击与防御</NavLink>,
        key: "/web安全/XSS攻击与防御",
      },
      {
        label: <NavLink to="/web安全/cookie">cookie</NavLink>,
        key: "/web安全/cookie",
      },
      {
        label: (
          <NavLink to="/web安全/cookie的samesite属性">
            cookie的samesite属性
          </NavLink>
        ),
        key: "/web安全/cookie的samesite属性",
      },
      {
        label: <NavLink to="/web安全/csrf笔记">csrf笔记</NavLink>,
        key: "/web安全/csrf笔记",
      },
      {
        label: (
          <NavLink to="/web安全/web常见安全问题及防御">
            web常见安全问题及防御
          </NavLink>
        ),
        key: "/web安全/web常见安全问题及防御",
      },
      {
        label: <NavLink to="/web安全/传输安全">传输安全</NavLink>,
        key: "/web安全/传输安全",
      },
      {
        label: <NavLink to="/web安全/密码安全">密码安全</NavLink>,
        key: "/web安全/密码安全",
      },
      {
        label: <NavLink to="/web安全/点击劫持">点击劫持</NavLink>,
        key: "/web安全/点击劫持",
      },
      {
        label: <NavLink to="/web安全/跨域">跨域</NavLink>,
        key: "/web安全/跨域",
      },
    ],
  },
  {
    label: "代码题",
    key: "代码题",
    children: [
      {
        label: (
          <NavLink to="/代码题/JS中三类循环对比及性能分析">
            JS中三类循环对比及性能分析
          </NavLink>
        ),
        key: "/代码题/JS中三类循环对比及性能分析",
      },
      {
        label: (
          <NavLink to="/代码题/JS面向切面编程AOP">JS面向切面编程AOP</NavLink>
        ),
        key: "/代码题/JS面向切面编程AOP",
      },
      {
        label: (
          <NavLink to="/代码题/compose组合函数及链式调用">
            compose组合函数及链式调用
          </NavLink>
        ),
        key: "/代码题/compose组合函数及链式调用",
      },
      {
        label: (
          <NavLink to="/代码题/js实现精准倒计时">js实现精准倒计时</NavLink>
        ),
        key: "/代码题/js实现精准倒计时",
      },
      {
        label: <NavLink to="/代码题/js并发请求控制">js并发请求控制</NavLink>,
        key: "/代码题/js并发请求控制",
      },
      {
        label: <NavLink to="/代码题/js深拷贝">js深拷贝</NavLink>,
        key: "/代码题/js深拷贝",
      },
      {
        label: (
          <NavLink to="/代码题/js的数据类型检测">js的数据类型检测</NavLink>
        ),
        key: "/代码题/js的数据类型检测",
      },
      {
        label: <NavLink to="/代码题/lazyMan函数">lazyMan函数</NavLink>,
        key: "/代码题/lazyMan函数",
      },
      {
        label: (
          <NavLink to="/代码题/两个对象的merge方法实现">
            两个对象的merge方法实现
          </NavLink>
        ),
        key: "/代码题/两个对象的merge方法实现",
      },
      {
        label: (
          <NavLink to="/代码题/数组转树结构题目">数组转树结构题目</NavLink>
        ),
        key: "/代码题/数组转树结构题目",
      },
      {
        label: (
          <NavLink to="/代码题/有意思的window.open">
            有意思的window.open
          </NavLink>
        ),
        key: "/代码题/有意思的window.open",
      },
      {
        label: <NavLink to="/代码题/模版字符串编译">模版字符串编译</NavLink>,
        key: "/代码题/模版字符串编译",
      },
      {
        label: <NavLink to="/代码题/红绿灯">红绿灯</NavLink>,
        key: "/代码题/红绿灯",
      },
      {
        label: <NavLink to="/代码题/重复请求取消">重复请求取消</NavLink>,
        key: "/代码题/重复请求取消",
      },
      {
        label: (
          <NavLink to="/代码题/链式调用-事件处理器-最长公共前缀">
            链式调用-事件处理器-最长公共前缀
          </NavLink>
        ),
        key: "/代码题/链式调用-事件处理器-最长公共前缀",
      },
      {
        label: <NavLink to="/代码题/防抖与节流">防抖与节流</NavLink>,
        key: "/代码题/防抖与节流",
      },
      {
        label: (
          <NavLink to="/代码题/阿拉伯数字转中文读法">
            阿拉伯数字转中文读法
          </NavLink>
        ),
        key: "/代码题/阿拉伯数字转中文读法",
      },
    ],
  },
  {
    label: "前端路由",
    key: "前端路由",
    children: [
      {
        label: <NavLink to="/前端路由/hash">hash</NavLink>,
        key: "/前端路由/hash",
      },
      {
        label: <NavLink to="/前端路由/history">history</NavLink>,
        key: "/前端路由/history",
      },
      {
        label: <NavLink to="/前端路由/前端路由原理">前端路由原理</NavLink>,
        key: "/前端路由/前端路由原理",
      },
    ],
  },
  {
    label: "加密算法",
    key: "加密算法",
    children: [
      {
        label: (
          <NavLink to="/加密算法/RSA算法流程概述">RSA算法流程概述</NavLink>
        ),
        key: "/加密算法/RSA算法流程概述",
      },
    ],
  },
  {
    label: "动画",
    key: "动画",
    children: [
      {
        label: <NavLink to="/动画/轮播图卷轴动画">轮播图卷轴动画</NavLink>,
        key: "/动画/轮播图卷轴动画",
      },
    ],
  },
  {
    label: "学习计划",
    key: "学习计划",
    children: [
      {
        label: <NavLink to="/学习计划/2020年学习目标">2020年学习目标</NavLink>,
        key: "/学习计划/2020年学习目标",
      },
      {
        label: <NavLink to="/学习计划/2021年学习目标">2021年学习目标</NavLink>,
        key: "/学习计划/2021年学习目标",
      },
      {
        label: <NavLink to="/学习计划/2022年学习目标">2022年学习目标</NavLink>,
        key: "/学习计划/2022年学习目标",
      },
      {
        label: <NavLink to="/学习计划/2023年学习目标">2023年学习目标</NavLink>,
        key: "/学习计划/2023年学习目标",
      },
      {
        label: <NavLink to="/学习计划/5年回顾">5年回顾</NavLink>,
        key: "/学习计划/5年回顾",
      },
    ],
  },
  {
    label: "最佳实践",
    key: "最佳实践",
    children: [
      {
        label: (
          <NavLink to="/最佳实践/JS枚举的优雅写法">JS枚举的优雅写法</NavLink>
        ),
        key: "/最佳实践/JS枚举的优雅写法",
      },
      {
        label: (
          <NavLink to="/最佳实践/Table表格的倒置用法">
            Table表格的倒置用法
          </NavLink>
        ),
        key: "/最佳实践/Table表格的倒置用法",
      },
      {
        label: (
          <NavLink to="/最佳实践/Thinking-Of-React-Hook">
            Thinking-Of-React-Hook
          </NavLink>
        ),
        key: "/最佳实践/Thinking-Of-React-Hook",
      },
      {
        label: (
          <NavLink to="/最佳实践/axios二次封装和API接口管理规范">
            axios二次封装和API接口管理规范
          </NavLink>
        ),
        key: "/最佳实践/axios二次封装和API接口管理规范",
      },
      {
        label: (
          <NavLink to="/最佳实践/css实现dom视觉顺序调整">
            css实现dom视觉顺序调整
          </NavLink>
        ),
        key: "/最佳实践/css实现dom视觉顺序调整",
      },
      {
        label: (
          <NavLink to="/最佳实践/hook与setInterval">hook与setInterval</NavLink>
        ),
        key: "/最佳实践/hook与setInterval",
      },
      {
        label: (
          <NavLink to="/最佳实践/html标签未闭合的危害">
            html标签未闭合的危害
          </NavLink>
        ),
        key: "/最佳实践/html标签未闭合的危害",
      },
      {
        label: <NavLink to="/最佳实践/iframe_test">iframe_test</NavLink>,
        key: "/最佳实践/iframe_test",
      },
      {
        label: (
          <NavLink to="/最佳实践/promise.all如何判断哪个promise报错">
            promise.all如何判断哪个promise报错
          </NavLink>
        ),
        key: "/最佳实践/promise.all如何判断哪个promise报错",
      },
      {
        label: (
          <NavLink to="/最佳实践/requestAnimationFrame">
            requestAnimationFrame
          </NavLink>
        ),
        key: "/最佳实践/requestAnimationFrame",
      },
      {
        label: (
          <NavLink to="/最佳实践/requestAnimationFrame实现js防抖">
            requestAnimationFrame实现js防抖
          </NavLink>
        ),
        key: "/最佳实践/requestAnimationFrame实现js防抖",
      },
      {
        label: <NavLink to="/最佳实践/业务总结">业务总结</NavLink>,
        key: "/最佳实践/业务总结",
      },
      {
        label: (
          <NavLink to="/最佳实践/前端实现打印功能">前端实现打印功能</NavLink>
        ),
        key: "/最佳实践/前端实现打印功能",
      },
      {
        label: (
          <NavLink to="/最佳实践/多次重复请求如何处理">
            多次重复请求如何处理
          </NavLink>
        ),
        key: "/最佳实践/多次重复请求如何处理",
      },
      {
        label: (
          <NavLink to="/最佳实践/按需加载原理及加强版按需加载插件开发">
            按需加载原理及加强版按需加载插件开发
          </NavLink>
        ),
        key: "/最佳实践/按需加载原理及加强版按需加载插件开发",
      },
      {
        label: (
          <NavLink to="/最佳实践/检测html标签未闭合的n种方案">
            检测html标签未闭合的n种方案
          </NavLink>
        ),
        key: "/最佳实践/检测html标签未闭合的n种方案",
      },
      {
        label: (
          <NavLink to="/最佳实践/纯CSS实现元素尺寸比例保持不变">
            纯CSS实现元素尺寸比例保持不变
          </NavLink>
        ),
        key: "/最佳实践/纯CSS实现元素尺寸比例保持不变",
      },
      {
        label: (
          <NavLink to="/最佳实践/纯CSS实现滚动添加阴影">
            纯CSS实现滚动添加阴影
          </NavLink>
        ),
        key: "/最佳实践/纯CSS实现滚动添加阴影",
      },
      {
        label: (
          <NavLink to="/最佳实践/组件设计及第三方库引用">
            组件设计及第三方库引用
          </NavLink>
        ),
        key: "/最佳实践/组件设计及第三方库引用",
      },
      {
        label: <NavLink to="/最佳实践/防抖与节流">防抖与节流</NavLink>,
        key: "/最佳实践/防抖与节流",
      },
      {
        label: (
          <NavLink to="/最佳实践/页面复用还是组件复用">
            页面复用还是组件复用
          </NavLink>
        ),
        key: "/最佳实践/页面复用还是组件复用",
      },
    ],
  },
  {
    label: "杂记",
    key: "杂记",
    children: [
      {
        label: <NavLink to="/杂记/npm杂记">npm杂记</NavLink>,
        key: "/杂记/npm杂记",
      },
      {
        label: <NavLink to="/杂记/web事件循环机制">web事件循环机制</NavLink>,
        key: "/杂记/web事件循环机制",
      },
      {
        label: <NavLink to="/杂记/前端题目">前端题目</NavLink>,
        key: "/杂记/前端题目",
      },
    ],
  },
  {
    label: "模块系统",
    key: "模块系统",
    children: [
      {
        label: (
          <NavLink to="/模块系统/JS模块循环加载原理(待整理)">
            JS模块循环加载原理(待整理)
          </NavLink>
        ),
        key: "/模块系统/JS模块循环加载原理(待整理)",
      },
      {
        label: <NavLink to="/模块系统/JS模块系统">JS模块系统</NavLink>,
        key: "/模块系统/JS模块系统",
      },
      {
        label: <NavLink to="/模块系统/Node模块机制">Node模块机制</NavLink>,
        key: "/模块系统/Node模块机制",
      },
    ],
  },
  {
    label: "浏览器兼容",
    key: "浏览器兼容",
    children: [
      {
        label: <NavLink to="/浏览器兼容/css">css</NavLink>,
        key: "/浏览器兼容/css",
      },
      {
        label: (
          <NavLink to="/浏览器兼容/getStyleProperty">getStyleProperty</NavLink>
        ),
        key: "/浏览器兼容/getStyleProperty",
      },
    ],
  },
  {
    label: "浏览器渲染",
    key: "浏览器渲染",
    children: [
      {
        label: (
          <NavLink to="/浏览器渲染/CRP关键渲染路径-从输入URL到页面呈现都发生了什么">
            CRP关键渲染路径-从输入URL到页面呈现都发生了什么
          </NavLink>
        ),
        key: "/浏览器渲染/CRP关键渲染路径-从输入URL到页面呈现都发生了什么",
      },
    ],
  },
  {
    label: "登录验证实现思路",
    key: "登录验证实现思路",
    children: [
      {
        label: (
          <NavLink to="/登录验证实现思路/cookie代码实践">
            cookie代码实践
          </NavLink>
        ),
        key: "/登录验证实现思路/cookie代码实践",
      },
      {
        label: (
          <NavLink to="/登录验证实现思路/cookie基础知识">
            cookie基础知识
          </NavLink>
        ),
        key: "/登录验证实现思路/cookie基础知识",
      },
      {
        label: (
          <NavLink to="/登录验证实现思路/jwt代码实践">jwt代码实践</NavLink>
        ),
        key: "/登录验证实现思路/jwt代码实践",
      },
      {
        label: (
          <NavLink to="/登录验证实现思路/jwt基础知识">jwt基础知识</NavLink>
        ),
        key: "/登录验证实现思路/jwt基础知识",
      },
      {
        label: <NavLink to="/登录验证实现思路/readme">readme</NavLink>,
        key: "/登录验证实现思路/readme",
      },
      {
        label: (
          <NavLink to="/登录验证实现思路/redis基础知识">redis基础知识</NavLink>
        ),
        key: "/登录验证实现思路/redis基础知识",
      },
      {
        label: <NavLink to="/登录验证实现思路/redis实践">redis实践</NavLink>,
        key: "/登录验证实现思路/redis实践",
      },
      {
        label: <NavLink to="/登录验证实现思路/redis实践2">redis实践2</NavLink>,
        key: "/登录验证实现思路/redis实践2",
      },
      {
        label: <NavLink to="/登录验证实现思路/session">session</NavLink>,
        key: "/登录验证实现思路/session",
      },
      {
        label: (
          <NavLink to="/登录验证实现思路/session实践">session实践</NavLink>
        ),
        key: "/登录验证实现思路/session实践",
      },
    ],
  },
  {
    label: "网络",
    key: "网络",
    children: [
      {
        label: (
          <NavLink to="/网络/Cache-Control支持的值">
            Cache-Control支持的值
          </NavLink>
        ),
        key: "/网络/Cache-Control支持的值",
      },
      {
        label: <NavLink to="/网络/DNS寻址">DNS寻址</NavLink>,
        key: "/网络/DNS寻址",
      },
      {
        label: <NavLink to="/网络/HTTP3详解">HTTP3详解</NavLink>,
        key: "/网络/HTTP3详解",
      },
      {
        label: <NavLink to="/网络/HTTP缓存">HTTP缓存</NavLink>,
        key: "/网络/HTTP缓存",
      },
      {
        label: <NavLink to="/网络/SSL&TLS详细介绍">SSL&TLS详细介绍</NavLink>,
        key: "/网络/SSL&TLS详细介绍",
      },
      {
        label: <NavLink to="/网络/TCP">TCP</NavLink>,
        key: "/网络/TCP",
      },
      {
        label: (
          <NavLink to="/网络/get和post方法的比较">get和post方法的比较</NavLink>
        ),
        key: "/网络/get和post方法的比较",
      },
      {
        label: <NavLink to="/网络/http2服务器推送">http2服务器推送</NavLink>,
        key: "/网络/http2服务器推送",
      },
      {
        label: <NavLink to="/网络/http2简介">http2简介</NavLink>,
        key: "/网络/http2简介",
      },
      {
        label: (
          <NavLink to="/网络/https简介及与http的区别">
            https简介及与http的区别
          </NavLink>
        ),
        key: "/网络/https简介及与http的区别",
      },
      {
        label: (
          <NavLink to="/网络/http协议及各版本的差别">
            http协议及各版本的差别
          </NavLink>
        ),
        key: "/网络/http协议及各版本的差别",
      },
      {
        label: <NavLink to="/网络/http请求头字段">http请求头字段</NavLink>,
        key: "/网络/http请求头字段",
      },
      {
        label: <NavLink to="/网络/http请求状态码">http请求状态码</NavLink>,
        key: "/网络/http请求状态码",
      },
      {
        label: (
          <NavLink to="/网络/server-sent-event(SSE)">
            server-sent-event(SSE)
          </NavLink>
        ),
        key: "/网络/server-sent-event(SSE)",
      },
      {
        label: <NavLink to="/网络/serviceWorker">serviceWorker</NavLink>,
        key: "/网络/serviceWorker",
      },
      {
        label: <NavLink to="/网络/webAssembly">webAssembly</NavLink>,
        key: "/网络/webAssembly",
      },
      {
        label: <NavLink to="/网络/webRTC">webRTC</NavLink>,
        key: "/网络/webRTC",
      },
      {
        label: <NavLink to="/网络/webWorker">webWorker</NavLink>,
        key: "/网络/webWorker",
      },
      {
        label: (
          <NavLink to="/网络/websocket与http的区别">
            websocket与http的区别
          </NavLink>
        ),
        key: "/网络/websocket与http的区别",
      },
      {
        label: (
          <NavLink to="/网络/协商缓存中Etag的生成规则">
            协商缓存中Etag的生成规则
          </NavLink>
        ),
        key: "/网络/协商缓存中Etag的生成规则",
      },
      {
        label: <NavLink to="/网络/图解计算机网络">图解计算机网络</NavLink>,
        key: "/网络/图解计算机网络",
      },
    ],
  },
  {
    label: "踩坑系列",
    key: "踩坑系列",
    children: [
      {
        label: (
          <NavLink to="/踩坑系列/302重定向到同源网站cookie丢失的问题">
            302重定向到同源网站cookie丢失的问题
          </NavLink>
        ),
        key: "/踩坑系列/302重定向到同源网站cookie丢失的问题",
      },
      {
        label: (
          <NavLink to="/踩坑系列/flex布局水平居中导致水平滚动出现问题">
            flex布局水平居中导致水平滚动出现问题
          </NavLink>
        ),
        key: "/踩坑系列/flex布局水平居中导致水平滚动出现问题",
      },
      {
        label: (
          <NavLink to="/踩坑系列/getElementByClass查询结果实时性问题">
            getElementByClass查询结果实时性问题
          </NavLink>
        ),
        key: "/踩坑系列/getElementByClass查询结果实时性问题",
      },
      {
        label: (
          <NavLink to="/踩坑系列/http请求头referer踩坑">
            http请求头referer踩坑
          </NavLink>
        ),
        key: "/踩坑系列/http请求头referer踩坑",
      },
      {
        label: (
          <NavLink to="/踩坑系列/iframe的src和window.location.href">
            iframe的src和window.location.href
          </NavLink>
        ),
        key: "/踩坑系列/iframe的src和window.location.href",
      },
      {
        label: (
          <NavLink to="/踩坑系列/js实现复制粘贴保留原格式">
            js实现复制粘贴保留原格式
          </NavLink>
        ),
        key: "/踩坑系列/js实现复制粘贴保留原格式",
      },
      {
        label: (
          <NavLink to="/踩坑系列/js正则表达式动态模式">
            js正则表达式动态模式
          </NavLink>
        ),
        key: "/踩坑系列/js正则表达式动态模式",
      },
      {
        label: (
          <NavLink to="/踩坑系列/react动态插入脚本潜在问题">
            react动态插入脚本潜在问题
          </NavLink>
        ),
        key: "/踩坑系列/react动态插入脚本潜在问题",
      },
      {
        label: (
          <NavLink to="/踩坑系列/rem一定是相对于html的fontsize属性吗">
            rem一定是相对于html的fontsize属性吗
          </NavLink>
        ),
        key: "/踩坑系列/rem一定是相对于html的fontsize属性吗",
      },
      {
        label: (
          <NavLink to="/踩坑系列/svg-mask-id重复的问题">
            svg-mask-id重复的问题
          </NavLink>
        ),
        key: "/踩坑系列/svg-mask-id重复的问题",
      },
      {
        label: (
          <NavLink to="/踩坑系列/timezone时区问题">timezone时区问题</NavLink>
        ),
        key: "/踩坑系列/timezone时区问题",
      },
      {
        label: (
          <NavLink to="/踩坑系列/transform等属性如何影响fixed定位">
            transform等属性如何影响fixed定位
          </NavLink>
        ),
        key: "/踩坑系列/transform等属性如何影响fixed定位",
      },
      {
        label: (
          <NavLink to="/踩坑系列/ul标签设置flex布局在部分浏览器内核上显示有问题">
            ul标签设置flex布局在部分浏览器内核上显示有问题
          </NavLink>
        ),
        key: "/踩坑系列/ul标签设置flex布局在部分浏览器内核上显示有问题",
      },
      {
        label: (
          <NavLink to="/踩坑系列/useLayoutEffect与useEffect的区别">
            useLayoutEffect与useEffect的区别
          </NavLink>
        ),
        key: "/踩坑系列/useLayoutEffect与useEffect的区别",
      },
      {
        label: (
          <NavLink to="/踩坑系列/从height百分比看浏览器的怪异模式">
            从height百分比看浏览器的怪异模式
          </NavLink>
        ),
        key: "/踩坑系列/从height百分比看浏览器的怪异模式",
      },
      {
        label: (
          <NavLink to="/踩坑系列/图片加载失败重载的问题">
            图片加载失败重载的问题
          </NavLink>
        ),
        key: "/踩坑系列/图片加载失败重载的问题",
      },
      {
        label: <NavLink to="/踩坑系列/按需加载的坑">按需加载的坑</NavLink>,
        key: "/踩坑系列/按需加载的坑",
      },
      {
        label: <NavLink to="/踩坑系列/移动端输入框">移动端输入框</NavLink>,
        key: "/踩坑系列/移动端输入框",
      },
      {
        label: (
          <NavLink to="/踩坑系列/移动端键盘顶起页面的问题">
            移动端键盘顶起页面的问题
          </NavLink>
        ),
        key: "/踩坑系列/移动端键盘顶起页面的问题",
      },
      {
        label: <NavLink to="/踩坑系列/谷歌翻译">谷歌翻译</NavLink>,
        key: "/踩坑系列/谷歌翻译",
      },
    ],
  },
];
export default MENU;
