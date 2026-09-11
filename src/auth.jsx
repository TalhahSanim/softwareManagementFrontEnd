import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const TOKEN_KEY = "software-registry-token";

export function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function loadStoredAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return { token: null, user: null };
  const user = parseJwt(token);
  if (!user) {
    localStorage.removeItem(TOKEN_KEY);
    return { token: null, user: null };
  }
  return { token, user };
}

export function AuthProvider({ children }) {
  const [{ token, user }, setAuth] = useState(loadStoredAuth);

  const value = useMemo(() => {
    function login(nextToken) {
      const nextUser = parseJwt(nextToken);
      if (!nextToken || !nextUser) {
        throw new Error("Login did not return a valid token.");
      }
      localStorage.setItem(TOKEN_KEY, nextToken);
      setAuth({ token: nextToken, user: nextUser });
    }

    function logout() {
      localStorage.removeItem(TOKEN_KEY);
      setAuth({ token: null, user: null });
    }

    return {
      token,
      user,
      isAdmin: Boolean(user?.isSysAdmin),
      login,
      logout,
    };
  }, [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
