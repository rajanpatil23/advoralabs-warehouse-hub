import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { products, warehouses, totalAvailable, formatCompact } from "@/data/mock";
import { StatCard } from "@/components/StatCard";
import { Boxes, AlertTriangle, PackageX, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Settings2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Inventory() {
  const [q, setQ] = useState("");
  const [wh, setWh] = useState<string>("all");
  const [adjustOpen, setAdjustOpen] = useState(false);

  const totalsByWh = useMemo(() => {
    const map: Record<string, { available: number; reserved: number; damaged: number; inTransit: number }> = {};
    for (const w of warehouses) map[w.id] = { available: 0, reserved: 0, damaged: 0, inTransit: 0 };
    for (const p of products) {
      for (const [wid, s] of Object.entries(p.stock)) {
        if (!map[wid]) continue;
        map[wid].available += s.available;
        map[wid].reserved += s.reserved;
        map[wid].damaged += s.damaged;
        map[wid].inTransit += s.inTransit;
      }
    }
    return map;
  }, []);

  const aggTotals = useMemo(() => {
    let avail = 0, reserved = 0, damaged = 0, inTransit = 0, low = 0;
    for (const p of products) {
      const st = Object.values(p.stock);
      const a = st.reduce((s, x) => s + x.available, 0);
      avail += a;
      reserved += st.reduce((s, x) => s + x.reserved, 0);
      damaged += st.reduce((s, x) => s + x.damaged, 0);
      inTransit += st.reduce((s, x) => s + x.inTransit, 0);
      if (a > 0 && a < p.reorderLevel) low++;
    }
    return { avail, reserved, damaged, inTransit, low };
  }, []);

  const rows = useMemo(() => {
    return products
      .filter((p) => (q ? `${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase()) : true))
      .map((p) => {
        const st = wh === "all"
          ? Object.values(p.stock).reduce(
              (acc, x) => ({ available: acc.available + x.available, reserved: acc.reserved + x.reserved, damaged: acc.damaged + x.damaged, inTransit: acc.inTransit + x.inTransit }),
              { available: 0, reserved: 0, damaged: 0, inTransit: 0 },
            )
          : p.stock[wh] ?? { available: 0, reserved: 0, damaged: 0, inTransit: 0 };
        return { p, st };
      })
      .filter((r) => wh === "all" || r.p.stock[wh])
      .slice(0, 60);
  }, [q, wh]);

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Live stock levels, reorder risk, and snapshots across all warehouses."
        actions={
          <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground"><Settings2 className="mr-1.5 h-4 w-4" /> Stock adjustment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjust stock</DialogTitle>
                <DialogDescription>Record an inventory adjustment with a reason. This will be audit-logged.</DialogDescription>
              </DialogHeader>
              <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); toast.success("Adjustment submitted for approval"); setAdjustOpen(false); }}>
                <div className="space-y-1.5"><Label>SKU</Label><Input required placeholder="ELE-0001" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Warehouse</Label>
                    <Select defaultValue={warehouses[0].id}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.code}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Quantity (±)</Label><Input required type="number" placeholder="-10" /></div>
                </div>
                <div className="space-y-1.5"><Label>Reason</Label>
                  <Select defaultValue="cycle">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cycle">Cycle count correction</SelectItem>
                      <SelectItem value="damage">Damage / breakage</SelectItem>
                      <SelectItem value="loss">Loss / shrinkage</SelectItem>
                      <SelectItem value="found">Found stock</SelectItem>
                      <SelectItem value="return">Customer return</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAdjustOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-gradient-primary text-primary-foreground">Submit</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="stat-grid">
        <StatCard label="Available" value={formatCompact(aggTotals.avail)} icon={Boxes} accent="success" />
        <StatCard label="Reserved" value={formatCompact(aggTotals.reserved)} icon={Boxes} accent="info" />
        <StatCard label="In transit" value={formatCompact(aggTotals.inTransit)} icon={Truck} accent="primary" />
        <StatCard label="Damaged" value={aggTotals.damaged} icon={PackageX} accent="destructive" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {warehouses.map((w) => {
          const t = totalsByWh[w.id];
          const pct = Math.round((w.used / w.capacity) * 100);
          return (
            <div key={w.id} className="surface-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{w.code}</div>
                  <div className="text-xs text-muted-foreground">{w.name}</div>
                </div>
                <div className="text-xs text-muted-foreground">{pct}%</div>
              </div>
              <Progress value={pct} className="mt-3 h-1.5" />
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div><div className="text-muted-foreground">Avail</div><div className="font-medium">{formatCompact(t.available)}</div></div>
                <div><div className="text-muted-foreground">Reserved</div><div className="font-medium">{formatCompact(t.reserved)}</div></div>
                <div><div className="text-muted-foreground">Damaged</div><div className="font-medium">{t.damaged}</div></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 surface-card p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search SKU or product…" className="pl-9" />
          </div>
          <Select value={wh} onValueChange={setWh}>
            <SelectTrigger className="sm:w-56"><SelectValue placeholder="Warehouse" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All warehouses</SelectItem>
              {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.code} — {w.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-warning/10 px-2.5 py-1.5 text-xs text-warning">
            <AlertTriangle className="h-3.5 w-3.5" />
            {aggTotals.low} items below reorder
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead className="text-right">In transit</TableHead>
                <TableHead className="text-right">Damaged</TableHead>
                <TableHead className="text-right">Reorder</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ p, st }) => {
                const total = totalAvailable(p);
                const ratio = total / Math.max(1, p.reorderLevel);
                const tag = total === 0 ? "Stockout" : total < p.reorderLevel ? "Low" : ratio > 4 ? "Excess" : "Healthy";
                const cls = tag === "Stockout" ? "text-destructive" : tag === "Low" ? "text-warning" : tag === "Excess" ? "text-info" : "text-success";
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium truncate max-w-[280px]">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">{p.category} · {p.brand}</div>
                    </TableCell>
                    <TableCell><span className="font-mono text-xs">{p.sku}</span></TableCell>
                    <TableCell className="text-right font-medium">{st.available}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{st.reserved}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{st.inTransit}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{st.damaged}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{p.reorderLevel}</TableCell>
                    <TableCell><span className={`text-xs font-medium ${cls}`}>● {tag}</span></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
