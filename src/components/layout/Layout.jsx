import React, { useState } from "react";
import { Box } from "@mui/material";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Topbar toggleSidebar={toggleSidebar} />
      <Sidebar open={sidebarOpen} onClose={toggleSidebar} />
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          height: "100vh",
          overflow: "hidden", // 👈 important
          backgroundColor: "#f5f5f5",
        }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
