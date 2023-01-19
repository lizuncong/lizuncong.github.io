import React from "react";
import MarkDown from "@/components/markdown";
import shape from "@docs/网络/http请求状态码.md";

function Index() {
  return <MarkDown src={shape} />;
}

export default Index;