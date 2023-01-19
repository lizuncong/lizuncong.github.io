import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/webpack/webpack热更新原理.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;