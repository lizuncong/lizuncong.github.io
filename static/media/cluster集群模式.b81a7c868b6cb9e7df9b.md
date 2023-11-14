## Node单进程模式
默认情况下，node以单进程运行，一个进程实例只有一个主线程(即事件循环线程)。对于多核CPU的计算机来说，这样做效率很低，因为只有一个核在运行，其他核都在闲置。

```js
const express = require('express')

const app = express();

app.get('/slow', (req, res) => {
    let startTime = Date.now();
    while(Date.now() - startTime < 10000){}
    res.send('slow request')
})

app.get('/fast', (req, res) => {
    res.send('fast request')
})

app.listen(3000)


```

当我们执行node index.js时，就启动了一个进程实例。这就是一个node服务。这里只有一个进程实例。同时也是我们的一个应用。这个进程实例包含一个`主线程(也称事件循环线程)`以及N个`线程池`中的线程。

只要有请求进入我们的服务器，就会在我们的事件循环线程中处理。一旦请求进入我们的服务器，事件循环线程对其进行处理，然后返回响应结果。

![image](../../../imgs/cluster_01.jpg)

如果某个请求处理比较耗时，很明显就会阻塞其他请求。以上面的服务为例，我们使用下面的代码依次请求`/slow`以及`/fast`接口：
```js
const startTime = Date.now();
fetch('http://localhost:3000/slow').then(res => {
   console.log('slow耗时：', Date.now() - startTime) 
})

fetch('http://localhost:3000/fast').then(res => {
   console.log('fast耗时：', Date.now() - startTime) 
})
```

结果如下，很明显，`/fast`请求被`/slow`请求阻塞了。这是因为主线程是单线程的，由于先请求的是slow，该请求阻塞了10秒，在这10秒内，主线程没法处理其他请求，导致fast请求被阻塞了。

![image](../../../imgs/cluster_02.jpg)

## Cluster集群模式
可以在应用中使用cluster模式开启多个进程实例，其中包括一个主进程和若干个worker进程。主进程负责监视worker进程实例的健康。主进程本身并不实际执行任何应用程序代码，不负责处理传入的请求或执行其他操作，比如从数据库中读取数据。相反，主进程负责监控每个worker进程实例的运行状况。主进程可以启动单个实例，也可以停止或者重启它们，还可以向它们发送数据。这些worker进程实例负责实际处理传入的请求，比如访问数据库，处理身份验证等。worker进程实例之间采用进程间通信交换消息，cluster模块内置一个负载均衡器，采用Round-robin算法协调各个worker进程之间的负载。比如下图所示都是我们的应用程序正在运行的实例。这是运行在一台计算机上的多个实例。


![image](../../../imgs/cluster_03.jpg)


下面是cluster 模式的简单demo，这里只有一个进程实例，意味着只有一个事件循环实例。

新建一个index.js文件，代码如下：
```js
const cluster = require('cluster')
const express = require('express')


// 这个文件是否是在master模式执行的
if(cluster.isMaster){
    // 主进程实例，会触发index.js以child模式重新执行一次
    cluster.fork();
} else {
    // worker进程实例
    const app = express();

    const doWork = (duration) => {
        const start = Date.now();
        while(Date.now() - start < duration){}
    }
    app.get('/', (req, res) => {
        doWork(5000)
        res.send('Hi there')
    })
    
    app.listen(3000)
}

```