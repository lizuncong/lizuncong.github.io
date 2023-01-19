import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/git/git合并其他仓库的分支.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;