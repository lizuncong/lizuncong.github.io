import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/web优化总结/webpack打包构建优化.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;

        