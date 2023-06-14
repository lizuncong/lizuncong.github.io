
```js
export const resolvablePromise = () => {
  let resolve;
  let reject;
  const promise: any = new Promise((_resolve, _reject) => {
    resolve = (...args: any) => {
      promise.fullfilled = true;
      promise.pending = false;
      // @ts-ignore
      _resolve(...args);
    };
    reject = (...args: any) => {
      promise.rejected = true;
      // @ts-ignore
      _reject(...args);
    };
  });
  promise.resolve = resolve;
  promise.reject = reject;
  promise.pending = true;
  return promise;
};
```
