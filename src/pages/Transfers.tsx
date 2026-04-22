import { PageHeader } from "@/components/PageHeader";
import { warehouses, products, productById, warehouseById } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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

export default function Transfers() {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(initialTransfers);

  return (
    <>
      <PageHeader
        title="Stock transfers"
        description="Move stock between warehouses and bins with full audit trail."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground"><Plus className="mr-1.5 h-4 w-4" /> New transfer</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create stock transfer</DialogTitle>
                <DialogDescription>Move stock between two warehouses.</DialogDescription>
              </DialogHeader>
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget as HTMLFormElement;
                  const fd = new FormData(form);
                  const newRow = {
                    id: `tr-${list.length + 1}`,
                    ref: `TRF-2026-${String(2000 + list.length)}`,
                    from: String(fd.get("from")),
                    to: String(fd.get("to")),
                    productId: String(fd.get("product")),
                    qty: Number(fd.get("qty") || 1),
                    status: "draft",
                    reason: String(fd.get("reason") || "Replenishment"),
                  };
                  setList([newRow, ...list]);
                  toast.success(`Transfer ${newRow.ref} created`);
                  setOpen(false);
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>From</Label>
                    <Select name="from" defaultValue={warehouses[0].id}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.code}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>To</Label>
                    <Select name="to" defaultValue={warehouses[1].id}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.code}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5"><Label>Product</Label>
                  <Select name="product" defaultValue={products[0].id}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{products.slice(0, 30).map((p) => <SelectItem key={p.id} value={p.id}>{p.sku} — {p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Quantity</Label><Input name="qty" type="number" min={1} defaultValue={20} required /></div>
                  <div className="space-y-1.5"><Label>Reason</Label>
                    <Select name="reason" defaultValue="Replenishment">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Replenishment","Rebalancing","Customer request","Damage isolation"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5"><Label>Notes (optional)</Label><Textarea rows={2} placeholder="Context for approver…" /></div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-gradient-primary text-primary-foreground">Create transfer</Button>
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
