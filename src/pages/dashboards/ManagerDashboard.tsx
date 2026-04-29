import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { warehouses, products, totalAvailable, formatCompact, activities, alerts, stockMovement30d, warehouseUtilizationData } from "@/data/mock";
import { Boxes, AlertTriangle, Truck, Warehouse as WhIcon, TrendingUp, Users as UsersIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const tooltipStyle = {
  contentStyle: { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--popover-foreground))" },
};

export default function ManagerDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const lowStock = products.filter((p) => totalAvailable(p) > 0 && totalAvailable(p) < p.reorderLevel);
  const stockouts = products.filter((p) => totalAvailable(p) === 0);
  const avgUtil = Math.round(warehouses.reduce((s, w) => s + (w.used / w.capacity) * 100, 0) / warehouses.length);
  const team = [
    { name: "Rohit Verma",  role: "Inventory Staff",   tasks: 12, status: "online" },
    { name: "Neha Kapoor",  role: "Dispatch Operator", tasks: 8,  status: "online" },
    { name: "Karan Singh",  role: "Inventory Staff",   tasks: 4,  status: "away" },
    { name: "Asha Pillai",  role: "Dispatch Operator", tasks: 15, status: "online" },
  ];

  return (
    <>
      <PageHeader
        title={`Good day, ${user?.name?.split(" ")[0] ?? "Manager"}`}
        description="Warehouse operations overview — utilization, team performance and reorder risk."
      />

      <div className="stat-grid">
        <StatCard label="Avg utilization" value={`${avgUtil}%`} icon={WhIcon} accent="primary" hint="across 4 warehouses" />
        <StatCard label="Low stock SKUs" value={lowStock.length} icon={AlertTriangle} accent="warning" />
        <StatCard label="Stockouts" value={stockouts.length} icon={Boxes} accent="destructive" />
        <StatCard label="Active team" value={team.filter(t => t.status === "online").length} icon={UsersIcon} accent="success" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold">Stock movement</h3>
          <p className="text-xs text-muted-foreground">Inbound vs outbound — last 30 days</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockMovement30d} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="m1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(239 90% 67%)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(239 90% 67%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="inbound" stroke="hsl(239 90% 67%)" strokeWidth={2} fill="url(#m1)" />
                <Area type="monotone" dataKey="outbound" stroke="hsl(199 90% 60%)" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold">Warehouse capacity</h3>
          <div className="mt-3 space-y-3">
            {warehouses.map((w) => {
              const pct = Math.round((w.used / w.capacity) * 100);
              return (
                <div key={w.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{w.code}</span>
                    <span className={pct > 85 ? "text-warning" : "text-muted-foreground"}>{pct}%</span>
                  </div>
                  <Progress value={pct} className="mt-1.5 h-1.5" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Team workload</h3>
            <Button variant="ghost" size="sm" onClick={() => nav("/app/users")}>Manage team</Button>
          </div>
          <div className="mt-3 divide-y divide-border">
            {team.map((m) => (
              <div key={m.name} className="flex items-center gap-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-semibold">
                  {m.name.split(" ").map(p => p[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground">{m.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{m.tasks}</div>
                  <div className="text-[10px] text-muted-foreground">open tasks</div>
                </div>
                <span className={`h-2 w-2 rounded-full ${m.status === "online" ? "bg-success" : "bg-muted-foreground/40"}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Action required</h3>
            <Button variant="ghost" size="sm" onClick={() => nav("/app/alerts")}>All alerts</Button>
          </div>
          <div className="mt-3 space-y-2">
            {alerts.filter(a => !a.read).slice(0, 5).map((a) => (
              <div key={a.id} className="rounded-lg border border-border p-2.5">
                <div className="flex items-start gap-2">
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${a.severity === "critical" ? "bg-destructive" : a.severity === "warning" ? "bg-warning" : "bg-info"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">{a.title}</div>
                    <div className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(a.ts), { addSuffix: true })}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 surface-card p-5">
        <h3 className="text-sm font-semibold">Reorder watchlist</h3>
        <p className="text-xs text-muted-foreground">SKUs below their reorder level</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {lowStock.slice(0, 9).map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{p.sku}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-warning">{totalAvailable(p)}</div>
                <div className="text-[10px] text-muted-foreground">/ {p.reorderLevel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
