import { useMemo, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/PageHeader";
import { inboundShipments as initialShipments, supplierById, warehouseById, productById, suppliers, warehouses } from "@/data/mock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { format } from "date-fns";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { EntityActionMenu } from "@/components/EntityActionMenu";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type ShipmentRow = typeof initialShipments[number];

type ShipmentForm = {
  ref: string;
  expectedDate: string;
  supplierId: string;
  warehouseId: string;
  status: ShipmentRow["status"];
};

const defaultForm: ShipmentForm = {
  ref: "",
  expectedDate: new Date().toISOString().slice(0, 10),
  supplierId: suppliers[0].id,
  warehouseId: warehouses[0].id,
  status: "expected",
};

export default function Inbound() {
  const [open, setOpen] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [shipments, setShipments] = useState(initialShipments);
  const [editing, setEditing] = useState<ShipmentRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShipmentRow | null>(null);
  const [form, setForm] = useState<ShipmentForm>(defaultForm);
  const sel = useMemo(() => shipments.find((s) => s.id === open), [open, shipments]);

  const reset = () => {
    setEditing(null);
    setForm(defaultForm);
  };

  const openCreate = () => {
    reset();
    setCreateOpen(true);
  };

  const openEdit = (shipment: ShipmentRow) => {
    setEditing(shipment);
    setForm({
      ref: shipment.ref,
      expectedDate: shipment.expectedDate.slice(0, 10),
      supplierId: shipment.supplierId,
      warehouseId: shipment.warehouseId,
      status: shipment.status,
    });
    setCreateOpen(true);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: ShipmentRow = editing
      ? {
          ...editing,
          ref: form.ref,
          expectedDate: new Date(form.expectedDate).toISOString(),
          supplierId: form.supplierId,
          warehouseId: form.warehouseId,
          status: form.status,
        }
      : {
          id: `inb-local-${Date.now()}`,
          ref: form.ref || `GRN-2026-${String(1100 + shipments.length)}`,
          supplierId: form.supplierId,
          warehouseId: form.warehouseId,
          expectedDate: new Date(form.expectedDate).toISOString(),
          status: form.status,
          items: [],
        };

    setShipments((prev) => editing ? prev.map((item) => (item.id === editing.id ? payload : item)) : [payload, ...prev]);
    toast.success(editing ? `Updated ${payload.ref}` : `Created ${payload.ref}`);
    setCreateOpen(false);
    reset();
  };

  const remove = () => {
    if (!deleteTarget) return;
    setShipments((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    if (open === deleteTarget.id) setOpen(null);
    toast.success(`Deleted ${deleteTarget.ref}`);
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader
        title="Inbound shipments"
        description="Receive stock, capture damages and close out POs."
        actions={
          <Dialog open={createOpen} onOpenChange={(state) => { setCreateOpen(state); if (!state) reset(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" /> New shipment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit inbound shipment" : "Create inbound shipment"}</DialogTitle>
                <DialogDescription>{editing ? "Update the receipt plan and current shipment state." : "Schedule an expected receipt from a supplier."}</DialogDescription>
              </DialogHeader>
              <form className="grid gap-3" onSubmit={submit}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>PO reference</Label><Input required value={form.ref} onChange={(e) => setForm((prev) => ({ ...prev, ref: e.target.value }))} placeholder="GRN-2026-1099" /></div>
                  <div className="space-y-1.5"><Label>Expected date</Label><Input required type="date" value={form.expectedDate} onChange={(e) => setForm((prev) => ({ ...prev, expectedDate: e.target.value }))} /></div>
                </div>
                <div className="space-y-1.5"><Label>Supplier</Label>
                  <Select value={form.supplierId} onValueChange={(value) => setForm((prev) => ({ ...prev, supplierId: value }))}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Receiving warehouse</Label>
                  <Select value={form.warehouseId} onValueChange={(value) => setForm((prev) => ({ ...prev, warehouseId: value }))}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.code} — {w.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as ShipmentRow["status"] }))}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["draft", "expected", "partial", "received", "closed"] as ShipmentRow["status"][]).map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => { setCreateOpen(false); reset(); }}>Cancel</Button>
                  <Button type="submit" className="bg-gradient-primary text-primary-foreground">{editing ? "Save shipment" : "Create shipment"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Reference</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Expected</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Received</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.map((s) => {
              const totalExp = s.items.reduce((a, x) => a + x.expected, 0);
              const totalRec = s.items.reduce((a, x) => a + x.received, 0);
              const pct = Math.round((totalRec / Math.max(1, totalExp)) * 100);
              return (
                <TableRow key={s.id}>
                  <TableCell><span className="font-mono text-xs">{s.ref}</span></TableCell>
                  <TableCell>{supplierById(s.supplierId)?.name}</TableCell>
                  <TableCell><span className="text-sm text-muted-foreground">{warehouseById(s.warehouseId)?.code}</span></TableCell>
                  <TableCell><span className="text-sm">{format(new Date(s.expectedDate), "dd MMM yyyy")}</span></TableCell>
                  <TableCell className="text-right">{s.items.length} · {totalExp} units</TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">{totalRec}</span>
                    <span className="text-xs text-muted-foreground"> ({pct}%)</span>
                  </TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setOpen(s.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <EntityActionMenu onEdit={() => openEdit(s)} onDelete={() => setDeleteTarget(s)} editLabel="Edit shipment" deleteLabel="Delete shipment" />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {sel && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{sel.ref}</SheetTitle>
                <SheetDescription>
                  {supplierById(sel.supplierId)?.name} → {warehouseById(sel.warehouseId)?.name}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                <div><div className="text-xs text-muted-foreground">Status</div><StatusBadge status={sel.status} /></div>
                <div><div className="text-xs text-muted-foreground">Expected</div><div>{format(new Date(sel.expectedDate), "dd MMM yyyy")}</div></div>
                <div><div className="text-xs text-muted-foreground">Received</div><div>{sel.receivedDate ? format(new Date(sel.receivedDate), "dd MMM yyyy") : "—"}</div></div>
              </div>

              <div className="mt-6">
                <div className="text-sm font-medium mb-2">Goods receipt</div>
                <div className="rounded-lg border border-border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Expected</TableHead>
                        <TableHead className="text-right">Received</TableHead>
                        <TableHead className="text-right">Damaged</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sel.items.map((it, i) => {
                        const p = productById(it.productId);
                        return (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="text-sm font-medium truncate max-w-[180px]">{p?.name}</div>
                              <div className="text-[11px] font-mono text-muted-foreground">{p?.sku}</div>
                            </TableCell>
                            <TableCell className="text-right">{it.expected}</TableCell>
                            <TableCell className="text-right font-medium">{it.received}</TableCell>
                            <TableCell className="text-right">{it.damaged > 0 ? <span className="text-destructive">{it.damaged}</span> : "—"}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { window.print(); }}>Print GRN</Button>
                <Button
                  className="flex-1 bg-gradient-primary text-primary-foreground"
                  onClick={() => { toast.success(`Stock received for ${sel.ref}`); setOpen(null); }}
                >
                  Receive stock
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(state) => !state && setDeleteTarget(null)}
        title="Delete inbound shipment?"
        description={deleteTarget ? `This removes ${deleteTarget.ref} from the inbound board in this demo.` : ""}
        confirmLabel="Delete shipment"
        onConfirm={remove}
      />
    </>
  );
}
