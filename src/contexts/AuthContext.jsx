import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // track if auth is being initialized

  useEffect(() => {
    // Check localStorage for token on app load
    const token = localStorage.getItem("adminToken");
    if (token) {
      // Optionally, verify token with backend
      setUser({
        email: "admin@example.com", // you can fetch actual user info if needed
        name: "Admin",
        role: "admin",
      });
    }
    setLoading(false); // auth check complete
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:4000/api/admin/login", {
        email,
        password,
      });

      const token = res.data.token;

      if (token) {
        localStorage.setItem("adminToken", token);
        setUser({
          email,
          name: "Admin",
          role: "admin",
        });
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
