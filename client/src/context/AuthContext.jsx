import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext(null);

/**
 * Stores the JWT in module-level memory (never localStorage/sessionStorage)
 * so it can't be read by injected scripts via XSS.
 * The variable lives only for the lifetime of the current page/tab.
 */
let inMemoryToken = null;

function setInMemoryToken(token) {
  inMemoryToken = token;
  // Attach to axios defaults so every subsequent request is authenticated
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const login = useCallback((token, user) => {
    setInMemoryToken(token);
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    setInMemoryToken(null);
    setCurrentUser(null);
  }, []);

  /** Merges a partial user update into the current user object in-memory. */
  const updateUser = useCallback((partialUser) => {
    setCurrentUser((prev) => prev ? { ...prev, ...partialUser } : prev);
  }, []);

  const isAuthenticated = Boolean(inMemoryToken && currentUser);

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
