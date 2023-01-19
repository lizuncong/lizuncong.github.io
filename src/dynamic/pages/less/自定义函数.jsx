import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/less/自定义函数.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;