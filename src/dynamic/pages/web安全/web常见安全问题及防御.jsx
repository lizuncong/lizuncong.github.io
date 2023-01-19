import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/web安全/web常见安全问题及防御.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;