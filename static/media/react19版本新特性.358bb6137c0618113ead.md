## 一、新增React Compiler
新增React Compiler，它是一个新的构建时工具，可以自动处理记忆化来优化React应用，从而无需再手动使用useMemo，useCallback和memo

React 编译器的自动记忆化主要专注于**提高更新性能（重新渲染现有组件）**，因此它聚焦于以下两种使用场景：

- 1.跳过组件的级联重新渲染
重新渲染 `<Parent />` 会导致其组件树中的许多组件重新渲染，即使只有 `<Parent />` 发生了变化
- 2.跳过 React 外部的昂贵计算
例如，在组件或 Hook 中调用 expensivelyProcessAReallyLargeArrayOfObjects() 这个处理大数据数组的函数


- React Compiler只会针对React组件以及hooks记忆化，并不是每个函数都会记忆化
- React Compiler的记忆化并不能跨多个组件或者hook共享

比如下面的`expensivelyProcessAReallyLargeArrayOfObjects`函数并不会被记忆化，但在组件内部的调用结果会被记忆化。同时，如果在其他组件也调用了这个函数，那其他组件内部的调用还是会执行一次
```jsx
// **Not** memoized by React Compiler, since this is not a component or hook
function expensivelyProcessAReallyLargeArrayOfObjects() { /* ... */ }

// Memoized by React Compiler since this is a component
function TableContainer({ items }) {
  // This function call would be memoized:
  const data = expensivelyProcessAReallyLargeArrayOfObjects(items);
  // ...
}

```

## 二、新增的hook

### 2.1 useSyncExternalStore

### 2.2 useDeferredValue
`useDeferredValue` 可以结合 `memo` 做耗时长的列表渲染优化