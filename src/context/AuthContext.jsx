import { createContext, useContext, useEffect, useState } from "react";
import {
  getToken,
  getUser,
  saveAuth,
  logout as clearAuth,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const storedUser = getUser();

    if (token && storedUser) {
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  const login = (token, userData) => {
    saveAuth(token, userData);
    setUser(userData);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  const value = {
    user,
    token: getToken(),
    loading,
    isAuthenticated: !!getToken(),
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}

export default AuthContext;