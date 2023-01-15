import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/踩坑系列/iframe的src和window.location.href.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;

        