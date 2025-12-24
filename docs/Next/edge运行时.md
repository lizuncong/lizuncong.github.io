## Edge Runtime

本节使用最小的 node.js demo 演示如何 cloudflare 边缘节点服务器如何运行中间件。

demo 仓库地址：[https://github.com/lizuncong/node-edge](https://github.com/lizuncong/node-edge)

### 代码文件

edge/middleware.js: 运行在 Cloudflare Workers（边缘） 的中间件，用来做鉴权、加头等。

```js
// 运行在 Cloudflare Workers，语法与 Service Worker 一致
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. 边缘中间件逻辑示例：简单鉴权
    const cookie = request.headers.get("cookie") || "";
    const isLogin = cookie.includes("token=");

    // 2. 未登录且访问 /admin 则直接在边缘拦截
    if (url.pathname.startsWith("/admin") && !isLogin) {
      return new Response("Forbidden at Edge by lzc\n", { status: 403 });
    }

    // 3. 把「边缘计算结果」通过请求头带给源站
    const newHdr = new Headers(request.headers);
    newHdr.set("x-edge-authenticated", isLogin ? "1" : "0");

    // 4. 回源（你的 Node 服务器）
    //    在 wrangler.toml 里配置 upstream = "http://1.2.3.4:8080"
    // return fetch(new Request(request, { headers: newHdr }));

    // 4. 通过 Cloudflare Tunnel 回源到你本地 Node 服务
    //    env.UPSTREAM 形如 "https://xxx-yyy-zzz.trycloudflare.com"
    const upstreamBase =
      "https://designed-comp-iowa-packages.trycloudflare.com";
    const upstreamUrl = new URL(url.pathname + url.search, upstreamBase);

    const newRequest = new Request(upstreamUrl.toString(), {
      method: request.method,
      headers: newHdr,
      body: request.body,
      redirect: "follow",
    });

    const resp = await fetch(newRequest);
    // 克隆响应，并追加/修改头部
    const newResp = new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: new Headers(resp.headers),
    });
    newResp.headers.set("x-my-time", `${Date.now()}`);
    // 也可以一次性加多个：
    // newResp.headers.set("server-timing", "cfEdge;dur=1,cfOrigin;dur=88");

    return newResp;
  },
};
```

src/index.js 文件：一个 Node.js 的 http 服务，不能直接跑在 Cloudflare，需要你自己部署在一个服务器上（VPS、云主机、Docker 等），Cloudflare Workers 再“回源”到它

```js
const http = require("http");
const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  // 读取边缘函数塞进来的头
  const edgeAuth = req.headers["x-edge-authenticated"] === "1";
  const xforwardedfor = req.headers["x-forwarded-for"] || "";
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      `Hello from Node! autha - ${Date.now()}- ${xforwardedfor} -${edgeAuth}\n`
    );
    return;
  }

  if (req.url === "/admin") {
    // 边缘已经放过，这里不用再鉴权，直接给后台内容
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Admin Dashboard —— no auth\n");
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`Node server listening on ${PORT}`);
});
```

wrangler.toml 配置：Cloudflare 的配置文件

```bash
name = "my-node-middleware"
main = "edge/middleware.js"
compatibility_date = "2024-01-01"

# 回源地址：你的 Node 服务公网 IP（或局域网 + 隧道）
[env.production]
upstream_protocol = "http"
#upstream_host = "183.240.99.224:443"   # 改成你的 Node 服务 IP:端口"
UPSTREAM = "https://designed-comp-iowa-packages.trycloudflare.com"
```

如果是线上环境：
upstream_host 改成你部署 Node 服务的公网地址，比如：
api.example.com:8080 或 123.123.123.123:8080

> 注意：Cloudflare Workers 默认会对外请求 fetch(request) 的原始 URL，如果你想强制回源到特定 IP/域名/端口，需要在 Workers 代码里使用这些配置（目前 middleware.js 里只是 return fetch(new Request(request, { headers: newHdr }));，这会直接请求原始地址）。

### 部署

#### 安装依赖

```bash
npm install -g wrangler
```

#### 部署 Node 源站服务（src/index.js）

Cloudflare 只能跑 edge/middleware.js 这种 Workers 代码，你的 Node 服务要部署在别处，比如：一台云服务器（腾讯云、阿里云、AWS、GCP、Vultr 等）或者 Render、Railway、Fly.io 等 Node 托管平台，或者你自己机器 + 内网穿透（用于测试）。部署后，把 IP:端口 写进 wrangler.toml 的 upstream_host（如果你后面在 Workers 里使用它）

#### 登录 Cloudflare 并本地调试 Workers

- 1.登录 Cloudflare 账号，在项目根目录执行：

```js
npx wrangler login
```

浏览器会弹出让你授权，选择你的 Cloudflare 账号即可。

- 2.本地开发/调试

```bash
npx wrangler dev
```

默认会用 wrangler.toml 的配置，运行 edge/middleware.js，你可以在本地访问 wrangler 提供的本地地址来调试

#### 部署 Cloudflare Workers 到线上

确认本地调试没问题后，发布 Workers：

```js
npx wrangler deploy
```

成功后，会输出一个 Workers 的 URL，类似：https://my-node-middleware.your-account.workers.dev。访问这个地址：

- 访问 /：应该会触发 Workers，然后回源 Node 服务，返回 Hello from Node! 边缘已鉴权：...
- 访问 /admin：
  - 未带 token cookie 时，应该直接在边缘返回 403 Forbidden at Edge
  - 带上 token=xxx 的 cookie 时，Workers 会放行并加上 x-edge-authenticated: 1 头，然后 Node 返回 Admin 页面。

#### 绑定到你自己的域名（可选但常用）

确认你的域名已经接入 Cloudflare（DNS 由 Cloudflare 托管）。在 Cloudflare 面板中：

- 进入对应域名 → Workers & Pages → 找到你刚刚发布的 Worker。
- 添加 Route（路由），比如： + https://example.com/_ 都走这个 Worker + 或 /admin_ 等特定路径走 Worker
  保存后，访问 https://example.com/ 或对应路径，就会通过 Cloudflare Workers → 回源你的 Node 服务。

### 如何部署本地服务？

如果没有服务器，如何部署？

如果没有服务器，可以本地跑 Node 服务（src/index.js，端口 8080），再用 内网穿透 暴露一个公网 HTTPS 地址，Cloudflare Worker 就回源这个地址。最推荐的是用 Cloudflare Tunnel（cloudflared），因为和 Cloudflare 同家，免费好用。

#### 一、本地先把 Node 服务跑起来

```js
node src/index.js
```

或用 nodemon/pm2 等守护，这里先简单起步，确保在浏览器打开 http://localhost:8080/ 能看到：Hello from Node! 边缘已鉴权：false 之类文字。

#### 二、安装并运行 Cloudflare Tunnel（临时隧道方式）

- 1. 安装 cloudflared（macOS）

```bash
brew install cloudflared
```

- 2. 启动一个临时隧道指向本地 8080

```bash
cloudflared tunnel --url http://localhost:8080
```

几秒后终端会出现类似：

```bash
INFO ... Starting tunnel
INFO ... Route propagating, it may take up to 1 minute crowd:
INFO ... Your URL: https://xxx-yyy-zzz.trycloudflare.com
```

- 这里的 https://xxx-yyy-zzz.trycloudflare.com 就是 公网可访问你本地 8080 的地址。
- 你可以先在浏览器直接打开这个 URL，确认能看到 Node 返回的内容。
  > 只要这个命令在跑，你的本地服务就能被公网访问；关掉这个命令，隧道就失效（适合开发调试）。

#### 三、把这个隧道地址写进 Worker 配置

- 1. 在 wrangler.toml 里加变量
     打开你现在的 wrangler.toml（你已经有这个文件了），改成类似这样：

```bash
name = "my-node-middleware"
main = "edge/middleware.js"
compatibility_date = "2024-01-01"

[vars]
UPSTREAM = "https://xxx-yyy-zzz.trycloudflare.com"
```

- 把 UPSTREAM 的值改成你刚才 cloudflared 输出的那个 https://xxx-yyy-zzz.trycloudflare.com。
  > 之前 wrangler.toml 里的 [env.production] upstream_host = "1.2.3.4:8080" 这一套可以先删掉 / 注释掉，因为你现在用的是隧道域名 + vars 变量方式，更直观。

#### 四、修改 edge/middleware.js 让 Worker 回源到隧道

你当前的 middleware.js 结尾是：

```js
// 4. 回源（你的 Node 服务器）
//    在 wrangler.toml 里配置 upstream = "http://1.2.3.4:8080"
return fetch(new Request(request, { headers: newHdr }));
```

它是直接请求原始 URL，没有用到回源地址。

改成使用 env.UPSTREAM（就是刚才 wrangler.toml 的变量）：

```js
// 运行在 Cloudflare Workers，语法与 Service Worker 一致
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. 边缘中间件逻辑示例：简单鉴权
    const cookie = request.headers.get("cookie") || "";
    const isLogin = cookie.includes("token=");

    // 2. 未登录且访问 /admin 则直接在边缘拦截
    if (url.pathname.startsWith("/admin") && !isLogin) {
      return new Response("Forbidden at Edge\n", { status: 403 });
    }

    // 3. 把「边缘计算结果」通过请求头带给源站
    const newHdr = new Headers(request.headers);
    newHdr.set("x-edge-authenticated", isLogin ? "1" : "0");

    // 4. 通过 Cloudflare Tunnel 回源到你本地 Node 服务
    //    env.UPSTREAM 形如 "https://xxx-yyy-zzz.trycloudflare.com"
    const upstreamBase = env.UPSTREAM;
    const upstreamUrl = new URL(url.pathname + url.search, upstreamBase);

    const newRequest = new Request(upstreamUrl.toString(), {
      method: request.method,
      headers: newHdr,
      body: request.body,
      redirect: "follow",
    });

    return fetch(newRequest);
  },
};
```

### 五、部署 / 调试 Worker

1. 本地调试（走真正 Cloudflare 边缘 + 你本地隧道）

确保这三个东西同时在运行： + 本地 Node：node src/index.js + cloudflared 隧道：cloudflared tunnel --url http://localhost:8080 + Worker 开发模式：npx wrangler dev

访问 http://localhost:8787/ 和 http://localhost:8787/admin：

- /：应该透传到你本地 Node，看到 Hello from Node! 边缘已鉴权：...
- /admin：
  - 无 token cookie → 403
  - 带 cookie → 通过，Node 返回 Admin 文本。

2. 发布到真正的 Cloudflare 边缘

运行`npx wrangler deploy`，成功后会给你 https://xxx.workers.dev 的 URL。访问这个 URL（同时保持 cloudflared 和本地 Node 在跑），就等于：
> 浏览器 → Cloudflare Worker → Cloudflare Tunnel → 你本地 Node


总结一下你需要做的最少步骤

- node src/index.js 本地起服务。
- cloudflared tunnel --url http://localhost:8080 拿到 https://xxx-yyy-zzz.trycloudflare.com。
- wrangler.toml 里加：
   + [vars]   UPSTREAM = "https://xxx-yyy-zzz.trycloudflare.com"
- 按上面的方式改 edge/middleware.js 用 env.UPSTREAM 回源。
- npx wrangler dev 本地调试，确认 OK 后 npx wrangler deploy 上线。