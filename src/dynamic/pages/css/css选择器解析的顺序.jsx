import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/css/css选择器解析的顺序.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;