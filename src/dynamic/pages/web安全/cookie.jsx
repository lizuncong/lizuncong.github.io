import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/web安全/cookie.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;