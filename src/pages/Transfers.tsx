import { useState, type FormEvent } from "react";

import { PageHeader } from "@/components/PageHeader";
import { warehouses, products, productById, warehouseById } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { EntityActionMenu } from "@/components/EntityActionMenu";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const initialTransfers = Array.from({ length: 10 }).map((_, i) => {
  const from = warehouses[i % warehouses.length];
  const to = warehouses[(i + 1) % warehouses.length];
  const p = products[(i * 7) % products.length];
  return {
    id: `tr-${i + 1}`,
    ref: `TRF-2026-${String(2000 + i)}`,
    from: from.id, to: to.id, productId: p.id,
    qty: 20 + (i * 11) % 80,
    status: ["draft", "approved", "in-transit", "received", "received"][i % 5],
    reason: ["Replenishment", "Rebalancing", "Customer request", "Damage isolation"][i % 4],
  };
});

const statusMap: Record<string, string> = { "in-transit": "picking" };

type TransferRow = typeof initialTransfers[number];

type TransferForm = {
  from: string;
  to: string;
  productId: string;
  qty: string;
  reason: string;
  status: string;
  notes: string;
};

const defaultForm: TransferForm = {
  from: warehouses[0].id,
  to: warehouses[1].id,
  productId: products[0].id,
  qty: "20",
  reason: "Replenishment",
  status: "draft",
  notes: "",
};

export default function Transfers() {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(initialTransfers);
  const [editing, setEditing] = useState<TransferRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransferRow | null>(null);
  const [form, setForm] = useState<TransferForm>(defaultForm);

  const reset = () => {
    setEditing(null);
    setForm(defaultForm);
  };

  const openCreate = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (transfer: TransferRow) => {
    setEditing(transfer);
    setForm({
      from: transfer.from,
      to: transfer.to,
      productId: transfer.productId,
      qty: String(transfer.qty),
      reason: transfer.reason,
      status: transfer.status,
      notes: "",
    });
    setOpen(true);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: TransferRow = editing
      ? {
          ...editing,
          from: form.from,
          to: form.to,
          productId: form.productId,
          qty: Number(form.qty),
          reason: form.reason,
          status: form.status,
        }
      : {
          id: `tr-local-${Date.now()}`,
          ref: `TRF-2026-${String(2000 + list.length + 1)}`,
          from: form.from,
          to: form.to,
          productId: form.productId,
          qty: Number(form.qty),
          status: form.status,
          reason: form.reason,
        };

    setList((prev) => editing ? prev.map((item) => (item.id === editing.id ? payload : item)) : [payload, ...prev]);
    toast.success(editing ? `Updated ${payload.ref}` : `Transfer ${payload.ref} created`);
    setOpen(false);
    reset();
  };

  const remove = () => {
    if (!deleteTarget) return;
    setList((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    toast.success(`Deleted ${deleteTarget.ref}`);
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader
        title="Stock transfers"
        description="Move stock between warehouses and bins with full audit trail."
        actions={
          <Dialog open={open} onOpenChange={(state) => { setOpen(state); if (!state) reset(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" /> New transfer</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit stock transfer" : "Create stock transfer"}</DialogTitle>
                <DialogDescription>{editing ? "Update route, quantity, and approval reason." : "Move stock between two warehouses."}</DialogDescription>
              </DialogHeader>
              <form className="grid gap-3" onSubmit={submit}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>From</Label>
                    <Select value={form.from} onValueChange={(value) => setForm((prev) => ({ ...prev, from: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.code}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>To</Label>
                    <Select value={form.to} onValueChange={(value) => setForm((prev) => ({ ...prev, to: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.code}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5"><Label>Product</Label>
                  <Select value={form.productId} onValueChange={(value) => setForm((prev) => ({ ...prev, productId: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{products.slice(0, 30).map((p) => <SelectItem key={p.id} value={p.id}>{p.sku} — {p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Quantity</Label><Input type="number" min={1} value={form.qty} onChange={(e) => setForm((prev) => ({ ...prev, qty: e.target.value }))} required /></div>
                  <div className="space-y-1.5"><Label>Reason</Label>
                    <Select value={form.reason} onValueChange={(value) => setForm((prev) => ({ ...prev, reason: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Replenishment","Rebalancing","Customer request","Damage isolation"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Status</Label>
                    <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[
                          ["draft", "Draft"],
                          ["approved", "Approved"],
                          ["in-transit", "In transit"],
                          ["received", "Received"],
                        ].map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5"><Label>Notes (optional)</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Context for approver…" /></div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
                  <Button type="submit" className="bg-gradient-primary text-primary-foreground">{editing ? "Save transfer" : "Create transfer"}</Button>
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
              <TableHead>Product</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((t) => {
              const p = productById(t.productId);
              return (
                <TableRow key={t.id}>
                  <TableCell><span className="font-mono text-xs">{t.ref}</span></TableCell>
                  <TableCell>
                    <div className="text-sm font-medium truncate max-w-[220px]">{p?.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{p?.sku}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="rounded-md border border-border px-2 py-0.5 text-xs">{warehouseById(t.from)?.code}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="rounded-md border border-border px-2 py-0.5 text-xs">{warehouseById(t.to)?.code}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{t.qty}</TableCell>
                  <TableCell><span className="text-sm text-muted-foreground">{t.reason}</span></TableCell>
                  <TableCell><StatusBadge status={statusMap[t.status] || t.status} /></TableCell>
                  <TableCell>
                    <EntityActionMenu onEdit={() => openEdit(t)} onDelete={() => setDeleteTarget(t)} editLabel="Edit transfer" deleteLabel="Delete transfer" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(state) => !state && setDeleteTarget(null)}
        title="Delete transfer?"
        description={deleteTarget ? `This removes ${deleteTarget.ref} from the transfer board in this demo.` : ""}
        confirmLabel="Delete transfer"
        onConfirm={remove}
      />
    </>
  );
}
