import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { products, totalAvailable, warehouses, formatCompact, inboundShipments, suppliers } from "@/data/mock";
import { Boxes, AlertTriangle, PackageX, ArrowDownToLine, ScanLine, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export default function InventoryDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const lowStock = products.filter((p) => totalAvailable(p) > 0 && totalAvailable(p) < p.reorderLevel);
  const stockouts = products.filter((p) => totalAvailable(p) === 0);
  const damaged = products.reduce((s, p) => s + Object.values(p.stock).reduce((a, x) => a + x.damaged, 0), 0);
  const expectedInbound = inboundShipments.filter(s => s.status === "expected" || s.status === "partial");
  const myTasks = [
    { id: "T-1024", type: "Stock count", target: "Aisle A1–A4 · MUM-01", priority: "high" },
    { id: "T-1025", type: "Receive GRN", target: "PO-7831 · 124 units",  priority: "normal" },
    { id: "T-1026", type: "Bin transfer", target: "B2-04 → B7-12",        priority: "normal" },
    { id: "T-1027", type: "Damage report", target: "SKU APP-0042 · 6u",   priority: "high" },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name?.split(" ")[0] ?? "Operator"}`}
        description="Today's stock tasks, receiving queue and SKUs that need attention."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => nav("/app/inventory")}>
              <ScanLine className="mr-1.5 h-4 w-4" /> Stock count
            </Button>
            <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={() => nav("/app/inbound")}>
              <ArrowDownToLine className="mr-1.5 h-4 w-4" /> Receive shipment
            </Button>
          </>
        }
      />

      <div className="stat-grid">
        <StatCard label="My open tasks"   value={myTasks.length}        icon={ClipboardList} accent="primary" />
        <StatCard label="Low stock SKUs"  value={lowStock.length}       icon={AlertTriangle} accent="warning" />
        <StatCard label="Stockouts"       value={stockouts.length}      icon={Boxes}         accent="destructive" />
        <StatCard label="Damaged units"   value={damaged}               icon={PackageX}      accent="destructive" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold">My tasks today</h3>
          <p className="text-xs text-muted-foreground">Assigned to {user?.name}</p>
          <div className="mt-3 divide-y divide-border">
            {myTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-[10px] font-mono font-semibold">
                  {t.id.split("-")[1]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{t.type}</div>
                  <div className="text-xs text-muted-foreground">{t.target}</div>
                </div>
                <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${t.priority === "high" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"}`}>
                  {t.priority}
                </span>
                <Button size="sm" variant="outline">Start</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold">Warehouse fill</h3>
          <div className="mt-3 space-y-3">
            {warehouses.map((w) => {
              const pct = Math.round((w.used / w.capacity) * 100);
              return (
                <div key={w.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{w.code}</span>
                    <span className="text-muted-foreground">{formatCompact(w.used)} / {formatCompact(w.capacity)}</span>
                  </div>
                  <Progress value={pct} className="mt-1.5 h-1.5" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Receiving queue</h3>
            <Button variant="ghost" size="sm" onClick={() => nav("/app/inbound")}>Open inbound</Button>
          </div>
          <div className="mt-3 divide-y divide-border">
            {expectedInbound.slice(0, 6).map((s) => {
              const sup = suppliers.find(x => x.id === s.supplierId);
              const wh = warehouses.find(w => w.id === s.warehouseId);
              const units = s.items.reduce((a, i) => a + i.expected, 0);
              return (
                <div key={s.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium font-mono">{s.ref}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{sup?.name} → {wh?.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{units}u</div>
                    <div className="text-[10px] text-muted-foreground">{format(new Date(s.expectedDate), "dd MMM")}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold">Reorder watchlist</h3>
          <p className="text-xs text-muted-foreground">Below reorder level</p>
          <div className="mt-3 divide-y divide-border max-h-72 overflow-auto">
            {lowStock.slice(0, 10).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2">
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
      </div>
    </>
  );
}
