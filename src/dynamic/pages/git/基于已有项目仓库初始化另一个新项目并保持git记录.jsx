import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/git/基于已有项目仓库初始化另一个新项目并保持git记录.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;