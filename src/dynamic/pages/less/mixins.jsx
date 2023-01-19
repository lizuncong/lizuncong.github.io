import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/less/mixins.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;