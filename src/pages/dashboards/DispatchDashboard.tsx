import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { outboundOrders, warehouses } from "@/data/mock";
import { Truck, Package, ArrowUpFromLine, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";

export default function DispatchDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();

  const byStatus = (s: string) => outboundOrders.filter(o => o.status === s);
  const picking   = byStatus("picking");
  const packed    = byStatus("packed");
  const dispatched = byStatus("dispatched");
  const urgent    = outboundOrders.filter(o => o.priority === "urgent" && o.status !== "delivered" && o.status !== "cancelled");

  const courierPerf = [
    { name: "BlueDart Express", onTime: 96, shipments: 124 },
    { name: "Delhivery Surface", onTime: 91, shipments: 312 },
    { name: "Ekart Logistics",   onTime: 88, shipments: 87 },
    { name: "FedEx Priority",    onTime: 98, shipments: 41 },
  ];

  return (
    <>
      <PageHeader
        title={`Dispatch deck, ${user?.name?.split(" ")[0] ?? "Operator"}`}
        description="Live fulfillment pipeline — pick, pack, dispatch."
        actions={
          <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={() => nav("/app/outbound")}>
            <ArrowUpFromLine className="mr-1.5 h-4 w-4" /> Open fulfilment
          </Button>
        }
      />

      <div className="stat-grid">
        <StatCard label="Picking"     value={picking.length}     icon={Package}       accent="info" />
        <StatCard label="Packed"      value={packed.length}      icon={CheckCircle2}  accent="primary" />
        <StatCard label="Dispatched"  value={dispatched.length}  icon={Truck}         accent="success" />
        <StatCard label="Urgent open" value={urgent.length}      icon={AlertTriangle} accent="destructive" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {[
          { key: "picking", title: "Picking", color: "info", list: picking },
          { key: "packed",  title: "Packed",  color: "primary", list: packed },
          { key: "dispatched", title: "Dispatched", color: "success", list: dispatched },
        ].map((col) => (
          <div key={col.key} className="surface-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <span className="text-xs text-muted-foreground">{col.list.length}</span>
            </div>
            <div className="mt-3 space-y-2 max-h-[420px] overflow-auto pr-1">
              {col.list.slice(0, 8).map((o) => {
                const wh = warehouses.find(w => w.id === o.warehouseId);
                return (
                  <button
                    key={o.id}
                    onClick={() => nav("/app/outbound")}
                    className="w-full text-left rounded-lg border border-border bg-surface-elevated/40 p-2.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-medium">{o.ref}</span>
                      <StatusBadge status={o.priority} />
                    </div>
                    <div className="mt-1 text-sm font-medium truncate">{o.customer}</div>
                    <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="truncate">{o.city} · {wh?.code}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(o.date), "dd MMM")}</span>
                    </div>
                  </button>
                );
              })}
              {col.list.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No orders
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold">Courier performance</h3>
          <p className="text-xs text-muted-foreground">On-time delivery rate · last 30 days</p>
          <div className="mt-3 divide-y divide-border">
            {courierPerf.map((c) => (
              <div key={c.name} className="flex items-center gap-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground">{c.shipments} shipments</div>
                </div>
                <span className={`text-sm font-semibold ${c.onTime >= 95 ? "text-success" : c.onTime >= 90 ? "text-info" : "text-warning"}`}>
                  {c.onTime}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold">Urgent queue</h3>
          <p className="text-xs text-muted-foreground">Priority orders awaiting action</p>
          <div className="mt-3 divide-y divide-border max-h-72 overflow-auto">
            {urgent.slice(0, 8).map((o) => (
              <div key={o.id} className="flex items-center gap-3 py-2.5">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{o.customer}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{o.ref} · {o.status}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => nav("/app/outbound")}>Open</Button>
              </div>
            ))}
            {urgent.length === 0 && <div className="text-xs text-muted-foreground py-2">No urgent orders</div>}
          </div>
        </div>
      </div>
    </>
  );
}
