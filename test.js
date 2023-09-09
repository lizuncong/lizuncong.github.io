const http = require('http');
const rp = require('request-promise');

const port = 5000;
const server = http.createServer(async (req, res) => {
    let sum = 0;
    if (req.url === '/bad') {
        const result = await rp.get(`http://127.0.0.1:4000`)
        const sumData = JSON.parse(result);
        if (sumData && sumData.data) {
            sum = sumData.data.sum
        }
    }
    res.write(`${sum}`);
    res.end();
})

server.listen(port, () => {
    console.log(`server start http://127.0.0.1:${port}`)
})
