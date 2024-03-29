## 背景

我们的服务通过 nginx 负载均衡部署到/demo 路径下，比如http://www.myhost.com/demo。用户可以通过http://www.myhost.com/demo或者http://www.myhost.com/demo/访问我们的服务。这两种方式的区别是路径后面带或者不带斜杠

实际上，对于用户而言，带或者不带斜杠是没有区别的。不带斜杠，反而输入快捷点

但是对于服务器而言，不带斜杠表示文件，带斜杠表示目录。服务器对这两者的处理不同。如果我们不带斜杠，服务器首先会查找是否有 demo 这个文件，如果有，则将 demo 文件返回给浏览器。如果没有，则会继续查找是否有 demo 这个目录，如果有，则将 demo 目录下的 index.html 文件返回给浏览器。可以看出，对服务器而言，带斜杠的性能会好点

**我们今天重点要讲的一个区别是，对于前端动态 import 来说。如果用户带或者不带斜杠访问我们的网站差别很大。**

用户可以通过 http://www.myhost.com/demo 或者 http://www.myhost.com/demo/ 访问我们的网站，这两种方式都是返回下面的 html 文件：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>相对路径</title>
  </head>
  <body>
    <div id="root">带或者不带斜杠对相对路径的影响</div>
    <script>
      import("./dynamic-chunk.js").then((res) => {
        console.log("res...", res);
      });
    </script>
  </body>
</html>
```

如果用户不带斜杠访问 http://www.myhost.com/demo，那么动态import实际上请求的是`http://www.myhost.com/dynamic-chunk.js`，就会导致资源访问失败

如果用户带斜杠访问 http://www.myhost.com/demo/，浏览器实际请求的是 `http://www.myhost.com/demo/dynamic-chunk.js`，资源请求成功。

所以造成这一区别的具体原因是什么？

## 问题分析
