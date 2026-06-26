# easy-kube 代码编译与镜像构建流程

## 1. 文档目的

本文档用于说明 easy-kube 项目从源码到 Kubernetes 可运行容器的完整流程，重点解释两个阶段：

- 代码编译：把 Go 源码和运行资源整理成构建包。
- 构建镜像：把构建包制作成 Kubernetes 可以拉取和运行的 Docker 镜像。

理解这两个阶段后，就能更清楚地判断构建平台上的配置项应该怎么填写，以及构建失败时应该优先检查哪里。

## 2. 整体流程

easy-kube 的发布链路可以理解为：

```text
Git 代码仓库
  ↓
代码编译
  ↓
easy-kube.tar.gz 构建包
  ↓
构建镜像
  ↓
镜像仓库中的 Docker 镜像
  ↓
Kubernetes 拉取镜像
  ↓
Pod 启动 easy-kube 服务
```

其中：

- 代码编译解决“程序包怎么生成”的问题。
- 构建镜像解决“程序包怎么放进容器运行”的问题。

## 3. 代码编译是什么

代码编译阶段的核心目标是：把项目源码编译成 Linux 服务器可以运行的程序，并把运行时需要的外部文件一起打包。

对 easy-kube 来说，Go 代码主要包括：

```text
main.go
handlers/
services/
views/
```

这些 `.go` 文件会参与 `go build`，被编译进最终的可执行文件 `easy-kube`。

但是下面这些目录不会被 `go build` 自动编译进可执行文件：

```text
templates/
static/
config/
```

它们是运行时外部文件，需要额外放进压缩包。

## 4. 为什么 templates、static、config 要额外打包

Go 编译器默认只处理 Go 源码，也就是 `.go` 文件和通过 `import` 引入的 Go 包。

例如 Go 代码中的导入：

```go
import (
    "html/template"
    "net/http"
)
```

这类 `import` 会被编译器识别并参与构建。

但项目中的模板、静态资源、配置文件通常是通过文件路径在运行时读取的，例如：

```go
template.ParseFiles(
    "templates/layout.html",
    "templates/home.html",
)
```

这段代码的意思是：程序运行时，从当前工作目录里查找 `templates/layout.html` 和 `templates/home.html`。

再比如静态资源通常会通过类似方式暴露：

```go
http.FileServer(http.Dir("static"))
```

这表示浏览器访问页面上的 CSS、JS 时，Go 服务会去磁盘上的 `static` 目录查找文件。

配置文件也通常是通过路径读取：

```go
os.ReadFile("config/app.json")
```

所以这三个目录必须和可执行文件一起部署：

```text
easy-kube
templates/
static/
config/
```

否则服务可能出现以下问题：

- 页面模板找不到。
- CSS、JS 加载失败。
- 配置文件读取失败。
- 服务启动成功但页面显示异常。

## 5. 推荐的代码编译命令

构建平台的“代码编译”阶段建议填写：

```bash
go version
go mod download
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o easy-kube .
tar -zcvf easy-kube.tar.gz easy-kube templates static config
```

每一行的作用如下。

### 5.1 查看 Go 版本

```bash
go version
```

这行用于在构建日志中打印 Go 版本，方便确认构建机是否使用了正确版本。

easy-kube 当前依赖较新，构建环境需要使用较新的 Go 版本。如果 Go 版本太旧，可能会出现类似错误：

```text
cannot load cmp: malformed module path "cmp"
```

这通常说明构建机 Go 版本不支持新标准库，需要切换到更高版本的 Go 构建模板。

### 5.2 下载依赖

```bash
go mod download
```

这行会根据 `go.mod` 和 `go.sum` 下载项目依赖。

easy-kube 使用了 Kubernetes client-go、websocket、镜像相关 SDK 等依赖，这些都需要先下载好，后续才能编译。

### 5.3 编译 Linux 可执行文件

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o easy-kube .
```

这一行是编译核心。

参数说明：

- `CGO_ENABLED=0`：关闭 CGO，让编译出来的程序尽量少依赖系统 C 库，部署时更稳定。
- `GOOS=linux`：指定目标运行系统是 Linux。
- `GOARCH=amd64`：指定目标 CPU 架构是 amd64，也就是常见的 x86_64 服务器。
- `go build`：执行 Go 编译。
- `-o easy-kube`：把编译产物命名为 `easy-kube`。
- `.`：表示编译当前 Go module 下的主程序。

如果目标服务器是 ARM 架构，需要把 `GOARCH=amd64` 改成：

```bash
GOARCH=arm64
```

这里需要注意：Go 编译产物和目标运行环境是绑定的。

比如：

```bash
GOOS=linux GOARCH=amd64 go build -o easy-kube .
```

生成的是 Linux amd64 环境下运行的可执行文件。

如果编译成 Windows 程序：

```bash
GOOS=windows GOARCH=amd64 go build -o easy-kube.exe .
```

这个 `easy-kube.exe` 放进 Linux 容器里不能直接运行。

所以 easy-kube 要部署到 Kubernetes 的 Linux 容器里时，代码编译阶段就应该明确指定：

```bash
GOOS=linux
GOARCH=amd64
```

如果构建机本身就是 Linux，并且目标也是 Linux amd64，不写 `GOOS` 和 `GOARCH` 通常也能编译成功。但在 CI/CD 平台里建议显式写出来，这样构建环境变化时不容易出错。

### 5.4 打包运行文件

```bash
tar -zcvf easy-kube.tar.gz easy-kube templates static config
```

这一行会生成最终构建包 `easy-kube.tar.gz`。

这里打包成 `.tar.gz` 不是 Go 语言强制要求，而是构建平台和部署流程通常需要一个“完整构建产物”。

easy-kube 的完整运行产物不只是一个二进制文件，还包括运行时会读取的外部目录：

```text
easy-kube
templates/
static/
config/
```

如果不打包，后续“构建镜像”阶段就需要分别处理多个文件和目录，容易遗漏。打成 `easy-kube.tar.gz` 后，镜像构建阶段只需要拿到这一个压缩包，解压到镜像里的指定目录即可。

`.tar.gz` 的好处包括：

- 保留目录结构。
- 减少文件体积。
- 方便上传、下载和归档。
- 方便作为镜像构建阶段的输入。

打包内容包括：

```text
easy-kube      编译出来的 Go 可执行文件
templates/    页面模板
static/       前端 CSS、JS 等静态资源
config/       配置文件
```

`tar` 参数说明：

- `-z`：使用 gzip 压缩。
- `-c`：创建压缩包。
- `-v`：显示打包过程。
- `-f`：指定压缩包文件名。

构建平台里的“构建包名称”应填写：

```text
easy-kube.tar.gz
```

## 6. 构建镜像是什么

构建镜像阶段的核心目标是：把代码编译阶段产出的 `easy-kube.tar.gz` 放进 Docker 镜像，形成 Kubernetes 可以运行的标准容器。

很多人会把 Docker 的“跨环境部署”理解成“任何系统编译出来的程序都能放进去跑”，这是不准确的。

Docker 主要解决的是运行环境一致的问题。也就是说，只要目标机器能运行 Docker，并且系统和 CPU 架构匹配，就可以拉取同一个镜像运行。

但是容器不是完整虚拟机。Linux 容器通常共享宿主机的 Linux 内核，所以 Linux 镜像里面应该放 Linux 可执行文件，而不是 Windows 可执行文件。

因此：

```text
Docker 统一的是运行盒子。
GOOS/GOARCH 决定的是盒子里的程序能不能被执行。
```

如果镜像使用的是 Linux 基础镜像，那么放进去的 `easy-kube` 就应该是 Linux 版本：

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o easy-kube .
```

如果镜像和 Kubernetes 节点是 ARM 架构，就需要对应编译成：

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o easy-kube .
```

镜像里通常包含：

```text
Linux 基础环境
easy-kube 可执行文件
templates/
static/
config/
启动命令
服务端口
```

Kubernetes 不会直接运行 `easy-kube.tar.gz`，它运行的是镜像。

镜像构建完成后，一般会被推送到镜像仓库，例如：

```text
registry.example.com/easy-kube:版本号
```

发布时，Kubernetes 会根据镜像地址拉取镜像，然后启动 Pod。

## 7. 镜像构建排错知识点

本项目在镜像构建阶段遇到过几个典型问题，下面按“现象、原因、正确做法”整理。

### 7.1 RUN 脚本不要随意换行

最开始 RUN 脚本写成了两行：

```bash
tar -zxvf easy-kube.tar.gz
chmod +x easy-kube
```

平台生成 Dockerfile 后，可能只会给第一行自动加上 `RUN`：

```dockerfile
RUN tar -zxvf easy-kube.tar.gz
chmod +x easy-kube
```

Dockerfile 只认识 `RUN`、`CMD`、`COPY`、`ENV` 这类 Dockerfile 指令。第二行的 `chmod` 前面没有 `RUN`，Docker 会把 `chmod` 当成 Dockerfile 指令解析，最终报错：

```text
unknown instruction: chmod
```

正确做法是把多条命令写在同一行，用 `&&` 连接：

```bash
命令1 && 命令2 && 命令3
```

`&&` 的含义是：前一条命令执行成功后，才继续执行后一条命令。这样可以避免前面失败了，后面还继续执行。

### 7.2 构建包可能已经被平台自动解压

后面遇到过这个错误：

```text
easy-kube.tar.gz: Cannot open: No such file or directory
```

从平台生成的 Dockerfile 可以看到，它已经自动做了这些事情：

```dockerfile
wget -q -O easy-kube.tar.gz ...;
unzip -q easy-kube.tar.gz || tar -zxf easy-kube.tar.gz;
rm -rf easy-kube.tar.gz;
```

这表示平台已经：

```text
1. 下载 easy-kube.tar.gz 到镜像构建目录。
2. 解压 easy-kube.tar.gz。
3. 删除 easy-kube.tar.gz。
```

所以自定义 RUN 脚本里不能再写：

```bash
tar -zxvf easy-kube.tar.gz
```

因为执行到自定义 RUN 脚本时，压缩包已经被删除了。

知识点：

```text
构建包字段告诉平台使用哪个构建产物。
平台可能会自动下载、解压、清理构建包。
RUN 脚本应该操作解压后的文件，而不是再次操作 tar.gz。
```

### 7.3 要把解压后的文件放到服务启动目录

平台生成的启动逻辑里有：

```dockerfile
cd /data/app/easy-kube;
service ssh start && ./easy-kube
```

这说明容器启动时会先进入：

```text
/data/app/easy-kube
```

然后执行：

```bash
./easy-kube
```

因此镜像构建阶段需要保证 `/data/app/easy-kube` 目录下存在这些文件：

```text
easy-kube
templates/
static/
config/
```

否则可能出现两类问题：

- 当前目录下没有 `easy-kube`，启动命令执行失败。
- 当前目录下没有 `templates`、`static`、`config`，服务启动后找不到页面模板、静态资源或配置文件。

### 7.4 Shell 路径之间必须用空格分隔

有一次日志里出现了类似路径：

```text
/scripts/static/scripts/config
```

这说明原本想写两个路径：

```text
/scripts/static
/scripts/config
```

但中间没有正确分隔，Shell 把它们拼成了一个不存在的路径。

更稳的写法是先进入 `/scripts` 目录，再使用相对路径：

```bash
cd /scripts && cp -r easy-kube templates static config /data/app/easy-kube/
```

这样比写一长串绝对路径更不容易出错。

### 7.5 当前推荐的镜像 RUN 脚本

结合平台自动解压行为，easy-kube 当前推荐的 RUN 脚本是：

```bash
mkdir -p /data/app/easy-kube && cd /scripts && cp -r easy-kube templates static config /data/app/easy-kube/ && chmod +x /data/app/easy-kube/easy-kube
```

这条命令分成几步理解：

```text
1. mkdir -p /data/app/easy-kube
   创建服务运行目录。

2. cd /scripts
   进入平台解压构建包后的目录。

3. cp -r easy-kube templates static config /data/app/easy-kube/
   把可执行文件、页面模板、静态资源、配置文件复制到服务运行目录。

4. chmod +x /data/app/easy-kube/easy-kube
   给 Go 编译产物增加可执行权限。
```

启动命令保持：

```bash
./easy-kube
```

因为平台最终会进入 `/data/app/easy-kube`，所以这里用相对路径执行当前目录下的 `easy-kube`。

一句话总结：

```text
代码编译阶段生成 easy-kube.tar.gz。
镜像构建平台自动下载并解压 easy-kube.tar.gz 到 /scripts。
RUN 脚本负责把解压后的文件复制到 /data/app/easy-kube。
容器启动时进入 /data/app/easy-kube，然后执行 ./easy-kube。
```

## 8. 代码编译和构建镜像的区别

| 阶段 | 输入 | 输出 | 作用 |
| --- | --- | --- | --- |
| 代码编译 | Git 源码 | `easy-kube.tar.gz` | 生成程序运行包 |
| 构建镜像 | `easy-kube.tar.gz` | Docker 镜像 | 生成 K8s 可运行的容器 |

简单理解：

```text
代码编译：把代码做成程序包。
构建镜像：把程序包做成容器镜像。
```

只完成代码编译，说明已经有程序包，但 Kubernetes 还不能直接运行。

完成构建镜像后，Kubernetes 才能通过镜像地址启动服务。

## 9. 平台配置建议

在构建平台中，可以按下面方式填写。

代码编译阶段：

```text
仓库类型：git
代码路径：https://git.xxx.info/aigc-service/easy-kube
分支：master
构建模板：选择最高版本 Go 模板，至少需要 Go 1.21 以上
构建配置：参数
构建包名称：easy-kube.tar.gz
```

代码编译命令：

```bash
go version
go mod download
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o easy-kube .
tar -zcvf easy-kube.tar.gz easy-kube templates static config
```

如果平台支持用 `&&` 串联命令，也可以写成：

```bash
go version &&
go mod download &&
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o easy-kube . &&
tar -zcvf easy-kube.tar.gz easy-kube templates static config
```

这种写法的好处是：前一步失败时，后一步不会继续执行。

镜像构建阶段：

```text
基础镜像：library/go 或 library/golang，优先选择平台可用的新版本 Linux 镜像
构建包：easy-kube.tar.gz
RUN 脚本：mkdir -p /data/app/easy-kube && cd /scripts && cp -r easy-kube templates static config /data/app/easy-kube/ && chmod +x /data/app/easy-kube/easy-kube
启动命令：./easy-kube
```

## 10. 常见问题

### 10.1 为什么不能只打包 easy-kube 一个文件

因为 easy-kube 运行时还会读取外部文件：

```text
templates/
static/
config/
```

如果压缩包里只有 `easy-kube`，部署后可能出现模板、静态资源、配置文件找不到的问题。

### 10.2 为什么 Go 版本太旧会构建失败

项目依赖的新版本库可能使用了新版 Go 标准库。

例如 `cmp` 是新版本 Go 的标准库包，旧版本 Go 不认识它，就会误以为它是第三方模块，最终报错：

```text
cannot load cmp: malformed module path "cmp"
```

遇到这种问题时，应优先检查构建日志中的：

```bash
go version
```

然后切换到更高版本的 Go 构建模板。

### 10.3 外部文件能不能编译进二进制

可以，但需要使用 Go 的 `embed` 功能，例如：

```go
//go:embed templates/*.html
var templatesFS embed.FS
```

这样可以把外部文件嵌入到 Go 可执行文件中。

不过 easy-kube 当前更适合先使用外部文件打包方式，因为它更直观，也更方便修改配置和排查部署问题。

## 11. 总结

easy-kube 的构建重点是：

```text
go build 只会生成 Go 可执行文件。
templates、static、config 是运行时外部文件，需要额外打包。
代码编译产出 easy-kube.tar.gz。
构建镜像把 easy-kube.tar.gz 做成 Kubernetes 可运行镜像。
镜像构建平台可能会自动解压构建包，RUN 脚本要操作解压后的文件。
容器启动目录要和 easy-kube、templates、static、config 所在目录一致。
```

推荐最终代码编译命令：

```bash
go version
go mod download
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o easy-kube .
tar -zcvf easy-kube.tar.gz easy-kube templates static config
```

推荐最终镜像 RUN 脚本：

```bash
mkdir -p /data/app/easy-kube && cd /scripts && cp -r easy-kube templates static config /data/app/easy-kube/ && chmod +x /data/app/easy-kube/easy-kube
```

推荐启动命令：

```bash
./easy-kube
```
