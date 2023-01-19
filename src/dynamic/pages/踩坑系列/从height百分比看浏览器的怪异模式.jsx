import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/踩坑系列/从height百分比看浏览器的怪异模式.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;