```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>history实现前端路由方式</title>
  </head>
  <style>
    .container {
      display: flex;
      height: 500px;
    }
    .menu {
      text-align: center;
      width: 200px;
      border-right: 1px solid #e8e8e8;
    }
    #route {
      flex: 1;
      margin-left: 20px;
    }
  </style>
  <body>
    <div class="container">
      <div class="menu">
        <div>
          <a href="/home">home</a>
        </div>
        <div>
          <a href="/about">about</a>
        </div>
      </div>
      <div id="route"></div>
    </div>
  </body>
  <script>
    window.onload = function () {
      var route = document.getElementById("route");
      function onPopState() {
        console.log("onPopState...", location.pathname);
        switch (location.pathname) {
          case "/home":
            route.innerHTML = "Home";
            return;
          case "/about":
            route.innerHTML = "About";
            return;
          default:
            return;
        }
      }
      // 1.只有浏览器前进后退会触发popstate事件
      // 2.点击a标签改变URL并不会触发popstate事件。
      // 3.通过 replaceState或者 pushState不会触发popstate
      window.addEventListener("popstate", onPopState);
      onPopState();
      var links = document.querySelectorAll("a[href]");
      links.forEach(function (link) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          history.pushState(null, "", link.getAttribute("href"));
          // history.pushState不会触发popState事件，因此需要手动调用onPopState
          onPopState();
        });
      });
    };
  </script>
</html>
```
