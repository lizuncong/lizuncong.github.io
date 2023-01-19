import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/web优化总结/关键渲染路径.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;