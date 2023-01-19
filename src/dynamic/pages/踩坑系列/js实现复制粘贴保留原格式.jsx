import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/踩坑系列/js实现复制粘贴保留原格式.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;