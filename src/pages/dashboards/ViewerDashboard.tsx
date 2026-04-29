import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { totals, stockMovement30d, categoryDistribution, formatCurrency, formatCompact, products, totalAvailable } from "@/data/mock";
import { Boxes, Package, Wallet, AlertTriangle, Eye, TrendingUp } from "lucide-react";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis } from "recharts";
import { useAuth } from "@/contexts/AuthContext";

const PIE_COLORS = ["hsl(239 90% 67%)", "hsl(258 88% 70%)", "hsl(199 90% 60%)", "hsl(152 65% 50%)", "hsl(38 95% 58%)", "hsl(0 75% 60%)"];

const tooltipStyle = {
  contentStyle: { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--popover-foreground))" },
};

export default function ViewerDashboard() {
  const { user } = useAuth();
  const top = [...products].sort((a, b) => totalAvailable(b) - totalAvailable(a)).slice(0, 6);

  return (
    <>
      <PageHeader
        title={`Read-only overview, ${user?.name?.split(" ")[0] ?? "Viewer"}`}
        description="A high-level snapshot of warehouse operations. View only — no actions enabled."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <Eye className="h-3.5 w-3.5" /> Read-only access
          </span>
        }
      />

      <div className="stat-grid">
        <StatCard label="Total SKUs"        value={totals.totalSkus}                icon={Package}       />
        <StatCard label="Stock units"       value={formatCompact(totals.units)}     icon={Boxes}         accent="info" />
        <StatCard label="Inventory value"   value={formatCurrency(totals.value)}    icon={Wallet}        accent="success" />
        <StatCard label="Low stock"         value={totals.lowStock}                 icon={AlertTriangle} accent="warning" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold">Stock movement</h3>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockMovement30d} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="v1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(239 90% 67%)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(239 90% 67%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="inbound" stroke="hsl(239 90% 67%)" strokeWidth={2} fill="url(#v1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold">Category mix</h3>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryDistribution} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2} stroke="hsl(var(--background))">
                  {categoryDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-4 surface-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Top products by stock</h3>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-3 divide-y divide-border">
          {top.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2.5">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-[11px] text-muted-foreground">{p.category} · {p.sku}</div>
              </div>
              <span className="text-sm font-semibold">{formatCompact(totalAvailable(p))}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
