const http = require('http');
const cpuOverload = new (require('./cpu'))(10, 80, 0.8);

/**
 * 定义两个服务路径
 * normal 是负责输出 hello world 的路径
 * bad 是负责复杂计算的路径
 */
const routerMapping = {
    '/v1/cpu': {
        'method': 'bad'
    },
    '/v1/normal': {
        'method': 'normal'
    }
};

/**
 * 创建 http 服务，简单返回
 */
const server = http.createServer(async (req, res) => {
    const pathname = req.url;
    // 过滤非拉取用户信息请求
    if (!routerMapping[pathname]) {
        res.write('path not found')
        res.end();
        return;
    }

    // 请求拦截，避免 cpu 过载
    if (!cpuOverload.isAvailable(pathname)) {
        res.write('server error')
        res.end();
        return
    }

    try {
        if (req.url === '/v1/cpu') {
            let sum = 0;
            for (let i = 0; i < 10000000000; i++) {
                sum = sum + i;
            }
            res.write(`sum：${sum}`)
            res.end();
            return;
        }
        if (req.url === '/v1/normal') {
            res.write(`hello world`)
            res.end();
            return;
        }
    } catch (error) {
        // 异常时，需要返回 500 错误码给前端
        console.log(error);
        res.write('server error')
        res.end();
        return
    }

})

// 启动服务
server.listen(4000, () => {
    console.log('server start at http://127.0.0.1:4000');
})

/**
 * 处理 cpu 信息采集
 */
cpuOverload.check().then().catch(err => {
    console.log(err)
});