import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "antd";
import "./App.css";
import MENU from './menu'

function App() {
  const location = useLocation()
  return (
    <div className="App">
      <div className="left">
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
