import { useState, type FormEvent } from "react";

import { PageHeader } from "@/components/PageHeader";
import { warehouses as initialWarehouses, products, formatCompact, type Warehouse } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Building2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { EntityActionMenu } from "@/components/EntityActionMenu";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const zones = ["A — Receiving", "B — Bulk", "C — Pick", "D — Dispatch"];

type WarehouseForm = {
  name: string;
  code: string;
  city: string;
  country: string;
  capacity: string;
};

const defaultForm: WarehouseForm = {
  name: "",
  code: "",
  city: "",
  country: "IN",
  capacity: "8000",
};

export default function Warehouses() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialWarehouses);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null);
  const [form, setForm] = useState<WarehouseForm>(defaultForm);

  const reset = () => {
    setEditing(null);
    setForm(defaultForm);
  };

  const openCreate = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (warehouse: Warehouse) => {
    setEditing(warehouse);
    setForm({
      name: warehouse.name,
      code: warehouse.code,
      city: warehouse.city,
      country: warehouse.country,
      capacity: String(warehouse.capacity),
    });
    setOpen(true);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const capacity = Number(form.capacity);
    const payload: Warehouse = editing
      ? {
          ...editing,
          name: form.name,
          code: form.code,
          city: form.city,
          country: form.country,
          capacity,
          used: Math.min(editing.used, capacity),
        }
      : {
          id: `wh-local-${Date.now()}`,
          name: form.name,
          code: form.code,
          city: form.city,
          country: form.country,
          capacity,
          used: 0,
        };

    setItems((prev) => editing ? prev.map((item) => (item.id === editing.id ? payload : item)) : [payload, ...prev]);
    toast.success(editing ? `Updated ${payload.code}` : `Created ${payload.code}`);
    setOpen(false);
    reset();
  };

  const remove = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    toast.success(`Deleted ${deleteTarget.code}`);
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader
        title="Warehouses"
        description="Locations, zones and bin utilization across your network."
        actions={
          <Dialog open={open} onOpenChange={(state) => { setOpen(state); if (!state) reset(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" /> Add warehouse</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit warehouse" : "Add warehouse"}</DialogTitle>
                <DialogDescription>{editing ? "Update this location's identity and capacity." : "Create a new physical location."}</DialogDescription>
              </DialogHeader>
              <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
                <div className="space-y-1.5 sm:col-span-2"><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Pune Hub" /></div>
                <div className="space-y-1.5"><Label>Code</Label><Input required value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))} placeholder="PUN-05" /></div>
                <div className="space-y-1.5"><Label>City</Label><Input required value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} placeholder="Pune" /></div>
                <div className="space-y-1.5"><Label>Country</Label><Input required value={form.country} onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label>Capacity (units)</Label><Input required type="number" value={form.capacity} onChange={(e) => setForm((prev) => ({ ...prev, capacity: e.target.value }))} /></div>
                <DialogFooter className="sm:col-span-2">
                  <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
                  <Button type="submit" className="bg-gradient-primary text-primary-foreground">{editing ? "Save warehouse" : "Create warehouse"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((w) => {
          const pct = Math.round((w.used / w.capacity) * 100);
          const skus = products.filter((p) => p.stock[w.id]).length;
          const units = products.reduce((s, p) => s + (p.stock[w.id]?.available ?? 0), 0);
          return (
            <div key={w.id} className="surface-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-base font-semibold">{w.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <MapPin className="h-3 w-3" /> {w.city}, {w.country} · <span className="font-mono">{w.code}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Utilization</div>
                    <div className="text-lg font-semibold">{pct}%</div>
                  </div>
                  <EntityActionMenu onEdit={() => openEdit(w)} onDelete={() => setDeleteTarget(w)} editLabel="Edit warehouse" deleteLabel="Delete warehouse" />
                </div>
              </div>

              <Progress value={pct} className="mt-4 h-2" />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>{formatCompact(w.used)} used</span>
                <span>{formatCompact(w.capacity)} capacity</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md border border-border bg-surface-elevated/50 p-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">SKUs</div>
                  <div className="text-sm font-semibold">{skus}</div>
                </div>
                <div className="rounded-md border border-border bg-surface-elevated/50 p-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Units</div>
                  <div className="text-sm font-semibold">{formatCompact(units)}</div>
                </div>
                <div className="rounded-md border border-border bg-surface-elevated/50 p-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Bins</div>
                  <div className="text-sm font-semibold">{12 * 4 * 3}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs font-medium text-muted-foreground mb-2">Zones</div>
                <div className="grid grid-cols-2 gap-2">
                  {zones.map((z) => (
                    <div key={z} className="rounded-md border border-border bg-surface-elevated/30 px-3 py-2 text-xs">
                      <div className="font-medium">{z}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{Math.floor(Math.random() * 60) + 30}% used</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs font-medium text-muted-foreground mb-2">Bin map (preview)</div>
                <div className="grid grid-cols-12 gap-1">
                  {Array.from({ length: 60 }).map((_, i) => {
                    const intensity = (Math.sin(i + w.id.charCodeAt(3)) + 1) / 2;
                    const cls =
                      intensity > 0.75 ? "bg-destructive/60" :
                      intensity > 0.5 ? "bg-warning/60" :
                      intensity > 0.25 ? "bg-primary/50" : "bg-muted";
                    return <div key={i} className={`h-4 rounded-sm ${cls}`} />;
                  })}
                </div>
                <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-muted" /> Empty</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary/50" /> Light</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-warning/60" /> Medium</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-destructive/60" /> Full</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(state) => !state && setDeleteTarget(null)}
        title="Delete warehouse?"
        description={deleteTarget ? `This removes ${deleteTarget.name} from the active network in this demo.` : ""}
        confirmLabel="Delete warehouse"
        onConfirm={remove}
      />
    </>
  );
}
