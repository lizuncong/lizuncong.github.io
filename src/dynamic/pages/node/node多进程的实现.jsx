import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/node/node多进程的实现.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;