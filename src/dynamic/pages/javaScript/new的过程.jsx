import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/javaScript/new的过程.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;