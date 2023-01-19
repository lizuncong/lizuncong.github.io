import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/web优化总结/移动端首屏优化.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;