import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/踩坑系列/302重定向到同源网站cookie丢失的问题.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;