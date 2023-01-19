import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/浏览器兼容/css.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;