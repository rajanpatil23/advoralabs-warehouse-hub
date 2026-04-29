import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth, Permission } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

const ROUTE_PERMS: Record<string, Permission> = {
  "/app": "dashboard.view",
  "/app/products": "products.view",
  "/app/inventory": "inventory.view",
  "/app/warehouses": "warehouses.view",
  "/app/inbound": "inbound.view",
  "/app/outbound": "outbound.view",
  "/app/transfers": "transfers.view",
  "/app/suppliers": "suppliers.view",
  "/app/reports": "reports.view",
  "/app/alerts": "alerts.view",
  "/app/users": "users.view",
  "/app/logs": "logs.view",
  "/app/settings": "settings.view",
};

export function RouteGuard({ children }: { children: ReactNode }) {
  const { can } = useAuth();
  const loc = useLocation();
  const required = ROUTE_PERMS[loc.pathname];
  const denied = required && !can(required);
  const warned = useRef(false);

  useEffect(() => {
    if (denied && !warned.current) {
      warned.current = true;
      toast.error("Access denied", { description: `Your role can't access ${loc.pathname}` });
    }
  }, [denied, loc.pathname]);

  if (denied) return <Navigate to="/app" replace />;
  return <>{children}</>;
}
