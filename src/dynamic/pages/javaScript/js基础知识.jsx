import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/javaScript/js基础知识.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;