import React from "react";
import { createHashRouter } from "react-router-dom";
import App from "../App";
const A00 = React.lazy(() =>
  import(/* webpackChunkName: "A00" */ "@/pages/SEO优化/SEO优化指南")
);
const A01 = React.lazy(() =>
  import(/* webpackChunkName: "A01" */ "@/pages/SEO优化/SEO优化清单")
);
const A10 = React.lazy(() =>
  import(/* webpackChunkName: "A10" */ "@/pages/cicd/基本介绍")
);
const A20 = React.lazy(() =>
  import(/* webpackChunkName: "A20" */ "@/pages/git/git合并其他仓库的分支")
);
const A21 = React.lazy(() =>
  import(/* webpackChunkName: "A21" */ "@/pages/git/git补丁应用")
);
const A22 = React.lazy(() =>
  import(/* webpackChunkName: "A22" */ "@/pages/git/优雅查看git提交历史的方法")
);
const A23 = React.lazy(() =>
  import(/* webpackChunkName: "A23" */ "@/pages/git/基于已有项目仓库初始化另一个新项目并保持git记录")
);
const A30 = React.lazy(() =>
  import(/* webpackChunkName: "A30" */ "@/pages/css/@import")
);
const A31 = React.lazy(() =>
  import(/* webpackChunkName: "A31" */ "@/pages/css/BFC块格式化上下文")
);
const A32 = React.lazy(() =>
  import(/* webpackChunkName: "A32" */ "@/pages/css/css权重")
);
const A33 = React.lazy(() =>
  import(/* webpackChunkName: "A33" */ "@/pages/css/css能够继承的属性")
);
const A34 = React.lazy(() =>
  import(/* webpackChunkName: "A34" */ "@/pages/css/css选择器解析的顺序")
);
const A35 = React.lazy(() =>
  import(/* webpackChunkName: "A35" */ "@/pages/css/transform等属性如何影像fixed定位")
);
const A40 = React.lazy(() =>
  import(/* webpackChunkName: "A40" */ "@/pages/hybrid/invoke")
);
const A41 = React.lazy(() =>
  import(/* webpackChunkName: "A41" */ "@/pages/hybrid/schema")
);
const A42 = React.lazy(() =>
  import(/* webpackChunkName: "A42" */ "@/pages/hybrid/基本知识")
);
const A43 = React.lazy(() =>
  import(/* webpackChunkName: "A43" */ "@/pages/hybrid/客户端和js通信方式")
);
const A50 = React.lazy(() =>
  import(/* webpackChunkName: "A50" */ "@/pages/javaScript/Object.create实现")
);
const A51 = React.lazy(() =>
  import(/* webpackChunkName: "A51" */ "@/pages/javaScript/compose高阶函数")
);
const A52 = React.lazy(() =>
  import(/* webpackChunkName: "A52" */ "@/pages/javaScript/generator&async-await")
);
const A53 = React.lazy(() =>
  import(/* webpackChunkName: "A53" */ "@/pages/javaScript/js创建对象的几种方法")
);
const A54 = React.lazy(() =>
  import(/* webpackChunkName: "A54" */ "@/pages/javaScript/js垃圾回收机制")
);
const A55 = React.lazy(() =>
  import(/* webpackChunkName: "A55" */ "@/pages/javaScript/js基础知识")
);
const A56 = React.lazy(() =>
  import(/* webpackChunkName: "A56" */ "@/pages/javaScript/js实现instanceof")
);
const A57 = React.lazy(() =>
  import(/* webpackChunkName: "A57" */ "@/pages/javaScript/js的继承")
);
const A58 = React.lazy(() =>
  import(/* webpackChunkName: "A58" */ "@/pages/javaScript/new的过程")
);
const A59 = React.lazy(() =>
  import(/* webpackChunkName: "A59" */ "@/pages/javaScript/script标签的async和defer属性")
);
const A510 = React.lazy(() =>
  import(/* webpackChunkName: "A510" */ "@/pages/javaScript/this的了解及call&apply&bind源码实现")
);
const A511 = React.lazy(() =>
  import(/* webpackChunkName: "A511" */ "@/pages/javaScript/尽量避免使用的API")
);
const A60 = React.lazy(() =>
  import(/* webpackChunkName: "A60" */ "@/pages/less/@media的嵌套")
);
const A61 = React.lazy(() =>
  import(/* webpackChunkName: "A61" */ "@/pages/less/escaping")
);
const A62 = React.lazy(() =>
  import(/* webpackChunkName: "A62" */ "@/pages/less/extend")
);
const A63 = React.lazy(() =>
  import(/* webpackChunkName: "A63" */ "@/pages/less/less总览")
);
const A64 = React.lazy(() =>
  import(/* webpackChunkName: "A64" */ "@/pages/less/mixins")
);
const A65 = React.lazy(() =>
  import(/* webpackChunkName: "A65" */ "@/pages/less/自定义函数")
);
const A70 = React.lazy(() =>
  import(/* webpackChunkName: "A70" */ "@/pages/node/node基础知识")
);
const A71 = React.lazy(() =>
  import(/* webpackChunkName: "A71" */ "@/pages/node/node多进程的实现")
);
const A80 = React.lazy(() =>
  import(/* webpackChunkName: "A80" */ "@/pages/redux/redux及react-redux")
);
const A90 = React.lazy(() =>
  import(/* webpackChunkName: "A90" */ "@/pages/typescript/typescript基础总结")
);
const A91 = React.lazy(() =>
  import(/* webpackChunkName: "A91" */ "@/pages/typescript/typescript装饰器")
);
const A100 = React.lazy(() =>
  import(/* webpackChunkName: "A100" */ "@/pages/react/React与Vue的区别")
);
const A101 = React.lazy(() =>
  import(/* webpackChunkName: "A101" */ "@/pages/react/fiber")
);
const A102 = React.lazy(() =>
  import(/* webpackChunkName: "A102" */ "@/pages/react/fiber极简版本react")
);
const A103 = React.lazy(() =>
  import(/* webpackChunkName: "A103" */ "@/pages/react/react-hooks的原理")
);
const A104 = React.lazy(() =>
  import(/* webpackChunkName: "A104" */ "@/pages/react/react.context")
);
const A105 = React.lazy(() =>
  import(/* webpackChunkName: "A105" */ "@/pages/react/react合成事件系统")
);
const A106 = React.lazy(() =>
  import(/* webpackChunkName: "A106" */ "@/pages/react/react生命周期")
);
const A107 = React.lazy(() =>
  import(/* webpackChunkName: "A107" */ "@/pages/react/setState同步异步更新的问题")
);
const A108 = React.lazy(() =>
  import(/* webpackChunkName: "A108" */ "@/pages/react/setState的过程")
);
const A109 = React.lazy(() =>
  import(/* webpackChunkName: "A109" */ "@/pages/react/为什么需要ReactHook")
);
const A110 = React.lazy(() =>
  import(/* webpackChunkName: "A110" */ "@/pages/webpack/loader和plugin的区别")
);
const A111 = React.lazy(() =>
  import(/* webpackChunkName: "A111" */ "@/pages/webpack/loader开发指南")
);
const A112 = React.lazy(() =>
  import(/* webpackChunkName: "A112" */ "@/pages/webpack/plugin开发指南")
);
const A113 = React.lazy(() =>
  import(/* webpackChunkName: "A113" */ "@/pages/webpack/sourcemap原理")
);
const A114 = React.lazy(() =>
  import(/* webpackChunkName: "A114" */ "@/pages/webpack/tapable")
);
const A115 = React.lazy(() =>
  import(/* webpackChunkName: "A115" */ "@/pages/webpack/webpack热更新原理")
);
const A116 = React.lazy(() =>
  import(/* webpackChunkName: "A116" */ "@/pages/webpack/如何提高webpack构建速度")
);
const A117 = React.lazy(() =>
  import(/* webpackChunkName: "A117" */ "@/pages/webpack/生产环境如何运用sourcemap定义js错误")
);
const A120 = React.lazy(() =>
  import(/* webpackChunkName: "A120" */ "@/pages/web优化/GPU加速")
);
const A121 = React.lazy(() =>
  import(/* webpackChunkName: "A121" */ "@/pages/web优化/web优化总结")
);
const A122 = React.lazy(() =>
  import(/* webpackChunkName: "A122" */ "@/pages/web优化/web性能指标及前端监控体系")
);
const A123 = React.lazy(() =>
  import(/* webpackChunkName: "A123" */ "@/pages/web优化/什么是CDN")
);
const A124 = React.lazy(() =>
  import(/* webpackChunkName: "A124" */ "@/pages/web优化/使用webp优化图片资源")
);
const A125 = React.lazy(() =>
  import(/* webpackChunkName: "A125" */ "@/pages/web优化/图片srcset优化")
);
const A126 = React.lazy(() =>
  import(/* webpackChunkName: "A126" */ "@/pages/web优化/高性能浏览器网络")
);
const A130 = React.lazy(() =>
  import(/* webpackChunkName: "A130" */ "@/pages/web优化总结/.DS_Store")
);
const A131 = React.lazy(() =>
  import(/* webpackChunkName: "A131" */ "@/pages/web优化总结/less样式写法优化")
);
const A132 = React.lazy(() =>
  import(/* webpackChunkName: "A132" */ "@/pages/web优化总结/webpack打包构建优化")
);
const A133 = React.lazy(() =>
  import(/* webpackChunkName: "A133" */ "@/pages/web优化总结/关键渲染路径")
);
const A134 = React.lazy(() =>
  import(/* webpackChunkName: "A134" */ "@/pages/web优化总结/大纲")
);
const A135 = React.lazy(() =>
  import(/* webpackChunkName: "A135" */ "@/pages/web优化总结/性能优化指标")
);
const A136 = React.lazy(() =>
  import(/* webpackChunkName: "A136" */ "@/pages/web优化总结/渲染优化")
);
const A137 = React.lazy(() =>
  import(/* webpackChunkName: "A137" */ "@/pages/web优化总结/用户交互体验优化")
);
const A138 = React.lazy(() =>
  import(/* webpackChunkName: "A138" */ "@/pages/web优化总结/移动端首屏优化")
);
const A139 = React.lazy(() =>
  import(/* webpackChunkName: "A139" */ "@/pages/web优化总结/组件代码优化")
);
const A1310 = React.lazy(() =>
  import(/* webpackChunkName: "A1310" */ "@/pages/web优化总结/读写分离")
);
const A140 = React.lazy(() =>
  import(/* webpackChunkName: "A140" */ "@/pages/前端路由/hash")
);
const A141 = React.lazy(() =>
  import(/* webpackChunkName: "A141" */ "@/pages/前端路由/history")
);
const A142 = React.lazy(() =>
  import(/* webpackChunkName: "A142" */ "@/pages/前端路由/前端路由原理")
);
const A150 = React.lazy(() =>
  import(/* webpackChunkName: "A150" */ "@/pages/加密算法/RSA算法流程概述")
);
const A160 = React.lazy(() =>
  import(/* webpackChunkName: "A160" */ "@/pages/web安全/SQL注入")
);
const A161 = React.lazy(() =>
  import(/* webpackChunkName: "A161" */ "@/pages/web安全/XSS攻击与防御")
);
const A162 = React.lazy(() =>
  import(/* webpackChunkName: "A162" */ "@/pages/web安全/cookie")
);
const A163 = React.lazy(() =>
  import(/* webpackChunkName: "A163" */ "@/pages/web安全/cookie的samesite属性")
);
const A164 = React.lazy(() =>
  import(/* webpackChunkName: "A164" */ "@/pages/web安全/csrf笔记")
);
const A165 = React.lazy(() =>
  import(/* webpackChunkName: "A165" */ "@/pages/web安全/web常见安全问题及防御")
);
const A166 = React.lazy(() =>
  import(/* webpackChunkName: "A166" */ "@/pages/web安全/传输安全")
);
const A167 = React.lazy(() =>
  import(/* webpackChunkName: "A167" */ "@/pages/web安全/密码安全")
);
const A168 = React.lazy(() =>
  import(/* webpackChunkName: "A168" */ "@/pages/web安全/点击劫持")
);
const A169 = React.lazy(() =>
  import(/* webpackChunkName: "A169" */ "@/pages/web安全/跨域")
);
const A170 = React.lazy(() =>
  import(/* webpackChunkName: "A170" */ "@/pages/动画/轮播图卷轴动画")
);
const A180 = React.lazy(() =>
  import(/* webpackChunkName: "A180" */ "@/pages/代码题/JS中三类循环对比及性能分析")
);
const A181 = React.lazy(() =>
  import(/* webpackChunkName: "A181" */ "@/pages/代码题/JS面向切面编程AOP")
);
const A182 = React.lazy(() =>
  import(/* webpackChunkName: "A182" */ "@/pages/代码题/compose组合函数及链式调用")
);
const A183 = React.lazy(() =>
  import(/* webpackChunkName: "A183" */ "@/pages/代码题/js实现精准倒计时")
);
const A184 = React.lazy(() =>
  import(/* webpackChunkName: "A184" */ "@/pages/代码题/js并发请求控制")
);
const A185 = React.lazy(() =>
  import(/* webpackChunkName: "A185" */ "@/pages/代码题/js深拷贝")
);
const A186 = React.lazy(() =>
  import(/* webpackChunkName: "A186" */ "@/pages/代码题/js的数据类型检测")
);
const A187 = React.lazy(() =>
  import(/* webpackChunkName: "A187" */ "@/pages/代码题/lazyMan函数")
);
const A188 = React.lazy(() =>
  import(/* webpackChunkName: "A188" */ "@/pages/代码题/两个对象的merge方法实现")
);
const A189 = React.lazy(() =>
  import(/* webpackChunkName: "A189" */ "@/pages/代码题/数组转树结构题目")
);
const A1810 = React.lazy(() =>
  import(/* webpackChunkName: "A1810" */ "@/pages/代码题/有意思的window.open")
);
const A1811 = React.lazy(() =>
  import(/* webpackChunkName: "A1811" */ "@/pages/代码题/模版字符串编译")
);
const A1812 = React.lazy(() =>
  import(/* webpackChunkName: "A1812" */ "@/pages/代码题/红绿灯")
);
const A1813 = React.lazy(() =>
  import(/* webpackChunkName: "A1813" */ "@/pages/代码题/重复请求取消")
);
const A1814 = React.lazy(() =>
  import(/* webpackChunkName: "A1814" */ "@/pages/代码题/链式调用-事件处理器-最长公共前缀")
);
const A1815 = React.lazy(() =>
  import(/* webpackChunkName: "A1815" */ "@/pages/代码题/防抖与节流")
);
const A1816 = React.lazy(() =>
  import(/* webpackChunkName: "A1816" */ "@/pages/代码题/阿拉伯数字转中文读法")
);
const A190 = React.lazy(() =>
  import(/* webpackChunkName: "A190" */ "@/pages/学习计划/2020年学习目标")
);
const A191 = React.lazy(() =>
  import(/* webpackChunkName: "A191" */ "@/pages/学习计划/2021年学习目标")
);
const A192 = React.lazy(() =>
  import(/* webpackChunkName: "A192" */ "@/pages/学习计划/2022年学习目标")
);
const A193 = React.lazy(() =>
  import(/* webpackChunkName: "A193" */ "@/pages/学习计划/2023年学习目标")
);
const A194 = React.lazy(() =>
  import(/* webpackChunkName: "A194" */ "@/pages/学习计划/5年回顾")
);
const A200 = React.lazy(() =>
  import(/* webpackChunkName: "A200" */ "@/pages/杂记/npm杂记")
);
const A201 = React.lazy(() =>
  import(/* webpackChunkName: "A201" */ "@/pages/杂记/web事件循环机制")
);
const A202 = React.lazy(() =>
  import(/* webpackChunkName: "A202" */ "@/pages/杂记/前端题目")
);
const A210 = React.lazy(() =>
  import(/* webpackChunkName: "A210" */ "@/pages/浏览器兼容/css")
);
const A211 = React.lazy(() =>
  import(/* webpackChunkName: "A211" */ "@/pages/浏览器兼容/getStyleProperty")
);
const A220 = React.lazy(() =>
  import(/* webpackChunkName: "A220" */ "@/pages/模块系统/JS模块循环加载原理(待整理)")
);
const A221 = React.lazy(() =>
  import(/* webpackChunkName: "A221" */ "@/pages/模块系统/JS模块系统")
);
const A222 = React.lazy(() =>
  import(/* webpackChunkName: "A222" */ "@/pages/模块系统/Node模块机制")
);
const A230 = React.lazy(() =>
  import(/* webpackChunkName: "A230" */ "@/pages/浏览器渲染/CRP关键渲染路径-从输入URL到页面呈现都发生了什么")
);
const A240 = React.lazy(() =>
  import(/* webpackChunkName: "A240" */ "@/pages/最佳实践/JS枚举的优雅写法")
);
const A241 = React.lazy(() =>
  import(/* webpackChunkName: "A241" */ "@/pages/最佳实践/Table表格的倒置用法")
);
const A242 = React.lazy(() =>
  import(/* webpackChunkName: "A242" */ "@/pages/最佳实践/Thinking-Of-React-Hook")
);
const A243 = React.lazy(() =>
  import(/* webpackChunkName: "A243" */ "@/pages/最佳实践/axios二次封装和API接口管理规范")
);
const A244 = React.lazy(() =>
  import(/* webpackChunkName: "A244" */ "@/pages/最佳实践/css实现dom视觉顺序调整")
);
const A245 = React.lazy(() =>
  import(/* webpackChunkName: "A245" */ "@/pages/最佳实践/hook与setInterval")
);
const A246 = React.lazy(() =>
  import(/* webpackChunkName: "A246" */ "@/pages/最佳实践/html标签未闭合的危害")
);
const A247 = React.lazy(() =>
  import(/* webpackChunkName: "A247" */ "@/pages/最佳实践/iframe_test")
);
const A248 = React.lazy(() =>
  import(/* webpackChunkName: "A248" */ "@/pages/最佳实践/promise.all如何判断哪个promise报错")
);
const A249 = React.lazy(() =>
  import(/* webpackChunkName: "A249" */ "@/pages/最佳实践/requestAnimationFrame")
);
const A2410 = React.lazy(() =>
  import(/* webpackChunkName: "A2410" */ "@/pages/最佳实践/requestAnimationFrame实现js防抖")
);
const A2411 = React.lazy(() =>
  import(/* webpackChunkName: "A2411" */ "@/pages/最佳实践/业务总结")
);
const A2412 = React.lazy(() =>
  import(/* webpackChunkName: "A2412" */ "@/pages/最佳实践/前端实现打印功能")
);
const A2413 = React.lazy(() =>
  import(/* webpackChunkName: "A2413" */ "@/pages/最佳实践/多次重复请求如何处理")
);
const A2414 = React.lazy(() =>
  import(/* webpackChunkName: "A2414" */ "@/pages/最佳实践/按需加载原理及加强版按需加载插件开发")
);
const A2415 = React.lazy(() =>
  import(/* webpackChunkName: "A2415" */ "@/pages/最佳实践/检测html标签未闭合的n种方案")
);
const A2416 = React.lazy(() =>
  import(/* webpackChunkName: "A2416" */ "@/pages/最佳实践/纯CSS实现元素尺寸比例保持不变")
);
const A2417 = React.lazy(() =>
  import(/* webpackChunkName: "A2417" */ "@/pages/最佳实践/纯CSS实现滚动添加阴影")
);
const A2418 = React.lazy(() =>
  import(/* webpackChunkName: "A2418" */ "@/pages/最佳实践/组件设计及第三方库引用")
);
const A2419 = React.lazy(() =>
  import(/* webpackChunkName: "A2419" */ "@/pages/最佳实践/防抖与节流")
);
const A2420 = React.lazy(() =>
  import(/* webpackChunkName: "A2420" */ "@/pages/最佳实践/页面复用还是组件复用")
);
const A250 = React.lazy(() =>
  import(/* webpackChunkName: "A250" */ "@/pages/网络/Cache-Control支持的值")
);
const A251 = React.lazy(() =>
  import(/* webpackChunkName: "A251" */ "@/pages/网络/DNS寻址")
);
const A252 = React.lazy(() =>
  import(/* webpackChunkName: "A252" */ "@/pages/网络/HTTP3详解")
);
const A253 = React.lazy(() =>
  import(/* webpackChunkName: "A253" */ "@/pages/网络/HTTP缓存")
);
const A254 = React.lazy(() =>
  import(/* webpackChunkName: "A254" */ "@/pages/网络/SSL&TLS详细介绍")
);
const A255 = React.lazy(() =>
  import(/* webpackChunkName: "A255" */ "@/pages/网络/TCP")
);
const A256 = React.lazy(() =>
  import(/* webpackChunkName: "A256" */ "@/pages/网络/get和post方法的比较")
);
const A257 = React.lazy(() =>
  import(/* webpackChunkName: "A257" */ "@/pages/网络/http2服务器推送")
);
const A258 = React.lazy(() =>
  import(/* webpackChunkName: "A258" */ "@/pages/网络/http2简介")
);
const A259 = React.lazy(() =>
  import(/* webpackChunkName: "A259" */ "@/pages/网络/https简介及与http的区别")
);
const A2510 = React.lazy(() =>
  import(/* webpackChunkName: "A2510" */ "@/pages/网络/http协议及各版本的差别")
);
const A2511 = React.lazy(() =>
  import(/* webpackChunkName: "A2511" */ "@/pages/网络/http请求头字段")
);
const A2512 = React.lazy(() =>
  import(/* webpackChunkName: "A2512" */ "@/pages/网络/http请求状态码")
);
const A2513 = React.lazy(() =>
  import(/* webpackChunkName: "A2513" */ "@/pages/网络/server-sent-event(SSE)")
);
const A2514 = React.lazy(() =>
  import(/* webpackChunkName: "A2514" */ "@/pages/网络/serviceWorker")
);
const A2515 = React.lazy(() =>
  import(/* webpackChunkName: "A2515" */ "@/pages/网络/webAssembly")
);
const A2516 = React.lazy(() =>
  import(/* webpackChunkName: "A2516" */ "@/pages/网络/webRTC")
);
const A2517 = React.lazy(() =>
  import(/* webpackChunkName: "A2517" */ "@/pages/网络/webWorker")
);
const A2518 = React.lazy(() =>
  import(/* webpackChunkName: "A2518" */ "@/pages/网络/websocket与http的区别")
);
const A2519 = React.lazy(() =>
  import(/* webpackChunkName: "A2519" */ "@/pages/网络/协商缓存中Etag的生成规则")
);
const A2520 = React.lazy(() =>
  import(/* webpackChunkName: "A2520" */ "@/pages/网络/图解计算机网络")
);
const A260 = React.lazy(() =>
  import(/* webpackChunkName: "A260" */ "@/pages/踩坑系列/302重定向到同源网站cookie丢失的问题")
);
const A261 = React.lazy(() =>
  import(/* webpackChunkName: "A261" */ "@/pages/踩坑系列/flex布局水平居中导致水平滚动出现问题")
);
const A262 = React.lazy(() =>
  import(/* webpackChunkName: "A262" */ "@/pages/踩坑系列/getElementByClass查询结果实时性问题")
);
const A263 = React.lazy(() =>
  import(/* webpackChunkName: "A263" */ "@/pages/踩坑系列/http请求头referer踩坑")
);
const A264 = React.lazy(() =>
  import(/* webpackChunkName: "A264" */ "@/pages/踩坑系列/iframe的src和window.location.href")
);
const A265 = React.lazy(() =>
  import(/* webpackChunkName: "A265" */ "@/pages/踩坑系列/js实现复制粘贴保留原格式")
);
const A266 = React.lazy(() =>
  import(/* webpackChunkName: "A266" */ "@/pages/踩坑系列/js正则表达式动态模式")
);
const A267 = React.lazy(() =>
  import(/* webpackChunkName: "A267" */ "@/pages/踩坑系列/react动态插入脚本潜在问题")
);
const A268 = React.lazy(() =>
  import(/* webpackChunkName: "A268" */ "@/pages/踩坑系列/rem一定是相对于html的fontsize属性吗")
);
const A269 = React.lazy(() =>
  import(/* webpackChunkName: "A269" */ "@/pages/踩坑系列/svg-mask-id重复的问题")
);
const A2610 = React.lazy(() =>
  import(/* webpackChunkName: "A2610" */ "@/pages/踩坑系列/timezone时区问题")
);
const A2611 = React.lazy(() =>
  import(/* webpackChunkName: "A2611" */ "@/pages/踩坑系列/transform等属性如何影响fixed定位")
);
const A2612 = React.lazy(() =>
  import(/* webpackChunkName: "A2612" */ "@/pages/踩坑系列/ul标签设置flex布局在部分浏览器内核上显示有问题")
);
const A2613 = React.lazy(() =>
  import(/* webpackChunkName: "A2613" */ "@/pages/踩坑系列/useLayoutEffect与useEffect的区别")
);
const A2614 = React.lazy(() =>
  import(/* webpackChunkName: "A2614" */ "@/pages/踩坑系列/从height百分比看浏览器的怪异模式")
);
const A2615 = React.lazy(() =>
  import(/* webpackChunkName: "A2615" */ "@/pages/踩坑系列/图片加载失败重载的问题")
);
const A2616 = React.lazy(() =>
  import(/* webpackChunkName: "A2616" */ "@/pages/踩坑系列/按需加载的坑")
);
const A2617 = React.lazy(() =>
  import(/* webpackChunkName: "A2617" */ "@/pages/踩坑系列/移动端输入框")
);
const A2618 = React.lazy(() =>
  import(/* webpackChunkName: "A2618" */ "@/pages/踩坑系列/移动端键盘顶起页面的问题")
);
const A2619 = React.lazy(() =>
  import(/* webpackChunkName: "A2619" */ "@/pages/踩坑系列/谷歌翻译")
);
const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/SEO优化/SEO优化指南",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A00 />
          </React.Suspense>
        ),
      },{
        path: "/SEO优化/SEO优化清单",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A01 />
          </React.Suspense>
        ),
      },{
        path: "/cicd/基本介绍",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A10 />
          </React.Suspense>
        ),
      },{
        path: "/git/git合并其他仓库的分支",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A20 />
          </React.Suspense>
        ),
      },{
        path: "/git/git补丁应用",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A21 />
          </React.Suspense>
        ),
      },{
        path: "/git/优雅查看git提交历史的方法",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A22 />
          </React.Suspense>
        ),
      },{
        path: "/git/基于已有项目仓库初始化另一个新项目并保持git记录",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A23 />
          </React.Suspense>
        ),
      },{
        path: "/css/@import",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A30 />
          </React.Suspense>
        ),
      },{
        path: "/css/BFC块格式化上下文",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A31 />
          </React.Suspense>
        ),
      },{
        path: "/css/css权重",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A32 />
          </React.Suspense>
        ),
      },{
        path: "/css/css能够继承的属性",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A33 />
          </React.Suspense>
        ),
      },{
        path: "/css/css选择器解析的顺序",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A34 />
          </React.Suspense>
        ),
      },{
        path: "/css/transform等属性如何影像fixed定位",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A35 />
          </React.Suspense>
        ),
      },{
        path: "/hybrid/invoke",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A40 />
          </React.Suspense>
        ),
      },{
        path: "/hybrid/schema",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A41 />
          </React.Suspense>
        ),
      },{
        path: "/hybrid/基本知识",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A42 />
          </React.Suspense>
        ),
      },{
        path: "/hybrid/客户端和js通信方式",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A43 />
          </React.Suspense>
        ),
      },{
        path: "/javaScript/Object.create实现",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A50 />
          </React.Suspense>
        ),
      },{
        path: "/javaScript/compose高阶函数",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A51 />
          </React.Suspense>
        ),
      },{
        path: "/javaScript/generator&async-await",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A52 />
          </React.Suspense>
        ),
      },{
        path: "/javaScript/js创建对象的几种方法",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A53 />
          </React.Suspense>
        ),
      },{
        path: "/javaScript/js垃圾回收机制",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A54 />
          </React.Suspense>
        ),
      },{
        path: "/javaScript/js基础知识",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A55 />
          </React.Suspense>
        ),
      },{
        path: "/javaScript/js实现instanceof",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A56 />
          </React.Suspense>
        ),
      },{
        path: "/javaScript/js的继承",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A57 />
          </React.Suspense>
        ),
      },{
        path: "/javaScript/new的过程",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A58 />
          </React.Suspense>
        ),
      },{
        path: "/javaScript/script标签的async和defer属性",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A59 />
          </React.Suspense>
        ),
      },{
        path: "/javaScript/this的了解及call&apply&bind源码实现",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A510 />
          </React.Suspense>
        ),
      },{
        path: "/javaScript/尽量避免使用的API",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A511 />
          </React.Suspense>
        ),
      },{
        path: "/less/@media的嵌套",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A60 />
          </React.Suspense>
        ),
      },{
        path: "/less/escaping",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A61 />
          </React.Suspense>
        ),
      },{
        path: "/less/extend",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A62 />
          </React.Suspense>
        ),
      },{
        path: "/less/less总览",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A63 />
          </React.Suspense>
        ),
      },{
        path: "/less/mixins",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A64 />
          </React.Suspense>
        ),
      },{
        path: "/less/自定义函数",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A65 />
          </React.Suspense>
        ),
      },{
        path: "/node/node基础知识",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A70 />
          </React.Suspense>
        ),
      },{
        path: "/node/node多进程的实现",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A71 />
          </React.Suspense>
        ),
      },{
        path: "/redux/redux及react-redux",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A80 />
          </React.Suspense>
        ),
      },{
        path: "/typescript/typescript基础总结",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A90 />
          </React.Suspense>
        ),
      },{
        path: "/typescript/typescript装饰器",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A91 />
          </React.Suspense>
        ),
      },{
        path: "/react/React与Vue的区别",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A100 />
          </React.Suspense>
        ),
      },{
        path: "/react/fiber",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A101 />
          </React.Suspense>
        ),
      },{
        path: "/react/fiber极简版本react",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A102 />
          </React.Suspense>
        ),
      },{
        path: "/react/react-hooks的原理",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A103 />
          </React.Suspense>
        ),
      },{
        path: "/react/react.context",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A104 />
          </React.Suspense>
        ),
      },{
        path: "/react/react合成事件系统",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A105 />
          </React.Suspense>
        ),
      },{
        path: "/react/react生命周期",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A106 />
          </React.Suspense>
        ),
      },{
        path: "/react/setState同步异步更新的问题",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A107 />
          </React.Suspense>
        ),
      },{
        path: "/react/setState的过程",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A108 />
          </React.Suspense>
        ),
      },{
        path: "/react/为什么需要ReactHook",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A109 />
          </React.Suspense>
        ),
      },{
        path: "/webpack/loader和plugin的区别",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A110 />
          </React.Suspense>
        ),
      },{
        path: "/webpack/loader开发指南",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A111 />
          </React.Suspense>
        ),
      },{
        path: "/webpack/plugin开发指南",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A112 />
          </React.Suspense>
        ),
      },{
        path: "/webpack/sourcemap原理",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A113 />
          </React.Suspense>
        ),
      },{
        path: "/webpack/tapable",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A114 />
          </React.Suspense>
        ),
      },{
        path: "/webpack/webpack热更新原理",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A115 />
          </React.Suspense>
        ),
      },{
        path: "/webpack/如何提高webpack构建速度",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A116 />
          </React.Suspense>
        ),
      },{
        path: "/webpack/生产环境如何运用sourcemap定义js错误",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A117 />
          </React.Suspense>
        ),
      },{
        path: "/web优化/GPU加速",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A120 />
          </React.Suspense>
        ),
      },{
        path: "/web优化/web优化总结",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A121 />
          </React.Suspense>
        ),
      },{
        path: "/web优化/web性能指标及前端监控体系",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A122 />
          </React.Suspense>
        ),
      },{
        path: "/web优化/什么是CDN",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A123 />
          </React.Suspense>
        ),
      },{
        path: "/web优化/使用webp优化图片资源",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A124 />
          </React.Suspense>
        ),
      },{
        path: "/web优化/图片srcset优化",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A125 />
          </React.Suspense>
        ),
      },{
        path: "/web优化/高性能浏览器网络",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A126 />
          </React.Suspense>
        ),
      },{
        path: "/web优化总结/.DS_Store",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A130 />
          </React.Suspense>
        ),
      },{
        path: "/web优化总结/less样式写法优化",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A131 />
          </React.Suspense>
        ),
      },{
        path: "/web优化总结/webpack打包构建优化",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A132 />
          </React.Suspense>
        ),
      },{
        path: "/web优化总结/关键渲染路径",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A133 />
          </React.Suspense>
        ),
      },{
        path: "/web优化总结/大纲",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A134 />
          </React.Suspense>
        ),
      },{
        path: "/web优化总结/性能优化指标",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A135 />
          </React.Suspense>
        ),
      },{
        path: "/web优化总结/渲染优化",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A136 />
          </React.Suspense>
        ),
      },{
        path: "/web优化总结/用户交互体验优化",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A137 />
          </React.Suspense>
        ),
      },{
        path: "/web优化总结/移动端首屏优化",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A138 />
          </React.Suspense>
        ),
      },{
        path: "/web优化总结/组件代码优化",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A139 />
          </React.Suspense>
        ),
      },{
        path: "/web优化总结/读写分离",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A1310 />
          </React.Suspense>
        ),
      },{
        path: "/前端路由/hash",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A140 />
          </React.Suspense>
        ),
      },{
        path: "/前端路由/history",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A141 />
          </React.Suspense>
        ),
      },{
        path: "/前端路由/前端路由原理",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A142 />
          </React.Suspense>
        ),
      },{
        path: "/加密算法/RSA算法流程概述",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A150 />
          </React.Suspense>
        ),
      },{
        path: "/web安全/SQL注入",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A160 />
          </React.Suspense>
        ),
      },{
        path: "/web安全/XSS攻击与防御",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A161 />
          </React.Suspense>
        ),
      },{
        path: "/web安全/cookie",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A162 />
          </React.Suspense>
        ),
      },{
        path: "/web安全/cookie的samesite属性",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A163 />
          </React.Suspense>
        ),
      },{
        path: "/web安全/csrf笔记",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A164 />
          </React.Suspense>
        ),
      },{
        path: "/web安全/web常见安全问题及防御",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A165 />
          </React.Suspense>
        ),
      },{
        path: "/web安全/传输安全",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A166 />
          </React.Suspense>
        ),
      },{
        path: "/web安全/密码安全",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A167 />
          </React.Suspense>
        ),
      },{
        path: "/web安全/点击劫持",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A168 />
          </React.Suspense>
        ),
      },{
        path: "/web安全/跨域",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A169 />
          </React.Suspense>
        ),
      },{
        path: "/动画/轮播图卷轴动画",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A170 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/JS中三类循环对比及性能分析",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A180 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/JS面向切面编程AOP",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A181 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/compose组合函数及链式调用",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A182 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/js实现精准倒计时",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A183 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/js并发请求控制",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A184 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/js深拷贝",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A185 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/js的数据类型检测",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A186 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/lazyMan函数",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A187 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/两个对象的merge方法实现",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A188 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/数组转树结构题目",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A189 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/有意思的window.open",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A1810 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/模版字符串编译",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A1811 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/红绿灯",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A1812 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/重复请求取消",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A1813 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/链式调用-事件处理器-最长公共前缀",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A1814 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/防抖与节流",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A1815 />
          </React.Suspense>
        ),
      },{
        path: "/代码题/阿拉伯数字转中文读法",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A1816 />
          </React.Suspense>
        ),
      },{
        path: "/学习计划/2020年学习目标",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A190 />
          </React.Suspense>
        ),
      },{
        path: "/学习计划/2021年学习目标",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A191 />
          </React.Suspense>
        ),
      },{
        path: "/学习计划/2022年学习目标",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A192 />
          </React.Suspense>
        ),
      },{
        path: "/学习计划/2023年学习目标",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A193 />
          </React.Suspense>
        ),
      },{
        path: "/学习计划/5年回顾",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A194 />
          </React.Suspense>
        ),
      },{
        path: "/杂记/npm杂记",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A200 />
          </React.Suspense>
        ),
      },{
        path: "/杂记/web事件循环机制",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A201 />
          </React.Suspense>
        ),
      },{
        path: "/杂记/前端题目",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A202 />
          </React.Suspense>
        ),
      },{
        path: "/浏览器兼容/css",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A210 />
          </React.Suspense>
        ),
      },{
        path: "/浏览器兼容/getStyleProperty",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A211 />
          </React.Suspense>
        ),
      },{
        path: "/模块系统/JS模块循环加载原理(待整理)",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A220 />
          </React.Suspense>
        ),
      },{
        path: "/模块系统/JS模块系统",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A221 />
          </React.Suspense>
        ),
      },{
        path: "/模块系统/Node模块机制",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A222 />
          </React.Suspense>
        ),
      },{
        path: "/浏览器渲染/CRP关键渲染路径-从输入URL到页面呈现都发生了什么",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A230 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/JS枚举的优雅写法",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A240 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/Table表格的倒置用法",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A241 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/Thinking-Of-React-Hook",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A242 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/axios二次封装和API接口管理规范",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A243 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/css实现dom视觉顺序调整",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A244 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/hook与setInterval",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A245 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/html标签未闭合的危害",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A246 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/iframe_test",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A247 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/promise.all如何判断哪个promise报错",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A248 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/requestAnimationFrame",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A249 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/requestAnimationFrame实现js防抖",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2410 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/业务总结",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2411 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/前端实现打印功能",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2412 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/多次重复请求如何处理",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2413 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/按需加载原理及加强版按需加载插件开发",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2414 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/检测html标签未闭合的n种方案",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2415 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/纯CSS实现元素尺寸比例保持不变",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2416 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/纯CSS实现滚动添加阴影",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2417 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/组件设计及第三方库引用",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2418 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/防抖与节流",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2419 />
          </React.Suspense>
        ),
      },{
        path: "/最佳实践/页面复用还是组件复用",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2420 />
          </React.Suspense>
        ),
      },{
        path: "/网络/Cache-Control支持的值",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A250 />
          </React.Suspense>
        ),
      },{
        path: "/网络/DNS寻址",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A251 />
          </React.Suspense>
        ),
      },{
        path: "/网络/HTTP3详解",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A252 />
          </React.Suspense>
        ),
      },{
        path: "/网络/HTTP缓存",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A253 />
          </React.Suspense>
        ),
      },{
        path: "/网络/SSL&TLS详细介绍",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A254 />
          </React.Suspense>
        ),
      },{
        path: "/网络/TCP",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A255 />
          </React.Suspense>
        ),
      },{
        path: "/网络/get和post方法的比较",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A256 />
          </React.Suspense>
        ),
      },{
        path: "/网络/http2服务器推送",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A257 />
          </React.Suspense>
        ),
      },{
        path: "/网络/http2简介",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A258 />
          </React.Suspense>
        ),
      },{
        path: "/网络/https简介及与http的区别",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A259 />
          </React.Suspense>
        ),
      },{
        path: "/网络/http协议及各版本的差别",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2510 />
          </React.Suspense>
        ),
      },{
        path: "/网络/http请求头字段",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2511 />
          </React.Suspense>
        ),
      },{
        path: "/网络/http请求状态码",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2512 />
          </React.Suspense>
        ),
      },{
        path: "/网络/server-sent-event(SSE)",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2513 />
          </React.Suspense>
        ),
      },{
        path: "/网络/serviceWorker",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2514 />
          </React.Suspense>
        ),
      },{
        path: "/网络/webAssembly",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2515 />
          </React.Suspense>
        ),
      },{
        path: "/网络/webRTC",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2516 />
          </React.Suspense>
        ),
      },{
        path: "/网络/webWorker",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2517 />
          </React.Suspense>
        ),
      },{
        path: "/网络/websocket与http的区别",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2518 />
          </React.Suspense>
        ),
      },{
        path: "/网络/协商缓存中Etag的生成规则",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2519 />
          </React.Suspense>
        ),
      },{
        path: "/网络/图解计算机网络",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2520 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/302重定向到同源网站cookie丢失的问题",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A260 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/flex布局水平居中导致水平滚动出现问题",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A261 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/getElementByClass查询结果实时性问题",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A262 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/http请求头referer踩坑",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A263 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/iframe的src和window.location.href",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A264 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/js实现复制粘贴保留原格式",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A265 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/js正则表达式动态模式",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A266 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/react动态插入脚本潜在问题",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A267 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/rem一定是相对于html的fontsize属性吗",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A268 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/svg-mask-id重复的问题",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A269 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/timezone时区问题",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2610 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/transform等属性如何影响fixed定位",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2611 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/ul标签设置flex布局在部分浏览器内核上显示有问题",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2612 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/useLayoutEffect与useEffect的区别",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2613 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/从height百分比看浏览器的怪异模式",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2614 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/图片加载失败重载的问题",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2615 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/按需加载的坑",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2616 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/移动端输入框",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2617 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/移动端键盘顶起页面的问题",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2618 />
          </React.Suspense>
        ),
      },{
        path: "/踩坑系列/谷歌翻译",
        element: (
          <React.Suspense fallback={<div>loading...</div>}>
            <A2619 />
          </React.Suspense>
        ),
      }
    ],
  },
]);

export default router;