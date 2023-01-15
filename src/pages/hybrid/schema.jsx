import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/hybrid/schema.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;

        