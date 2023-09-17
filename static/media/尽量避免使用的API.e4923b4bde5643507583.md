### 尽量避免使用的JavaScript API
收集可以但尽量避免使用的JS API。

- eval。使用eval执行字符串。
- Function。使用new Function可以接受字符串并执行
- setTimeout。避免使用setTimeout执行字符串。
- with。

以上几个API都是JS提供的，但不建议在项目中使用，要么有安全漏洞，比如eval、Function、setTimeout（用于执行字符串的场景）。要么有性能问题，比如with


#### eval
```js
eval('console.log(1234)')
```

#### Function构造函数
```js
new Function('console.log(1234)')()
```

#### setTimeout
setTimeout鲜为人知的一点是可以执行字符串，比如：
```js
setTimeout('console.log(1234)', 1000)
```

#### with
with主要用于改变执行的上下文。