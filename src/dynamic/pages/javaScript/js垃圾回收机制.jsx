import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/javaScript/js垃圾回收机制.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;