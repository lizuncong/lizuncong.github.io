const http = require('http');

const port = 4000;

const server = http.createServer((req, res) => {
    let sum = 0;
    for (let i = 0; i < 10000000000; i++) {
        sum = sum + i
    }
    res.write(`${sum}`);
    res.end();
})

server.listen(port, () => {
    console.log(`server start http://127.0.0.1:${port}`)
})
