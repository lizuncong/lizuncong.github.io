# 腾讯云COS + 火山CDN回源 304 响应头覆盖的问题

## 一、问题

用户访问我们的资源出现以下错误，错误的直接原因是cdn返回的content type是xml,但实际上这是一个html文件。浏览器用xml标准解析返回的Html内容时，发现不符合xml协议，直接报错。下图是CDN返回给浏览器的各个响应头，注意看里面etag、x-cos-hash等字段的值，下面会讲到。

<img  height="530" alt="image" src="https://github.com/user-attachments/assets/284eb400-c6e3-4050-ace3-760bd012b5c5" />

## 二、排查

### 2.1 首先排查源站(COS)的html文件
首先排查源站(COS)的html文件的元数据是否正确。经查，如下图所示，COS上对应的html文件的etag、x-cos-hash、x-cos-version-id等字段的值完全和CDN节点返回给浏览器的响应头里面的值一样，唯一不同的是COS上对应的html文件的content-type为text/html。

<img width="666" height="560" alt="image" src="https://github.com/user-attachments/assets/8dd27084-d5c6-4f5e-bfb1-355558b4e9b7" />

至此，我们已经得到以下结论：

- 1.COS上最新的html文件的响应头是正确的
- 2.根据x cos version id、etag、x cos hash等字段的值完全一样，可以充分认为CDN返回给浏览器的html文件和COS上的文件是一致的


那问题最有可能出现的地方在于：

- 1. COS上的html文件响应头 content type 一开始是xml，CDN拉取到的这个文件的响应头就是错的，还缓存了下来。然后有人改了cos上html文件的这个响应头的元数据，但修改这些也会导致x cos version id改变，所以可能性不大
- 2. CDN的节点缓存有问题，CDN改了节点的响应头？又或者回源的时候，设置错了响应头？
 
### 2.2 检查源站文件的修改历史
如果COS开了版本控制，每次修改文件，都会有历史记录。如下图，但看了下，这些历史记录的content type 都是对的

<img width="1198" height="284" alt="企业微信截图_978d2fb1-8e05-4588-a8e7-df626afa60f3" src="https://github.com/user-attachments/assets/1a87ec7c-1000-401c-bdd0-9cec78d19079" />

### 2.3 检查CDN回源拉文件有无问题

直接请求源站(COS)服务器。

下图是用HEAD请求从COS源站拉取的文件，返回304，content type是xml

<img width="1106" height="777" alt="image" src="https://github.com/user-attachments/assets/84d0c948-5004-44c2-ad3c-c44bc4ad7a66" />

<img width="1165" height="791" alt="image" src="https://github.com/user-attachments/assets/ccb601e2-8450-49e0-bdfc-1440dc500be9" />

