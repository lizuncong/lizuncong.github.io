import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { UnorderedListOutlined, CloseOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import "./App.css";
import MENU from "./menu";

function App() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return (
    <div className="App">
      <span className="menu" onClick={() => setOpen(!open)}>
        {open ? <CloseOutlined /> : <UnorderedListOutlined />}
      </span>
      <div className={["left", open && "open"].join(" ")}>
        <Menu
          style={{ height: "100%", overflow: "auto" }}
          defaultOpenKeys={["canvas_base"]}
          selectedKeys={[location.pathname]}
          mode="inline"
          items={MENU}
        />
      </div>
      <div className="right">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
