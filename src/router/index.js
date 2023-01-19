import React from "react";
import { createHashRouter } from "react-router-dom";
import { Spin } from "antd";
import Home from "@/pages/home";
import App from "@/App";
import dynamicRoutes from "@/dynamic/routes";
const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <React.Suspense
            fallback={
              <div className="loading">
                <Spin size="large" />
              </div>
            }
          >
            <Home />
          </React.Suspense>
        ),
      },
      ...dynamicRoutes,
    ],
  },
]);

export default router;
