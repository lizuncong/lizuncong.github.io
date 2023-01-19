import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/SEO优化/SEO优化指南.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;