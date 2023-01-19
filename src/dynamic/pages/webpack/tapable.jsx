import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/webpack/tapable.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;