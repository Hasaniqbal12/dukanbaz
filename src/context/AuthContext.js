"use client";

import { createContext, useContext, useState, useEffect } from "react";

const DUMMY_USER = {
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("authUser");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (email, password) => {
    if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
      setUser(DUMMY_USER);
      localStorage.setItem("authUser", JSON.stringify(DUMMY_USER));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 