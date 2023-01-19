import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/web优化/web性能指标及前端监控体系.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;