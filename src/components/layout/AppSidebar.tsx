import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, Package, Boxes, Warehouse, ArrowDownToLine, ArrowUpFromLine,
  ArrowLeftRight, Truck, BarChart3, Bell, Users, ScrollText, Settings,
} from "lucide-react";
import { useAuth, Permission } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";

type Item = { to: string; label: string; icon: typeof LayoutDashboard; section?: string; perm: Permission };

const items: Item[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, section: "Overview", perm: "dashboard.view" },
  { to: "/app/products", label: "Products", icon: Package, section: "Operations", perm: "products.view" },
  { to: "/app/inventory", label: "Inventory", icon: Boxes, perm: "inventory.view" },
  { to: "/app/warehouses", label: "Warehouses", icon: Warehouse, perm: "warehouses.view" },
  { to: "/app/inbound", label: "Inbound", icon: ArrowDownToLine, perm: "inbound.view" },
  { to: "/app/outbound", label: "Outbound", icon: ArrowUpFromLine, perm: "outbound.view" },
  { to: "/app/transfers", label: "Transfers", icon: ArrowLeftRight, perm: "transfers.view" },
  { to: "/app/suppliers", label: "Suppliers", icon: Truck, section: "Insights", perm: "suppliers.view" },
  { to: "/app/reports", label: "Reports", icon: BarChart3, perm: "reports.view" },
  { to: "/app/alerts", label: "Alerts", icon: Bell, perm: "alerts.view" },
  { to: "/app/users", label: "Users", icon: Users, section: "Admin", perm: "users.view" },
  { to: "/app/logs", label: "Activity Logs", icon: ScrollText, perm: "logs.view" },
  { to: "/app/settings", label: "Settings", icon: Settings, perm: "settings.view" },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, can } = useAuth();
  const visible = items.filter((i) => can(i.perm));
  let lastSection = "";
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-sidebar-foreground">Advora Labs</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">WMS Console</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {visible.map((item) => {
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;
          return (
            <div key={item.to}>
              {showSection && (
                <div className="px-2 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.section}
                </div>
              )}
              <NavLink
                to={item.to}
                end={item.to === "/app"}
                onClick={onNavigate}
                className="group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-soft"
              >
                <item.icon className="h-4 w-4 opacity-80 group-hover:opacity-100" />
                <span>{item.label}</span>
              </NavLink>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-sidebar-foreground">Signed in as</div>
            <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {user?.role ?? "—"}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            All warehouses online
          </div>
        </div>
      </div>
    </aside>
  );
}
