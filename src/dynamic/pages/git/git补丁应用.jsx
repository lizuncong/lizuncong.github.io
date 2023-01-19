import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/git/git补丁应用.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;