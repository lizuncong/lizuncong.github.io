

## IOS 兼容性问题

### overflow 合并写法在 iphonex 会导致无法滚动

```less
.x-scroll {
  overflow: scroll hidden; // 这种合并写法在xs有问题：https://www.tapd.cn/43745555/bugtrace/bugs/view/1143745555001735127
  transform: translateZ(0);
  touch-action: pan-x;
  scroll-behavior: smooth; /* 平滑滚动 */
}
```

应该要分开写：

```less
.x-scroll {
  overflow-x: scroll;
  overflow-y: hidden;
  transform: translateZ(0);
  touch-action: pan-x;
  scroll-behavior: smooth; /* 平滑滚动 */
}
```

### 启用硬件加速在 iphonex 会出现水平滚动条

如果使用`-webkit-overflow-scrolling`开启硬件加速，即使使用`.x-scroll::-webkit-scrollbar`隐藏滚动条，在 iphonex webview 还是会出现水平滚动条，其他机型就不会

```less
.x-scroll {
  overflow-x: scroll;
  overflow-y: hidden;
  transform: translateZ(0);
  touch-action: pan-x;
  scroll-behavior: smooth; /* 平滑滚动 */
  -webkit-overflow-scrolling: touch; /* 启用硬件加速滚动 */ // 会导致Iphonex有水平滚动条
}
.x-scroll::-webkit-scrollbar {
  display: none;
}
```

因此可以去掉`-webkit-overflow-scrolling`

### border image source 在 iphone12mini 等机型会导致多出差不多 4px 的高度

在使用 border image source 实现类似安卓点 9 图效果时，在 ipone12mini 会导致多出 4px 的像素。出现些奇怪的问题，比如选中的礼物框不完整[【和平 mod】11pro 互动礼物有多余的蓝色线条/选中礼物框显示不完整](https://www.tapd.cn/43745555/bugtrace/bugs/view/1143745555001735111)

这个问题产生的本质原因，是容器使用了 border image，同时容器设置了 padding:4px。但由于 border image source 在 12mini 等个别机型会导致多出额外的 4px，导致容器的 padding 看上去比实际的 4px 要大很多。

[image](../../imgs/border_image_01.png)

```less
@select-camp-slice: 120;
@select-camp-width: 120px;

@shu-bg-slice: 120;
@shu-bg-width: 120px;

.container {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 4px;
  overflow: hidden;
  border-image-slice: 0 @shu-bg-slice 0 @shu-bg-slice fill;
  border-image-width: 0 @shu-bg-width 0 @shu-bg-width;
}
```

解决这个问题，只需要设置 border: 0; 即可，比如：

```less
.container {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 4px;
  overflow: hidden;
  border: 0; // 解决兼容性问题
  border-image-slice: 0 @shu-bg-slice 0 @shu-bg-slice fill;
  border-image-width: 0 @shu-bg-width 0 @shu-bg-width;
}
```
