import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, Role } from "@/contexts/AuthContext";

export type TourStep = {
  id: string;
  /** CSS selector for element to highlight. If omitted, step renders centered. */
  selector?: string;
  title: string;
  body: string;
  /** Route to navigate to before showing step. Tour waits until route matches. */
  route?: string;
  /** Roles allowed to see this step. If omitted, visible for everyone. */
  roles?: Role[];
  /** Phase: "pre-login" steps run while user is null on /login. */
  phase: "pre-login" | "post-login";
  placement?: "top" | "bottom" | "left" | "right" | "center";
};

type TourCtx = {
  active: boolean;
  stepIndex: number;
  steps: TourStep[];
  current: TourStep | null;
  start: () => void;
  next: () => void;
  prev: () => void;
  stop: (markComplete?: boolean) => void;
  restart: () => void;
};

const Ctx = createContext<TourCtx | null>(null);
const STORAGE_KEY = "advoralabs.tour.completed";

const ALL_STEPS: TourStep[] = [
  // ============ PRE-LOGIN ============
  {
    id: "welcome",
    phase: "pre-login",
    route: "/login",
    title: "Welcome to Advora Warehouse HUB",
    body: "Take a quick guided tour to see how the WMS console works. We'll start by showing you how to sign in with a demo account, then walk through the key features for your role.",
    placement: "center",
  },
  {
    id: "demo-toggle",
    phase: "pre-login",
    route: "/login",
    selector: "[data-tour='demo-toggle']",
    title: "Try a demo account",
    body: "Click here to expand the list of pre-configured demo accounts. Each represents a different role with its own permissions and dashboard.",
    placement: "top",
  },
  {
    id: "demo-accounts",
    phase: "pre-login",
    route: "/login",
    selector: "[data-tour='demo-accounts']",
    title: "Pick a role",
    body: "Choose any role to autofill its credentials — Admin, Warehouse Manager, Inventory Staff, Dispatch Operator, or Viewer. The interface adapts to what each role can see and do.",
    placement: "top",
  },
  {
    id: "sign-in",
    phase: "pre-login",
    route: "/login",
    selector: "[data-tour='sign-in']",
    title: "Sign in to continue",
    body: "Once credentials are loaded, click Sign in. The tour will continue inside the workspace tailored to the role you picked.",
    placement: "top",
  },

  // ============ POST-LOGIN: shared ============
  {
    id: "sidebar",
    phase: "post-login",
    route: "/app",
    selector: "[data-tour='sidebar']",
    title: "Your navigation",
    body: "The sidebar shows only the modules your role can access. Sections are grouped by Overview, Operations, Insights, and Admin.",
    placement: "right",
  },
  {
    id: "topbar-search",
    phase: "post-login",
    route: "/app",
    selector: "[data-tour='topbar-search']",
    title: "Global search",
    body: "Quickly find SKUs, orders, suppliers, and more from anywhere in the app.",
    placement: "bottom",
  },
  {
    id: "topbar-theme",
    phase: "post-login",
    route: "/app",
    selector: "[data-tour='topbar-theme']",
    title: "Light & dark mode",
    body: "Toggle between light and dark themes — your preference is saved.",
    placement: "bottom",
  },
  {
    id: "topbar-notifications",
    phase: "post-login",
    route: "/app",
    selector: "[data-tour='topbar-notifications']",
    title: "Live alerts",
    body: "Stock-outs, low-stock warnings, and delayed shipments surface here in real time.",
    placement: "bottom",
  },
  {
    id: "topbar-user",
    phase: "post-login",
    route: "/app",
    selector: "[data-tour='topbar-user']",
    title: "Account menu",
    body: "Access your settings, switch teams, restart this tour, and sign out from here.",
    placement: "bottom",
  },
  {
    id: "dashboard",
    phase: "post-login",
    route: "/app",
    title: "Your dashboard",
    body: "Each role lands on a tailored dashboard showing the KPIs and shortcuts most relevant to your work.",
    placement: "center",
  },

  // ============ POST-LOGIN: role-specific deep dives ============
  {
    id: "products",
    phase: "post-login",
    route: "/app/products",
    roles: ["Admin", "Warehouse Manager"],
    title: "Product catalog",
    body: "Manage your full SKU catalog — pricing, suppliers, batch & expiry tracking, and reorder levels live here.",
    placement: "center",
  },
  {
    id: "inventory",
    phase: "post-login",
    route: "/app/inventory",
    roles: ["Admin", "Warehouse Manager", "Inventory Staff"],
    title: "Inventory",
    body: "View live stock across all warehouses, adjust quantities, and track damaged or in-transit units.",
    placement: "center",
  },
  {
    id: "inbound",
    phase: "post-login",
    route: "/app/inbound",
    roles: ["Admin", "Warehouse Manager", "Inventory Staff"],
    title: "Inbound shipments",
    body: "Receive supplier shipments, log damages, and close GRNs (Goods Receipt Notes).",
    placement: "center",
  },
  {
    id: "outbound",
    phase: "post-login",
    route: "/app/outbound",
    roles: ["Admin", "Warehouse Manager", "Dispatch Operator"],
    title: "Outbound orders",
    body: "Pick, pack, and dispatch customer orders with priority queues and live status.",
    placement: "center",
  },
  {
    id: "transfers",
    phase: "post-login",
    route: "/app/transfers",
    roles: ["Admin", "Warehouse Manager", "Inventory Staff", "Dispatch Operator"],
    title: "Stock transfers",
    body: "Move inventory between warehouses and track in-transit quantities.",
    placement: "center",
  },
  {
    id: "reports",
    phase: "post-login",
    route: "/app/reports",
    roles: ["Admin", "Warehouse Manager", "Viewer"],
    title: "Reports & analytics",
    body: "Drill into stock movement, category mix, warehouse utilization, and supplier performance.",
    placement: "center",
  },
  {
    id: "users",
    phase: "post-login",
    route: "/app/users",
    roles: ["Admin"],
    title: "Users & roles",
    body: "Invite team members and assign roles. Permissions update across the app instantly.",
    placement: "center",
  },
  {
    id: "settings",
    phase: "post-login",
    route: "/app/settings",
    roles: ["Admin", "Warehouse Manager"],
    title: "Workspace settings",
    body: "Configure preferences, branding, and integrations for your organization.",
    placement: "center",
  },
  {
    id: "done",
    phase: "post-login",
    route: "/app",
    title: "You're all set",
    body: "That's the tour. You can restart it anytime from the account menu in the top-right.",
    placement: "center",
  },
];

export function TourProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Filter steps by role + phase
  const steps = useMemo(() => {
    return ALL_STEPS.filter((s) => {
      if (s.phase === "pre-login") return !user;
      // post-login
      if (!user) return false;
      if (s.roles && !s.roles.includes(user.role)) return false;
      return true;
    });
  }, [user]);

  // Auto-start on first ever visit to /login when not logged in
  useEffect(() => {
    if (active) return;
    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed) return;
    if (!user && location.pathname === "/login") {
      // small delay so page mounts
      const t = setTimeout(() => {
        setStepIndex(0);
        setActive(true);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [user, location.pathname, active]);

  // When user logs in mid-tour, jump into post-login phase
  useEffect(() => {
    if (!active) return;
    if (stepIndex >= steps.length || !steps[stepIndex]) {
      const idx = steps.findIndex((s) => s.phase === "post-login");
      if (idx >= 0) setStepIndex(idx);
      else if (steps.length > 0) setStepIndex(0);
      else setActive(false);
    }
  }, [steps, active, stepIndex]);

  const current = steps[stepIndex] ?? null;

  // Navigate to step's route if needed
  useEffect(() => {
    if (!active || !current) return;
    if (current.route && location.pathname !== current.route) {
      navigate(current.route);
    }
  }, [active, current, location.pathname, navigate]);

  const start = useCallback(() => {
    setStepIndex(0);
    setActive(true);
  }, []);

  const stop = useCallback((markComplete = true) => {
    setActive(false);
    if (markComplete) localStorage.setItem(STORAGE_KEY, "1");
  }, []);

  const next = useCallback(() => {
    setStepIndex((i) => {
      if (i >= steps.length - 1) {
        setActive(false);
        localStorage.setItem(STORAGE_KEY, "1");
        return i;
      }
      return i + 1;
    });
  }, [steps.length]);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const restart = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStepIndex(0);
    setActive(true);
  }, []);

  return (
    <Ctx.Provider value={{ active, stepIndex, steps, current, start, next, prev, stop, restart }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTour() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTour must be used within TourProvider");
  return c;
}
