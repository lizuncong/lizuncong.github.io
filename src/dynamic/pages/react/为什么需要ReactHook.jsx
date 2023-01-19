import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/react/为什么需要ReactHook.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;