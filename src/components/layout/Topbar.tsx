import { useTheme } from "next-themes";
import { Bell, Moon, Search, Sun, LogOut, Menu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { alerts } from "@/data/mock";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const titleMap: Record<string, string> = {
  "/app": "Dashboard",
  "/app/products": "Products",
  "/app/inventory": "Inventory",
  "/app/warehouses": "Warehouses",
  "/app/inbound": "Inbound",
  "/app/outbound": "Outbound",
  "/app/transfers": "Transfers",
  "/app/suppliers": "Suppliers",
  "/app/reports": "Reports",
  "/app/alerts": "Alerts",
  "/app/users": "Users",
  "/app/logs": "Activity Logs",
  "/app/settings": "Settings",
};

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const unread = alerts.filter((a) => !a.read).length;
  const title = titleMap[location.pathname] || "Connecttly";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Button
        variant="outline"
        size="sm"
        className="md:hidden gap-2 px-2.5"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="h-4 w-4" />
        <span className="text-xs font-medium">Menu</span>
      </Button>

      <div className="flex items-center gap-1.5 text-sm">
        <span className="hidden sm:inline text-muted-foreground">Connecttly</span>
        <ChevronRight className="hidden sm:inline h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">{title}</span>
      </div>

      <div className="flex-1" />

      <div className="relative hidden sm:block w-64 lg:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search SKUs, orders, suppliers…"
          className="h-9 pl-9 bg-surface-elevated border-border"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-4.5 w-4.5" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            Notifications
            <Badge variant="secondary" className="font-normal">{unread} new</Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-80 overflow-y-auto">
            {alerts.slice(0, 6).map((a) => (
              <button
                key={a.id}
                onClick={() => navigate("/app/alerts")}
                className="w-full text-left px-3 py-2.5 hover:bg-muted/60 transition-colors border-b border-border/60 last:border-0"
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    a.severity === "critical" ? "bg-destructive" : a.severity === "warning" ? "bg-warning" : "bg-info"
                  }`} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{a.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{a.detail}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(a.ts), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/app/alerts")} className="justify-center text-primary">
            View all alerts
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-2 py-1 text-left hover:bg-muted/60 focus-ring">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary text-xs font-semibold text-primary-foreground">
              {user?.initials ?? "U"}
            </div>
            <div className="hidden md:block leading-tight">
              <div className="text-xs font-medium">{user?.name ?? "User"}</div>
              <div className="text-[10px] text-muted-foreground">{user?.role ?? ""}</div>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="font-medium">{user?.name}</div>
            <div className="text-xs font-normal text-muted-foreground">{user?.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/app/settings")}>Account settings</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/app/users")}>Team & roles</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => { logout(); navigate("/login"); }}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
