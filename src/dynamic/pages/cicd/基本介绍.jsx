import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/cicd/基本介绍.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;