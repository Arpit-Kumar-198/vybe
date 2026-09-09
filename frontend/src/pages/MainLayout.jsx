import React from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Page Content */}
      <main className="flex-1 lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
