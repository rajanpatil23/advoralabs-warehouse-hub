import { ReactNode, createContext, useContext, useEffect, useState } from "react";

type Role = "Admin" | "Warehouse Manager" | "Inventory Staff" | "Dispatch Operator" | "Viewer";
type AuthUser = { name: string; email: string; role: Role; initials: string };

type AuthCtx = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: (role?: Role) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const STORAGE = "connecttly.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE);
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE, JSON.stringify(u));
    else localStorage.removeItem(STORAGE);
  };

  const login = async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const name = email.split("@")[0].replace(/[^a-z]/gi, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Operator";
    persist({
      name,
      email,
      role: "Warehouse Manager",
      initials: name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(),
    });
  };

  const loginDemo = (role: Role = "Admin") => {
    persist({ name: "Demo Admin", email: "demo@connecttly.io", role, initials: "DA" });
  };

  const logout = () => persist(null);

  return <Ctx.Provider value={{ user, login, loginDemo, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
