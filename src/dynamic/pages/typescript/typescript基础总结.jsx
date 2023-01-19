import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/typescript/typescript基础总结.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;