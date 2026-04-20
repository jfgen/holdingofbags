import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch, setToken, getToken } from "../api/client";
import type { User } from "../types";

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    apiFetch<{ user: User }>("/api/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Ctx.Provider value={{
      user,
      loading,
      login: (t, u) => { setToken(t); setUser(u); },
      logout: () => { setToken(null); setUser(null); },
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
