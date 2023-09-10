const platform = process.platform;
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const os = require('os');

// info会调用_flush判断当前缓存是否已满，或是否开启了缓存。如没有开启或缓存已满，则直接调用
//_addLog写入日志。其他情况都写入缓存中。

// start会定时从临时缓存中获取待写入日志内容，如有则调用_addLog写入日志。写入完后
// 会调用_clean清理已写入内容，其次会清理未使用的空文件流句柄，避免空文件夹、句柄流
// 占用缓存

// _addLog根据类型获取需要写入的文件路径，并调用_getFileStream来获取文件流句柄
// 这里就会用到文件流缓存，当缓存有则返回，没有则创建一个文件流句柄
class Logger {

    /**
     * 
     * @param {boolean} cacheEnable 是否打开日志缓存模式，默认打开 
     * @param {int} cacheTime 缓存处理时间，默认2秒，会定时写入文件 
     * @param {int} maxLen 单个日志文件最大缓存长度，默认100000 
     * @param {int} maxFileStream 最大缓存文件句柄数，默认是1000
     */
    constructor(cacheEnable = true, cacheTime = 2000, maxLen = 100000, maxFileStream = 1000) {
        this.cacheEnable = cacheEnable;
        this.cacheTime = cacheTime;
        this.maxLen = maxLen;
        this.maxFileStream = maxFileStream;
        this.currentFileStreamNum = 0;
    }
    _flush(fileType, logInfo) {
        if (!fileType) {
            return
        }
        let logStr = logInfo;
        if (typeof logInfo === 'object') {
            logStr = JSON.stringify(logInfo)
        }
        if (logStr === '' || !logStr) {
            return;
        }
        if (!this.cacheEnable) {
            // 缓存关闭，直接写日志
            return this._addLog(fileType, cacheLogStr[fileType])
        }
        if (!cacheLogStr[fileType]) {
            // 判断是否已经有缓存
            return cacheLogStr[fileType] = `${logStr}`
        }
        if (cacheLogStr[fileType].length < this.maxLen) {
            // 判断是否已经超出缓存最大尺度
            return cacheLogStr[fileType] = `${cacheLogStr[fileType]}]\n${logStr}`
        } else {
            // 如果超出则直接写入日志
            return this._addLog(fileType, cacheLogStr[fileType])
        }
    }
    _intervalWrite() {
        setInterval(() => {
            if (Object.keys(cacheLogStr).length < 1) {
                // 空数据不处理
                return;
            }
            for (let fileType in cacheLogStr) {
                // 遍历需要写入的日志信息
                if (cacheLogStr[fileType] === '') {
                    //空数据，需要清理句柄。对空缓存的文件流句柄进行清理，
                    // 避免一些没用句柄缓存一直占用缓存数据
                    this._clean(fileType).then();
                    continue;
                }
                // 写入日志，写入完成后，需要清理当前的日志缓存，注意这里可能会导致
                // 日志丢失。主要在写入日志完成后，还没清理，又有数据写入临时缓存中，导致
                // 部分丢失的现象，默认情况下允许这种情况，因为这种丢失的现象
                // 概率比较低
                this._addLog(fileType, cacheLogStr[fileType]).then(() => {
                    cacheLogStr[fileType] = ''
                })
            }
        }, this.cacheTime);
    }
}

module.exports = Logger;