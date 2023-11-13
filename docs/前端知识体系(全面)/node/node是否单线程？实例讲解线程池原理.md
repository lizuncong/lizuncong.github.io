## 大纲
- Node基本架构
- 进程、线程的基础知识
- CPU线程调度
- Node是否单线程？
- libuv线程池。线程是不是越多越好？

## Node基本架构

![image](../../../imgs/node_01.jpg)


- 最上层是我们自己编写的javascript代码
- 中间的NodeJS是Node提供给我们的标准库，比如fs，path。同时也是我们和C++连接的桥梁。
- V8：开源的js引擎。能够在浏览器之外执行javascript代码。因此这里是真正执行我们自己写的javascript代码的地方
- libuv库。C++开源项目，允许node.js访问操作系统、底层文件系统。允许访问网络，还可以处理并发操作。


![image](../../../imgs/node_03.jpg)


>援引nodejs官网：[libuv](https://libuv.org/) (the C library that implements the Node.js event loop and all of the asynchronous behaviors of the platform)

### [Node源码](https://github.com/nodejs/node/tree/main)
- lib目录存放的是Node.js内置模块的源码，比如fs、path等模块的源码。这些都是js实现的
- src目录是lib中所有函数的C++实现。


在v8和libuv内部几乎很少包含js代码，基本都是C++代码。

![image](../../../imgs/node_02.jpg)

process.binding就是nodejs将js和c++联系起来的地方，是js和c++的桥梁。


![image](../../../../imgs/node_07.jpg)


## 进程、线程的基础知识

关于进程和线程的基础知识，网上有很多，这里就不赘述了。
- 进程。一个进程中会有多个线程。是操作系统进行资源分配（包括cpu、内存、磁盘IO等）的最小单位
- 线程。cpu调度和分配的基本单位
- 串行: 多个任务，执行完一个再执行另一个。
- 并发: 多个线程在单个CPU内核运行，同一时间一个线程运行，系统不停切换线程，看起来像同时运行，实际上是线程不停切换。
- 并行: 每个线程分配给独立的CPU内核，线程同时运行。

这里我们以Node为例，新建一个index.js，内容如下：
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
当我们执行node index.js时，就启动了一个进程实例。这就是一个node服务。注意，这里只有一个进程实例。同时也是我们的一个应用。这个进程实例包含一个 **主线程(也称事件循环线程)** 以及N个 **线程池** 中的线程。

>实际上，我们自己编写的nodejs代码几乎都是在主线程当中运行的，除了我们手动创建的worker thread外。这就意味着我们自己编写的代码有可能会阻塞Node的主线程。Node提供的标准函数中，有些是直接调用操作系统底层操作，比如http模块。有些是在线程池中由线程池调度执行，比如crypto模块的pbkdf2函数，fs模块等，在线程池中的操作以及调用操作系统底层的操作不会阻塞主线程。

## CPU线程调度
假设计算机只有一个CPU，则在任意时刻只能执行一条机器指令，每个线程只有获得CPU的使用权才能执行指令。线程调度是指按照特定机制为多个线程分配CPU的使用权。

有两种调度模型：分时调度模型和抢占式调度模型
- 分时调度模型是指让所有的线程轮流获得CPU的使用权，并且平均分配每个线程占用的CPU的时间片
- 抢占式调度模型，是指让优先级高的线程优先占用CPU执行。

关于两种调度模型，自行了解即可。这里需要注意我们常说的多线程并发执行，指的是从宏观上看，各个线程轮流获得CPU的使用权，分别执行各自的任务。

假设有8个线程处于就绪状态等待执行，同时假设每个线程需要耗时500毫秒执行任务，我们的CPU只有4个内核。那么CPU在调度这8个线程时，理论上来说，是由4个内核轮流调度执行这8个线程，每个线程执行一个时间片后，就继续执行另一个线程。平均每个内核需要执行2个线程。因此，这8个线程几乎是同时完成的，耗时1000毫秒。当然这只是理论值，真实情况远比这个时间要大，毕竟CPU切换线程也是有开销的，同时一台计算机的线程也不仅仅只有8个。



## Node是否单线程？
Node事件循环线程是单线程，也就是执行我们自己写的代码的线程是单线程。这意味着我们的程序只能在一个CPU内核上运行。如果我们计算机的CPU有多个核，那么node就不会充分利用到这些优势。换句话说，我们的程序就没法快速的运行，因为它是单线程。

但是Node标准库中提供的一些函数实际上并不是单线程。Node内部提供的一些函数运行在我们的事件循环线程之外，也就是其他线程中。

因此，简单的说node是单线程并不完全正确。

### 如何证明事件循环线程是单线程？
以下面的代码为例：
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
通过node index.js启动这个服务后，先访问`http://localhost:3000/slow`然后立即访问`http://localhost:3000/fast`。可以猜测一下执行结果。

很明显，`/slow`这个请求肯定耗时在10s。`/fast`请求耗时多少秒？会不会被阻塞？

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9d4f2fe612f44edb8d8efc3b0a9970e9~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2608&h=1080&s=218678&e=png&b=ffffff)

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/99b32447744a4ae6889332856d10366a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2640&h=1144&s=258189&e=png&b=ffffff)

从执行结果来看，`/fast`请求被前面的`/slow`请求阻塞的。如果手速不够快，也可以通过代码发起请求：


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0256fedda88d4f68b6600a645878635d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=810&h=390&s=67351&e=png&b=ffffff)

可以看到10秒后先输出 slow 耗时，然后紧接着输出fast 耗时

所以，事件循环线程是单线程，且很容易被我们所写的耗时长的任务阻塞的。假设我们有1000个请求同时发起，依次到达服务器，每个请求耗时5ms，理论上第1000个请求响应要5000ms。

### 如何证明Node不是单线程
前面我们说过，Node提供的内置模块中，有些是在线程池中调度执行的。比如crypto模块。先来看下面的代码：
```js
const crypto = require('crypto')

const startTime = Date.now();

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('1 请求耗时：', Date.now() - startTime)
})

console.log('end')

```
执行多几次查看结果：

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/46b867f554184ac2989a4d51b84219d8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1262&h=1400&s=156795&e=png&b=1d1d1d)
可以看出，一个pbkdf2函数需要耗时在520毫秒左右。如果nodejs是单线程的，那么执行两次pbkdf2函数应该总共耗时在1000毫秒左右才对，比如下面的代码：
```js
const crypto = require('crypto')

const startTime = Date.now();

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('1 请求耗时：', Date.now() - startTime)
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('2 请求耗时：', Date.now() - startTime)
})

console.log('end')

```
这里需要注意startTime是个常量，一开始就已经初始化了。如果nodejs是单线程，这里的执行结果应该是首先执行完第一个pbkdf2，耗时520毫秒左右。然后执行第二个pbkdf2函数，耗时1000毫秒左右。
现在我们多次执行，查看结果：

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/529da102d6f9417cb450db350cec6518~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1172&h=1372&s=221776&e=png&b=1c1c1c)

上面的结果有两点需要注意：
- 打印顺序是随机的，并不是先打印第一个再打印第二个。
- 两个函数的执行耗时都在530毫秒左右。

从上面的结果可以看出，pbkdf2的执行是多线程的，谁先执行完就先执行谁的回调。

因此，准确的说，node并不是单线程的。但node的主线程(事件循环线程)是单线程的，也就是执行我们自己写的代码的线程是单线程的。而node标准库中的一些函数是多线程执行的。

>crypto.pbkdf2函数自身是在线程池中执行的，而他的回调是在事件循环线程(主线程)执行的

## libuv线程池
前面简单介绍了crypto.pbkdf2函数的执行并不是单线程的，这节我们将简单看下基本原理。

下面图示是crypto.pbkdf2函数的实际运行情况

![未命名文件 (1).jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ddf49425cffc4105a7f19bd967e60224~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=692&h=976&s=44036&e=jpg&b=fefcfc)

libuv会将一些昂贵的计算操作放在事件循环线程之外，也就是线程池中执行。默认情况下，libuv会在线程池中创建4个线程，可用于计算密集型任务。因此这意味着除了事件循环线程之外，还有其他四个线程可用于在我们的应用程序内执行昂贵的操作。Node标准库的大部分函数都会充分利用这个线程池，比如crypto.pbkdf2函数，fs模块等。


很明显，node不是真正的单线程，因为node还使用其他线程来执行一些计算密集型的任务。

libuv线程池中有4个线程，意味着，最多能同时处理4个任务。比如下图所示，如果我们调用了6次crypto.pbkdf2函数，意味着我们有6个任务需要线程池调度处理。但线程池只有4个线程，最多只能同时处理4个任务，剩下的2个任务需要排队。比如如果`PBKDF2#3`先处理完成，则`PBKDF2#5`递补进入线程池调度处理。


![未命名文件 (3).jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/56d7a43733134600b6af19fef16a8246~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1201&h=866&s=66913&e=jpg&b=fefcfc)

### 实例剖析
注意，我使用的这台计算机CPU有4个内核。下面所有demo及其结果都是在这台计算机上跑的。

#### 4个线程，4个任务
```js
const crypto = require('crypto')

const start = Date.now();

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 1: ', Date.now() - start);
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 2: ', Date.now() - start);
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 3: ', Date.now() - start);
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 4: ', Date.now() - start);
})
console.log('end')
```
多执行几次，查看结果：


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/268cc76a77c5493e80542a629e40a0fb~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1136&h=1480&s=265091&e=png&b=1b1b1b)

可以得出以下几点结论：
- 回调函数的执行顺序是不确定的
- 四个函数的执行耗时大概在550毫秒左右

执行过程如下图所示

![未命名文件.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ac1d1795986044279f70a4f5ea1edce0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=801&h=866&s=59291&e=jpg&b=fefcfb)

这里我们调用了四次`crypto.pbkdf2`函数，也就是有4个任务需要执行。这4个任务进入线程池任务队列处理。由于线程池有4个线程，因此每个任务刚好可以分配给一个线程同时执行。我这台计算机CPU有4个内核，这4个内核轮流执行4个线程，平均每个内核执行1个线程，平均耗时550毫秒左右。因此可以看到4个回调函数几乎同时执行完成，耗时差不多。

#### 4个线程，6个任务
思考下面代码的执行结果：
```js
const crypto = require('crypto')

const start = Date.now();

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 1: ', Date.now() - start);
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 2: ', Date.now() - start);
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 3: ', Date.now() - start);
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 4: ', Date.now() - start);
})
crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 5: ', Date.now() - start);
})
crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 6: ', Date.now() - start);
})
console.log('end')
```

控制台多次执行，可以得到下面的结果：
- 过了大约550毫秒，几乎同时打印前面4个crypto.pbkdf2函数的回调。而且4个任务的打印顺序是随机的。
- 过了大约1080毫秒，几乎同时打印最后2个crypto.pbkdf2的回调。而且这2个任务的打印顺序也是随机的。


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7967de02e0a94f28b2856f9b656c1763~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1270&h=1580&s=283585&e=png&b=1b1b1b)

执行过程如下图所示：

![未命名文件 (1).jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d3617588340d4a6a9e0bcd8257863c8b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1187&h=866&s=66782&e=jpg&b=fffefe)

这里我们调用了6次`crypto.pbkdf2`，这6个任务加入线程池任务队列等待处理。由于线程池只有4个线程，每个线程只能执行一个任务。因此前面4个任务优先执行，后面两个排队等待执行。只有线程池中的线程空闲了，才能执行后面两个任务。这就是为啥我们会看到前面4个几乎同时完成，然后才输出最后2个。

#### 5个线程，6个任务。线程池中的线程越多越好吗？
我们可以通过`process.env.UV_THREADPOOL_SIZE`修改线程池中的线程数量。比如下面的代码将线程池里面的数量调整为5。
```js
process.env.UV_THREADPOOL_SIZE = 5;
```
我们还是以上面的代码为例，在执行下面的代码前，可以思考下执行结果会是怎样？
```js
process.env.UV_THREADPOOL_SIZE = 5;

const crypto = require('crypto')

const start = Date.now();

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 1: ', Date.now() - start);
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 2: ', Date.now() - start);
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 3: ', Date.now() - start);
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 4: ', Date.now() - start);
})
crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 5: ', Date.now() - start);
})
crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 6: ', Date.now() - start);
})
console.log('end')
```

在执行前，可以思考一下执行结果是怎样的。
- 大约687毫秒后，几乎同时打印前面5个任务。打印顺序随机
- 大约1200毫秒后，才输出第6个任务。

这个结果需要注意的是，前面5个任务，每个任务的执行时间大约在687毫秒，明显比之前的任务(550毫秒)多了一些。另外，这次是5个任务几乎同时完成。


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bfb05c5d57b24293a8372ad6d5a0db36~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1206&h=1504&s=240535&e=png&b=1a1a1a)

执行过程如下图所示：

![未命名文件.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/20e0e5b00f4b4e56b9032c1c038c87ea~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1209&h=866&s=69186&e=jpg&b=fefcfc)

这次，我们的线程池中有5个线程，能同时处理5个任务。这里我们调用了6次`crypto.pbkdf2`，有6个任务需要线程池处理。但线程池只有5个线程，意味着一次最多只能同时处理5个任务。因此前面5个任务分配给了线程池中的每个线程。但由于我的CPU只有4个内核，却需要同时处理5个线程，CPU是轮流调度执行每个线程的，每个线程在执行完一个时间片后，就切换到另一个线程，平均每个内核需要处理1.25个线程。理论情况下，一个线程执行一个`crypto.pbkdf2`耗时550毫秒，1.25个线程大概是687毫秒。这就解释了前面5个线程几乎同时完成，且平均耗时687毫秒。最后一个线程需要的时间为687毫秒+自身执行的550毫秒，大概就是1237毫秒左右。

>从上面可以看出，由于CPU资源内核有限，同时CPU是轮流执行每个线程，因此，线程池中的线程并不是越多越好。

了解了这些后，我们可以修改线程池大小为6，然后执行12个任务，比如下面的代码，思考一下执行结果如何？
```js
process.env.UV_THREADPOOL_SIZE = 6;

const crypto = require('crypto')

const start = Date.now();

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 1: ', Date.now() - start);
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 2: ', Date.now() - start);
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 3: ', Date.now() - start);
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 4: ', Date.now() - start);
})
crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 5: ', Date.now() - start);
})
crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 6: ', Date.now() - start);
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 7: ', Date.now() - start);
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 8: ', Date.now() - start);
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 9: ', Date.now() - start);
})

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 10: ', Date.now() - start);
})
crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 11: ', Date.now() - start);
})
crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log('crypto 12: ', Date.now() - start);
})

console.log('end')
```

## 那些直接调用操作系统底层的模块
前面我们知道nodejs提供的crypto.pbkdf2函数是在线程池中执行的。当然，nodejs提供的其他内置模块并不都是在线程池中执行的。

本节就来探讨nodejs内部如何处理网络请求。通过代码验证nodejs中网络请求并不是在线程池中处理的。首先我们先通过一个简单的demo测试一下请求`www.baidu.com`这个网址耗时多长时间

```js
const https = require('https')

const startTime = Date.now();

const doRequest = (num) => {
    https.request('https://www.baidu.com/', res => {
        res.on('data', (data) => {
        })
        res.on('end', () => {
            console.log(`${num}：`, Date.now() - startTime)
        })
    }).end();
}

doRequest(1);
```
控制台多次执行，可以看到耗时在300毫秒左右。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a254db257fe141d2bbacc777279b8c33~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1380&h=1474&s=202969&e=png&b=1d1d1d)

如果我们多次调用`doRequest`，如下图所示：

```js
const https = require('https')

const startTime = Date.now();

const doRequest = (num) => {
    https.request('https://www.baidu.com/', res => {
        res.on('data', (data) => {
        })
        res.on('end', () => {
            console.log(`${num}：`, Date.now() - startTime)
        })
    }).end();
}

doRequest(1);
doRequest(2);
doRequest(3);
doRequest(4);
doRequest(5);
doRequest(6);
doRequest(7);
doRequest(8);
doRequest(9);
doRequest(10);
doRequest(11);
doRequest(12);
doRequest(13);
```

控制台多次执行，可以看到结果如下：
- 这里调用了13次，几乎每个日志都是同时输出的
- 和多次执行`crpto.pbkdf2`函数的结果不同，每个doRequest的耗时几乎都一样，在280毫秒左右。这个和我们之前在线程池中看到的行为是完全不一样的，并不像`crypto.pbkdf2`一样需要排队等待线程池处理。


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a9831e62c3ef47b3a675d0d1fd3afa00~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1134&h=1522&s=190122&e=png&b=1b1b1b)



因此，node提供的内置标准库中，一些函数利用了libuv的线程池。同样，也存在一些函数是直接调用libuv中内置的一些操作系统代码。在本例中，我们调用https.request发起一个请求，libuv发现我们是在发起HTTP请求，libuv没法直接处理涉及网络请求的操作。因此，libuv将请求委托给操作系统执行。所以实际上是我们的操作系统执行真正的http请求，libuv只是被用来发出请求，然后等待操作系统返回请求的结果。


由于libuv将工作委托给操作系统，所以操作系统自己决定是否需要创建新的线程。同时，因为是操作系统发出请求，所以内部不会阻塞我们事件循环中的javascript代码。

## 有趣的事件循环
先来看下fs模块读取文件的耗时：
```js
const fs = require('fs')

const startTime = Date.now();


fs.readFile('test.js', 'utf8', () => {
    console.log('FS耗时：', Date.now() - startTime)
})
```

实际上，fs模块读取文件还是非常快速的，耗时1毫秒

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a7bd607767374b9bad82efe36f78a6b2~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1088&h=1146&s=121587&e=png&b=1d1d1d)

然后再来看下面的代码：
```js
const https = require('https')
const crypto = require('crypto')
const fs = require('fs')

const startTime = Date.now();

const doRequest = (num) => {
    https.request('https://www.baidu.com/', res => {
        res.on('data', (data) => {
        })
        res.on('end', () => {
            console.log(`doRequest ${num} 耗时：`, Date.now() - startTime)
        })
    }).end();
}

const doHash = (num) => {
    crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
        console.log(`Hash ${num} 耗时: `, Date.now() - startTime);
    })
}


doRequest(1)

fs.readFile('test.js', 'utf8', () => {
    console.log('FS 耗时：', Date.now() - startTime)
})

doHash(1)
doHash(2)
doHash(3)
doHash(4)

```
控制台执行多次查看结果：
- 每次都是doRequest的回调函数先执行
- 每次FS打印前，前面都有一个Hash先打印
- FS耗时平均在560毫秒左右，而不是上面的1毫秒。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0dbf6a0cddcf41ebbbcd4ed92c9901d5~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1300&h=1584&s=247923&e=png&b=1c1c1c)

为什么会出现这种情况？前面我们说过fs module和crypto.pbkdf2都使用了线程池执行操作。HTTP模块直接使用底层操作系统执行操作。在解释这个执行结果前，我们先来了解下fs.readFile的内部执行流程。

当我们调用fs.readFile时，node会读取两次磁盘。第一次从磁盘中获取文件信息，比如文件大小，才能知道应该申请多大的内存读取文件内容。当获取到文件信息后，node会继续读取磁盘，这次真正的获取文件内容。我们都知道I/O操作是比较耗时的，node 线程不可能会一直等待I/O操作完成，中间没事可做，造成资源浪费。因此在读取磁盘等待读取结果时，node会将操作挂起，让线程继续处理其他任务。等到结果回来时，再让线程继续处理读取结果。

结合上述知识，上面代码执行流程如下：

![未命名文件 (1).jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0343b897c7f64e74be374d9a30b4ae63~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1120&h=866&s=64318&e=jpg&b=fefcfc)

首先要认识到http模块调用根本不涉及线程池，它直接调用底层操作系统。它发出请求，一旦我们得到响应，就会将结果返回到我们的事件循环线程中。

然后我们调用fs模块读取文件，同时调用了4个doHash。相当于有5个任务需要线程池处理，而线程池只有4个线程，一次最多只能处理4个任务。因此首先被处理的是fs以及前面三个pbkdf2函数。假设fs分配给了`thread#1`，`thread#1`第一次读取磁盘，等待磁盘返回结果，由于I/O比较耗时，`thread#1`将fs任务挂起，转而继续处理其他任务，也就是`pbkdf2#4`这个任务。过了一会，磁盘读取完成，将结果返回给线程池中处理，由于此时线程池中有4个任务在处理，fs的读取结果只能排队等待处理

此时，线程池状态如下：

![未命名文件 (2).jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/70b50a19521c4d2aa25686091074a1cc~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1104&h=866&s=64312&e=jpg&b=fefcfc)

过了270毫秒，http请求完成，结果返回给事件循环线程处理。此时打印doRequest

过了大概560毫秒，有个pbkdf2任务处理完成，结果返回给事件循环线程处理，此时打印一个doHash。

有一个线程空闲了，可以继续处理fs的读取结果，由于文件操作只需要1毫秒，因此打印fs。

最后输出后面三个doHash。

现在，让我们将线程池大小改成5
```js
process.env.UV_THREADPOOL_SIZE = 5;

const https = require('https')
const crypto = require('crypto')
const fs = require('fs')

const startTime = Date.now();

const doRequest = (num) => {
    https.request('https://www.baidu.com/', res => {
        res.on('data', (data) => {
        })
        res.on('end', () => {
            console.log(`doRequest ${num} 耗时：`, Date.now() - startTime)
        })
    }).end();
}

const doHash = (num) => {
    crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
        console.log(`Hash ${num} 耗时: `, Date.now() - startTime);
    })
}


doRequest(1)

fs.readFile('test.js', 'utf8', () => {
    console.log('FS 耗时：', Date.now() - startTime)
})

doHash(1)
doHash(2)
doHash(3)
doHash(4)

```

执行结果如下：
- 每次都是fs先打印
- 然后是doRequest
- 最后是4个doHash


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e172b34be934412cb0028b0aff384cc8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1102&h=1482&s=268446&e=png&b=1b1b1b)

执行过程如下，由于这次我们线程池中有5个线程，一次最多能同时处理5个任务。刚好我们有5个任务，每个任务都能分配给一个线程，因此有一个线程可以专门负责处理文件读取。

![未命名文件 (3).jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9143e977610b4ce08c40bf3281574916~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1047&h=866&s=66589&e=jpg&b=fefcfc)

如果将线程池大小改成1
```js
process.env.UV_THREADPOOL_SIZE = 1;

const https = require('https')
const crypto = require('crypto')
const fs = require('fs')

const startTime = Date.now();

const doRequest = (num) => {
    https.request('https://www.baidu.com/', res => {
        res.on('data', (data) => {
        })
        res.on('end', () => {
            console.log(`doRequest ${num} 耗时：`, Date.now() - startTime)
        })
    }).end();
}

const doHash = (num) => {
    crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
        console.log(`Hash ${num} 耗时: `, Date.now() - startTime);
    })
}


doRequest(1)

fs.readFile('test.js', 'utf8', () => {
    console.log('FS 耗时：', Date.now() - startTime)
})

doHash(1)
doHash(2)
doHash(3)
doHash(4)


```

执行结果如下：
- 每次都是doRequest先输出
- 其次是4个dohash
- FS每次都是最后输出

为什么会出现这种结果？可以想一想

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2e1b9b65c5fb43ca941b7380be68815b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1036&h=1350&s=248407&e=png&b=1b1b1b)

## 总结
通过本篇文章，我们学习了下面这些东西：
- 进程线程的知识
- 了解了cpu如何调度线程执行
- 通过实例讲解了Node并不是单线程，事件循环线程(主线程)才是单线程。
- 通过实例剖析Node线程池的基本原理，并能够通过理论计算每个任务的执行耗时
- 同时我们学到了Node提供的标准库中有些函数是在事件循环线程中执行的，有些是在线程池中执行的，有些是委托给操作系统底层执行的。