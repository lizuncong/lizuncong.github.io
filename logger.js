
const { promisify } = require('util');
const redis = require('redis');
const NodeCache = require('node-cache');

class Cache {
  constructor(localCacheEnable = true, redisEnable = true){
    this.localCacheEnable = localCacheEnable;
    this.redisEnable = redisEnable;
    
    if(localCacheEnable){
      this.localCache = new NodeCache();
    }

    if(redisEnable){
      this.redisClient = redis.createClient({
        host: 'redis-18568.c12.us-east-1-4.ec2.cloud.redislabs.com',
        port: 18568,
        password: 'eI1cKZZ87CSHcr9eeRO142ORHJtJCYfO',
        db: 0,
      });
    }
  }

  /**
   * 获取缓存数据
   * @param {string} key 
   * @returns 
   */
  async get(key){
    let value;
    if(this.localCacheEnable){
      value = this.localCache.get(key);
      console.log(`local cache value is ${value}`);
    }
    if(!value && this.redisEnable){
      try {
        value = await promisify(this.redisClient.get).bind(this.redisClient)(key);
        console.log(`redis cache value is ${value}`)
      } catch(error){
        console.log(error);
      }
    }
    return value;
  }

  /**
   * 设置保存值
   * @param {string} key 缓存key 
   * @param {string} value 缓存值
   * @param {number} exprie 过期时间/秒
   * @param {*} cacheLocal 是否本地缓存
   * @returns 
   */
  async set(key, value, exprie = 10, cacheLocal = false){
    let localCacheRet, redisRet;
    if(this.localCacheEnable){
      localCacheRet = this.localCache.set(key, value, exprie);
    }

    if(this.redisEnable){
      try {
        redisRet = await promisify(this.redisClient.set).bind(this.redisClient)(key, value, 'EX', exprie)
      } catch (error) {
        console.log(error)
      }
    }
    return localCacheRet || redisRet;
  }

}

module.exports = (localCacheEnable = true, redisEnable = true) => {
  return new Cache(localCacheEnable, redisEnable)
}