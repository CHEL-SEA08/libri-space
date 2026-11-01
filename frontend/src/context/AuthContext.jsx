
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const API = "https://libri-space-backend.onrender.com/api";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("libraryToken") || ""
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("libraryUser")) || null;
    } catch {
      return null;
    }
  });

  async function authenticate(endpoint, details) {
    const response = await fetch(`${API}/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    localStorage.setItem("libraryToken", data.token);
    localStorage.setItem("libraryUser", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);

    return data;
  }

  function login(email, password) {
    return authenticate("login", { email, password });
  }

  function register(name, email, password) {
    return authenticate("register", { name, email, password });
  }

  function logout() {
    localStorage.removeItem("libraryToken");
    localStorage.removeItem("libraryUser");
    setToken("");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
