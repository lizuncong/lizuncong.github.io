```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>JS和客户端通讯的schema协议</title>
  </head>
  <body>
    <button id="btn">扫一扫</button>
    <script type="text/javascript">
      function invokeScan() {
        window["_invoke_scan_callback_"] = function (result) {
          console.log(result);
        };

        var iframe = document.createElement("iframe");
        iframe.style.display = "none";
        // iframe.src = 'weixin://dl/scan'
        iframe.src =
          "weixin://dl/scan?k1=v1&k2=v2&k3=v3&callback=_invoke_scan_callback_";
        var body = document.body;
        body.appendChild(iframe);

        setTimeout(() => {
          body.removeChild(iframe);
          iframe = null;
        });
      }

      document.getElementById("btn").addEventListener("click", function () {
        invokeScan();
      });
    </script>
  </body>
</html>
```
