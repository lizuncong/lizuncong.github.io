## 背景
AI TDK加载测试环境https://binkbinkai.test.huya.info/的图片，显示裂图

<img width="1472" height="783" alt="image" src="https://github.com/user-attachments/assets/02212e66-0653-42ed-bc54-0e0b54388886" />

控制台NetWork请求报错：

<img width="1790" height="836" alt="image" src="https://github.com/user-attachments/assets/b7a5c463-d599-4ec1-b3ba-ab1b0f5d6d97" />

鼠标悬浮在Network面板，Status那一列，可以看到有具体的报错信息：Cross-Origin Resource Sharing Error: LocalNetWorkAccesssPermissionDenied

但是AI TDK加载测试环境https://tradekitsune.test.huya.info/的图片，显示是正常的

<img width="1501" height="854" alt="image" src="https://github.com/user-attachments/assets/172bef61-a2aa-43d1-a41f-cf456f86f603" />

`https://binkbinkai.test.huya.info/` 和 `https://tradekitsune.test.huya.info/` 都是外网不可以访问的，都需要连公司内网

## 结论

`binkbinkai.test.huya.info` 解析到了内网 IP：

```text
binkbinkai.test.huya.info -> 10.132.232.58
```

`tradekitsune.test.huya.info` 解析到了非私有地址段 IP：

```text
tradekitsune.test.huya.info -> 101.47.11.86
```

注意：这里的“非私有地址段”只表示 IP 地址空间分类，不表示该服务一定能从互联网任意位置访问。`tradekitsune.test.huya.info` 仍然可能需要连接公司内网/VPN 才能访问。

AITDK 面板运行在：

```text
https://extension.aitdk.com/
```

当 public address space 的 HTTPS origin 去加载解析到内网 IP 的资源时，Chrome 会触发 Private Network Access / Local Network Access 限制。失败信息表现为：

```text
Cross-Origin Resource Sharing Error: LocalNetworkAccessPermissionDenied
```

所以 binkbink 裂图的核心原因是：

```text
扩展面板 origin 属于 public address space，但目标图片域名解析到内网 IP，被 Chrome 的 Local Network Access 策略拦截。
```

详见：https://developer.chrome.com/blog/private-network-access-preflight?hl=zh-cn

