import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/less/escaping.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;