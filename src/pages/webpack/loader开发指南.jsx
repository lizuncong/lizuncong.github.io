import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/webpack/loader开发指南.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;

        