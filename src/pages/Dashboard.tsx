import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import {
  Boxes, Package, Wallet, AlertTriangle, ArrowDownToLine, ArrowUpFromLine,
  Truck, Warehouse as WhIcon, PackageX, RotateCcw, Plus, Download,
} from "lucide-react";
import {
  totals, stockMovement30d, categoryDistribution, warehouseUtilizationData,
  activities, alerts, formatCurrency, formatCompact,
} from "@/data/mock";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie,
  PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const PIE_COLORS = ["hsl(239 90% 67%)", "hsl(258 88% 70%)", "hsl(199 90% 60%)", "hsl(152 65% 50%)", "hsl(38 95% 58%)", "hsl(0 75% 60%)"];

const tooltipStyle = {
  contentStyle: {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    fontSize: 12,
    color: "hsl(var(--popover-foreground))",
  },
  cursor: { fill: "hsl(var(--muted) / 0.4)" },
};

export default function Dashboard() {
  const nav = useNavigate();
  return (
    <>
      <PageHeader
        title="Operations dashboard"
        description="Live view across all warehouses, shipments, and stock movements."
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="mr-1.5 h-4 w-4" /> Export</Button>
            <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={() => nav("/app/inbound")}>
              <Plus className="mr-1.5 h-4 w-4" /> New shipment
            </Button>
          </>
        }
      />

      <div className="stat-grid">
        <StatCard label="Total SKUs" value={totals.totalSkus} delta={4.2} hint="vs last month" icon={Package} />
        <StatCard label="Total stock units" value={formatCompact(totals.units)} delta={1.6} hint="across 4 warehouses" icon={Boxes} accent="info" />
        <StatCard label="Inventory value" value={formatCurrency(totals.value)} delta={2.9} hint="cost basis" icon={Wallet} accent="success" />
        <StatCard label="Low stock items" value={totals.lowStock} delta={-3.1} hint="below reorder" icon={AlertTriangle} accent="warning" />
      </div>

      <div className="mt-4 stat-grid">
        <StatCard label="Incoming shipments" value={totals.incoming} icon={ArrowDownToLine} accent="info" hint="expected & partial" />
        <StatCard label="Outgoing orders" value={totals.outgoing} icon={ArrowUpFromLine} accent="primary" hint="open pipeline" />
        <StatCard label="Pending dispatches" value={totals.dispatched} icon={Truck} accent="warning" hint="awaiting handoff" />
        <StatCard label="Warehouse utilization" value={`${totals.utilization}%`} icon={WhIcon} accent="success" hint="weighted avg" />
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Stock movement</h3>
              <p className="text-xs text-muted-foreground">Inbound vs outbound — last 30 days</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Inbound</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-info" /> Outbound</span>
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockMovement30d} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(239 90% 67%)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(239 90% 67%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199 90% 60%)" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="hsl(199 90% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="inbound" stroke="hsl(239 90% 67%)" strokeWidth={2} fill="url(#g1)" />
                <Area type="monotone" dataKey="outbound" stroke="hsl(199 90% 60%)" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold">Category distribution</h3>
          <p className="text-xs text-muted-foreground">Units in stock by category</p>
          <div className="mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryDistribution} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2} stroke="hsl(var(--background))">
                  {categoryDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
            {categoryDistribution.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 truncate">
                <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="truncate">{c.name}</span>
                <span className="ml-auto text-muted-foreground">{formatCompact(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold">Warehouse utilization</h3>
          <p className="text-xs text-muted-foreground">Used vs free capacity</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseUtilizationData} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="used" stackId="a" fill="hsl(239 90% 67%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="free" stackId="a" fill="hsl(var(--muted))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent activity</h3>
            <Button variant="ghost" size="sm" onClick={() => nav("/app/logs")}>View all</Button>
          </div>
          <div className="mt-3 divide-y divide-border">
            {activities.slice(0, 7).map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-semibold">
                  {a.user.split(" ").map((p) => p[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{a.user}</span> <span className="text-muted-foreground">— {a.action}</span>{" "}
                    <span className="font-mono text-xs text-foreground/80">{a.detail}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{a.module} · {formatDistanceToNow(new Date(a.ts), { addSuffix: true })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts + small KPIs */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Alert center</h3>
            <Button variant="ghost" size="sm" onClick={() => nav("/app/alerts")}>Open</Button>
          </div>
          <div className="mt-3 space-y-2">
            {alerts.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface-elevated/50 p-3">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                  a.severity === "critical" ? "bg-destructive" : a.severity === "warning" ? "bg-warning" : "bg-info"
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.detail}</div>
                </div>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(a.ts), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <StatCard label="Damaged stock" value={totals.damaged} icon={PackageX} accent="destructive" />
          <StatCard label="Returns this month" value={totals.returns} icon={RotateCcw} accent="warning" />
        </div>
      </div>
    </>
  );
}
