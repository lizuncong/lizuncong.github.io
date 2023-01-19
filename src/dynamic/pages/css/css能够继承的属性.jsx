import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/css/css能够继承的属性.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;