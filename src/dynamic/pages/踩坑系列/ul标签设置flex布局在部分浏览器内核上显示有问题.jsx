import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/踩坑系列/ul标签设置flex布局在部分浏览器内核上显示有问题.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;