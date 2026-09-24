import React from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <LeftSidebar />

      <main
        className="
          min-h-screen
          w-full
          pt-14
          pb-16
          lg:ml-64
          lg:w-auto
          lg:pt-0
          lg:pb-0
        "
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
