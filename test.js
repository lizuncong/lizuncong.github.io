const fs = require('fs')

setTimeout(() => {
    // 新的事件循环的起点
    console.log('settimeout')
}, 0);

setImmediate(() => {
    console.log('setImmediate')
})

// 将会在新的事件循环中的pending callbacks阶段执行
fs.readFile('./README.md', { encoding: 'utf-8' }, (err, data) => {
    if (err) throw err;
    console.log('read file success')
})

// 该部分将会在首次事件循环中执行
Promise.resolve().then(() => {
    console.log('promise: poll callback')
})

// 首次事件循环执行
console.log('1')

