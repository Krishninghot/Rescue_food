import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "../api/axios";
import { User } from "../types";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: Record<string, any>) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("frn_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me").then((res) => setUser(res.data.user))
      .catch(() => { localStorage.removeItem("frn_token"); })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("frn_token", res.data.token);
    setUser(res.data.user);
    return res.data.user as User;
  }

  async function register(payload: Record<string, any>) {
    const res = await api.post("/auth/register", payload);
    localStorage.setItem("frn_token", res.data.token);
    setUser(res.data.user);
    return res.data.user as User;
  }

  function logout() {
    localStorage.removeItem("frn_token");
    setUser(null);
  }

  async function refreshUser() {
    const res = await api.get("/auth/me");
    setUser(res.data.user);
  }

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
