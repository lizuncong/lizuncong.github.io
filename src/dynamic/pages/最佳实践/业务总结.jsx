import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/最佳实践/业务总结.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;