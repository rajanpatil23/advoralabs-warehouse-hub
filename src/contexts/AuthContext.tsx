import { ReactNode, createContext, useContext, useEffect, useState } from "react";

export type Role =
  | "Admin"
  | "Warehouse Manager"
  | "Inventory Staff"
  | "Dispatch Operator"
  | "Viewer";

export type AuthUser = {
  name: string;
  email: string;
  role: Role;
  initials: string;
};

type AuthCtx = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: (role?: Role) => void;
  logout: () => void;
  can: (perm: Permission) => boolean;
};

// Permission model — module-level.
export type Permission =
  | "dashboard.view"
  | "products.view" | "products.manage"
  | "inventory.view" | "inventory.adjust"
  | "warehouses.view" | "warehouses.manage"
  | "inbound.view" | "inbound.manage"
  | "outbound.view" | "outbound.manage"
  | "transfers.view" | "transfers.manage"
  | "suppliers.view" | "suppliers.manage"
  | "reports.view"
  | "alerts.view" | "alerts.manage"
  | "users.view" | "users.manage"
  | "logs.view"
  | "settings.view" | "settings.manage";

const ROLE_PERMS: Record<Role, Permission[]> = {
  Admin: [
    "dashboard.view",
    "products.view","products.manage",
    "inventory.view","inventory.adjust",
    "warehouses.view","warehouses.manage",
    "inbound.view","inbound.manage",
    "outbound.view","outbound.manage",
    "transfers.view","transfers.manage",
    "suppliers.view","suppliers.manage",
    "reports.view",
    "alerts.view","alerts.manage",
    "users.view","users.manage",
    "logs.view",
    "settings.view","settings.manage",
  ],
  "Warehouse Manager": [
    "dashboard.view",
    "products.view","products.manage",
    "inventory.view","inventory.adjust",
    "warehouses.view","warehouses.manage",
    "inbound.view","inbound.manage",
    "outbound.view","outbound.manage",
    "transfers.view","transfers.manage",
    "suppliers.view","suppliers.manage",
    "reports.view",
    "alerts.view","alerts.manage",
    "users.view",
    "logs.view",
    "settings.view",
  ],
  "Inventory Staff": [
    "dashboard.view",
    "products.view",
    "inventory.view","inventory.adjust",
    "warehouses.view",
    "inbound.view","inbound.manage",
    "transfers.view","transfers.manage",
    "suppliers.view",
    "alerts.view",
    "logs.view",
  ],
  "Dispatch Operator": [
    "dashboard.view",
    "products.view",
    "inventory.view",
    "warehouses.view",
    "outbound.view","outbound.manage",
    "transfers.view",
    "alerts.view",
    "logs.view",
  ],
  Viewer: [
    "dashboard.view",
    "products.view",
    "inventory.view",
    "warehouses.view",
    "inbound.view","outbound.view","transfers.view",
    "suppliers.view","reports.view","alerts.view","logs.view",
  ],
};

// Hardcoded demo credentials (portfolio / showcase).
export const DEMO_ACCOUNTS: { email: string; password: string; name: string; role: Role }[] = [
  { email: "admin@advoralabs.io",    password: "admin123",    name: "Aarav Mehta",    role: "Admin" },
  { email: "manager@advoralabs.io",  password: "manager123",  name: "Priya Sharma",   role: "Warehouse Manager" },
  { email: "inventory@advoralabs.io",password: "inventory123",name: "Rohit Verma",    role: "Inventory Staff" },
  { email: "dispatch@advoralabs.io", password: "dispatch123", name: "Neha Kapoor",    role: "Dispatch Operator" },
  { email: "viewer@advoralabs.io",   password: "viewer123",   name: "Sam Iyer",       role: "Viewer" },
];

const Ctx = createContext<AuthCtx | null>(null);
const STORAGE = "advoralabs.user";

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

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

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500));
    const match = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
    );
    if (!match) {
      throw new Error("Invalid email or password");
    }
    persist({
      name: match.name,
      email: match.email,
      role: match.role,
      initials: initials(match.name),
    });
  };

  const loginDemo = (role: Role = "Admin") => {
    const acc = DEMO_ACCOUNTS.find((a) => a.role === role) ?? DEMO_ACCOUNTS[0];
    persist({ name: acc.name, email: acc.email, role: acc.role, initials: initials(acc.name) });
  };

  const logout = () => persist(null);

  const can = (perm: Permission) => {
    if (!user) return false;
    return ROLE_PERMS[user.role]?.includes(perm) ?? false;
  };

  return (
    <Ctx.Provider value={{ user, login, loginDemo, logout, can }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
