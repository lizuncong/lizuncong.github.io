```js
/**
 * 基于IndexDB封装的仿localStage用法的工具
 * **/
function promisify(something) {
  return new Promise((resolve, reject) => {
    something.onsuccess = () => resolve(something.result);
    something.onerror = () => reject(something.error);
  });
}
class DBStorage {
  constructor(dbName, storeName) {
    const request = window.indexedDB.open(dbName);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    const dbPromise = promisify(request);

    this.execute = async (operationMode, callback) => {
      const db = await dbPromise;
      const store = db.transaction(storeName, operationMode).objectStore(storeName);
      return callback(store);
    };
  }
  setItem(key, value) {
    return this.execute('readwrite', store => {
      store.put(value, key);
      return promisify(store.transaction);
    });
  }
  // 出于性能考虑，插入多个数据时优先使用这个方法, setManyItems([key: 'img', value: '11'])
  setManyItems(items) {
    return this.execute('readwrite', store => {
      items.forEach(item => store.put(item.value, item.key));
      return promisify(store.transaction);
    });
  }
  getItem(key) {
    return this.execute('readonly', store => promisify(store.get(key)));
  }
  removeItem(key) {
    return this.execute('readwrite', store => {
      return promisify(store.delete(key));
    });
  }
  clear() {
    return this.execute('readwrite', store => {
      return promisify(store.clear());
    });
  }
}

const dbStorage = new DBStorage('mars-teacher', 'kv');

export default dbStorage;

// dbStorage.setItem('elements', [1,2,3,4,5])

// dbStorage.removeItem('elements')
// dbStorage.clear();

// dbStorage.setManyItems([
//     {key: 1, value: 'hello'},
//     {key: 2, value: 'test'}
// ])
// dbStorage.getItem('elements11').then(res => {
//   console.log('获取元素elements...', res)
// })

```
