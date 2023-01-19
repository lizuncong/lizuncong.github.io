import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/web优化/什么是CDN.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;