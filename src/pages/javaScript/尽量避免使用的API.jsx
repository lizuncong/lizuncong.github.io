import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/javaScript/尽量避免使用的API.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;

        