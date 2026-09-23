# 腾讯云COS + 火山CDN回源 304 响应头覆盖的问题

## 问题

用户访问我们的资源出现以下错误，错误的直接原因是cdn返回的content type是xml,但实际上这是一个html文件。浏览器用xml标准解析返回的Html内容时，发现不符合xml协议，直接报错

<img  height="530" alt="image" src="https://github.com/user-attachments/assets/284eb400-c6e3-4050-ace3-760bd012b5c5" />
