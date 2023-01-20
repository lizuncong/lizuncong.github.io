import React, { memo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import "./index.less";

const Highlighter = memo(({ language, children, ...props }) => {
  const [show, setShow] = useState(false);
  const copy = (text) => {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 1000);
  };
  return (
    <div className="high-lighter">
      <span className="copy" onClick={() => copy(String(children))}>
        {show ? "复制成功！" : "复制"}
      </span>
      <SyntaxHighlighter
        children={String(children).replace(/\n$/, "")}
        language={language}
        className="my-code"
        PreTag="div"
        {...props}
      />
    </div>
  );
});

export default Highlighter;
