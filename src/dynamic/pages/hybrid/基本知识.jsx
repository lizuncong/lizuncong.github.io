import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/hybrid/基本知识.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;