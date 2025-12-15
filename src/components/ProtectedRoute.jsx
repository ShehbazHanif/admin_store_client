import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While loading, render nothing or a spinner
  if (loading) return <div>Loading...</div>;

  // Not logged in → redirect
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Optional: admin check
  if (user.role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
