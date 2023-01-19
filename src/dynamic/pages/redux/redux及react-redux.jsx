import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/redux/redux及react-redux.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;