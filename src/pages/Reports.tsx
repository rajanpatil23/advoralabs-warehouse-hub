import { PageHeader } from "@/components/PageHeader";
import { categoryDistribution, stockMovement30d, products, totalAvailable, formatCurrency, formatCompact } from "@/data/mock";
import { StatCard } from "@/components/StatCard";
import { Activity, BarChart3, TrendingUp, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportCSV } from "@/lib/exportCSV";
import { toast } from "sonner";

const tooltipStyle = {
  contentStyle: { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--popover-foreground))" },
};

export default function Reports() {
  const sortedFast = [...products].sort((a, b) => totalAvailable(b) - totalAvailable(a)).slice(0, 8);
  const lowStock = products.filter((p) => totalAvailable(p) > 0 && totalAvailable(p) < p.reorderLevel).slice(0, 8);
  const inventoryValue = products.reduce((s, p) => s + totalAvailable(p) * p.cost, 0);

  return (
    <>
      <PageHeader
        title="Reports & analytics"
        description="Operational insights, inventory health and fulfillment performance."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const rows = products.map((p) => ({
                sku: p.sku, name: p.name, category: p.category,
                available: totalAvailable(p), reorderLevel: p.reorderLevel,
                cost: p.cost, value: totalAvailable(p) * p.cost,
              }));
              exportCSV("inventory-report", rows);
              toast.success("Report exported");
            }}
          >
            <Download className="mr-1.5 h-4 w-4" /> Export report
          </Button>
        }
      />

      <div className="stat-grid">
        <StatCard label="Inventory value" value={formatCurrency(inventoryValue)} delta={3.4} icon={Wallet} accent="success" />
        <StatCard label="Fast movers" value={sortedFast.length} icon={TrendingUp} accent="primary" />
        <StatCard label="Low stock items" value={lowStock.length} icon={Activity} accent="warning" />
        <StatCard label="Avg fulfillment" value="2.4 days" icon={BarChart3} accent="info" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold">Inbound vs outbound trend</h3>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockMovement30d} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="inbound" stroke="hsl(239 90% 67%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="outbound" stroke="hsl(199 90% 60%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold">Category stock value</h3>
          <p className="text-xs text-muted-foreground">Units in stock by category</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {categoryDistribution.map((_, i) => <Cell key={i} fill={`hsl(${239 - i * 12} 80% 65%)`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold">Fast-moving items</h3>
          <div className="mt-3 divide-y divide-border">
            {sortedFast.map((p) => (
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
        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold">Low stock report</h3>
          <div className="mt-3 divide-y divide-border">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">Reorder at {p.reorderLevel}</div>
                </div>
                <span className="text-sm font-semibold text-warning">{totalAvailable(p)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
