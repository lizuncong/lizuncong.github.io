import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/webpack/如何提高webpack构建速度.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;