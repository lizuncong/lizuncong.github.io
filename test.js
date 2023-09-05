const http = require('http')

const server = http.createServer((req, res) => {
    res.write(`${startCount() + nextCount()}`)
    res.end();
})

server.listen(4000, () => {
    console.log('server start http://127.0.0.1:4000')
})

function startCount(){
    let sum = 0;
    for(let i = 0; i < 500000000;i++){
        sum = sum + i
    }
    return sum
}

function nextCount(){
    let sum = 0;
    for(let i = 500000000; i < 1000000000;i++){
        sum = sum + i
    }
    return sum
}