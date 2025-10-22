## 深入理解React服务器组件的工作原理

### 参考文档
- [https://dev.to/a1guy/react-19-server-components-deep-dive-what-they-are-how-they-work-and-when-to-use-them-2h2e](https://dev.to/a1guy/react-19-server-components-deep-dive-what-they-are-how-they-work-and-when-to-use-them-2h2e)

### 高层图景

让我们首先直观地了解一下它的工作原理。

想象一下你页面的 React 树，其中一些组件要在服务器上渲染，一些要在客户端渲染。以下是思考高级策略的一种简化方法：服务器可以像往常一样“渲染”服务器组件，将 React 组件转换为原生 HTML 元素（例如div和p）。但是，每当它遇到要在浏览器中渲染的“客户端”组件时，它只会输出一个占位符，并指示使用正确的客户端组件和 props 填充这个空洞。然后，浏览器获取该输出，用客户端组件填充这些空洞，瞧！大功告成。

这并不是它真正的工作原理，我们很快就会进入那些真正棘手的细节；但它是一幅很有用的高级图像，可以在你的脑海中浮现！

### 注意事项

#### 客户端组件不能直接import服务器组件

客户端组件不能导入服务器组件！这是因为服务器组件无法在浏览器中运行，并且可能包含无法在浏览器中运行的代码。比如像下面这样直接import服务器组件是不可以的
```jsx
// ClientComponent.client.jsx
// NOT OK:
import ServerComponent from './ServerComponent.server'
export default function ClientComponent() {
  return (
    <div>
      <ServerComponent />
    </div>
  )
}
```
虽然你不能在客户端组件中直接导入并渲染服务器组件，但我们可以讲服务器组件当作children传递给客户端组件
```jsx
// ClientComponent.client.jsx
export default function ClientComponent({ children }) {
  return (
    <div>
      <h1>Hello from client land</h1>
      {children}
    </div>
  )
}

// ServerComponent.server.jsx
export default function ServerComponent() {
  return <span>Hello from server land</span>
}

// OuterServerComponent.server.jsx
// OuterServerComponent can instantiate both client and server
// components, and we are passing in a <ServerComponent/> as
// the children prop to the ClientComponent.
import ClientComponent from './ClientComponent.client'
import ServerComponent from './ServerComponent.server'
export default function OuterServerComponent() {
  return (
    <ClientComponent>
      <ServerComponent />
    </ClientComponent>
  )
}

```

>此限制将对您如何组织组件以更好地利用 RSC 产生重大影响。