import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/react/React与Vue的区别.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;