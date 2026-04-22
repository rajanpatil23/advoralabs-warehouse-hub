import { useMemo, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/PageHeader";
import { outboundOrders as initialOrders, warehouseById, productById, formatCurrency, warehouses, products } from "@/data/mock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, MapPin, Package, Truck, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { EntityActionMenu } from "@/components/EntityActionMenu";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const stages: { key: string; label: string; icon: typeof Package }[] = [
  { key: "approved", label: "Approved", icon: CheckCircle2 },
  { key: "picking", label: "Picking", icon: Package },
  { key: "packed", label: "Packed", icon: Package },
  { key: "dispatched", label: "Dispatched", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];
const stageOrder: Record<string, number> = { new: 0, approved: 1, picking: 2, packed: 3, dispatched: 4, delivered: 5, cancelled: -1 };
const nextStatus: Record<string, string> = { new: "approved", approved: "picking", picking: "packed", packed: "dispatched", dispatched: "delivered" };

type OrderRow = typeof initialOrders[number];

type OrderForm = {
  customer: string;
  city: string;
  warehouseId: string;
  priority: OrderRow["priority"];
  productId: string;
  status: OrderRow["status"];
};

const defaultForm: OrderForm = {
  customer: "",
  city: "",
  warehouseId: warehouses[0].id,
  priority: "normal",
  productId: products[0].id,
  status: "new",
};

export default function Outbound() {
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [orders, setOrders] = useState(initialOrders);
  const [editing, setEditing] = useState<OrderRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrderRow | null>(null);
  const [form, setForm] = useState<OrderForm>(defaultForm);

  const sel = useMemo(() => orders.find((o) => o.id === open), [open, orders]);
  const selectedProduct = useMemo(() => products.find((product) => product.id === form.productId) ?? products[0], [form.productId]);

  const filtered = orders.filter((o) => {
    if (tab === "all") return true;
    if (tab === "open") return ["new", "approved", "picking", "packed"].includes(o.status);
    if (tab === "shipped") return ["dispatched", "delivered"].includes(o.status);
    return o.status === tab;
  });

  const advance = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next = nextStatus[o.status];
        if (!next) {
          toast.info("Order is already delivered");
          return o;
        }
        toast.success(`Order ${o.ref} → ${next}`);
        return { ...o, status: next as typeof o.status };
      })
    );
  };

  const reset = () => {
    setEditing(null);
    setForm(defaultForm);
  };

  const openCreate = () => {
    reset();
    setCreateOpen(true);
  };

  const openEdit = (order: OrderRow) => {
    setEditing(order);
    setForm({
      customer: order.customer,
      city: order.city,
      warehouseId: order.warehouseId,
      priority: order.priority,
      productId: order.items[0]?.productId ?? products[0].id,
      status: order.status,
    });
    setCreateOpen(true);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const item = editing?.items[0]
      ? { ...editing.items[0], productId: form.productId }
      : { productId: form.productId, qty: 1, picked: 0 };
    const payload: OrderRow = editing
      ? {
          ...editing,
          customer: form.customer,
          city: form.city,
          warehouseId: form.warehouseId,
          priority: form.priority,
          status: form.status,
          items: [item, ...editing.items.slice(1)],
          total: selectedProduct.price * item.qty,
        }
      : {
          id: `out-local-${Date.now()}`,
          ref: `SO-2026-${String(5000 + orders.length + 1)}`,
          customer: form.customer,
          city: form.city,
          warehouseId: form.warehouseId,
          date: new Date().toISOString(),
          status: form.status,
          priority: form.priority,
          items: [item],
          total: selectedProduct.price * item.qty,
        };

    setOrders((prev) => editing ? prev.map((order) => (order.id === editing.id ? payload : order)) : [payload, ...prev]);
    toast.success(editing ? `Updated ${payload.ref}` : `Created ${payload.ref}`);
    setCreateOpen(false);
    reset();
  };

  const remove = () => {
    if (!deleteTarget) return;
    setOrders((prev) => prev.filter((order) => order.id !== deleteTarget.id));
    if (open === deleteTarget.id) setOpen(null);
    toast.success(`Deleted ${deleteTarget.ref}`);
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader
        title="Outbound orders"
        description="Pick, pack, dispatch and track shipments to customers."
        actions={
          <Dialog open={createOpen} onOpenChange={(state) => { setCreateOpen(state); if (!state) reset(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" /> New order</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit outbound order" : "Create outbound order"}</DialogTitle>
                <DialogDescription>{editing ? "Update customer, routing, and fulfillment state." : "Send goods to a customer."}</DialogDescription>
              </DialogHeader>
              <form className="grid gap-3" onSubmit={submit}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Customer</Label><Input required value={form.customer} onChange={(e) => setForm((prev) => ({ ...prev, customer: e.target.value }))} placeholder="Lyra Retail" /></div>
                  <div className="space-y-1.5"><Label>City</Label><Input required value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} placeholder="Mumbai" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Warehouse</Label>
                    <Select value={form.warehouseId} onValueChange={(value) => setForm((prev) => ({ ...prev, warehouseId: value }))}><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.code}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(value) => setForm((prev) => ({ ...prev, priority: value as OrderRow["priority"] }))}><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["low","normal","high","urgent"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5"><Label>Primary product</Label>
                  <Select value={form.productId} onValueChange={(value) => setForm((prev) => ({ ...prev, productId: value }))}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{products.slice(0, 30).map((p) => <SelectItem key={p.id} value={p.id}>{p.sku} — {p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as OrderRow["status"] }))}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["new", "approved", "picking", "packed", "dispatched", "delivered", "cancelled"] as OrderRow["status"][]).map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => { setCreateOpen(false); reset(); }}>Cancel</Button>
                  <Button type="submit" className="bg-gradient-primary text-primary-foreground">{editing ? "Save order" : "Create order"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="picking">Picking</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <div className="surface-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell><span className="font-mono text-xs">{o.ref}</span></TableCell>
                    <TableCell>
                      <div className="font-medium">{o.customer}</div>
                      <div className="text-[11px] text-muted-foreground">{o.city}</div>
                    </TableCell>
                    <TableCell><span className="text-sm text-muted-foreground">{warehouseById(o.warehouseId)?.code}</span></TableCell>
                    <TableCell><span className="text-sm">{format(new Date(o.date), "dd MMM")}</span></TableCell>
                    <TableCell className="text-right">{o.items.length}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(o.total)}</TableCell>
                    <TableCell><StatusBadge status={o.priority} /></TableCell>
                    <TableCell><StatusBadge status={o.status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setOpen(o.id)}><Eye className="h-4 w-4" /></Button>
                        <EntityActionMenu onEdit={() => openEdit(o)} onDelete={() => setDeleteTarget(o)} editLabel="Edit order" deleteLabel="Delete order" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center py-12 text-sm text-muted-foreground">No orders in this view</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {sel && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{sel.ref}</SheetTitle>
                <SheetDescription>{sel.customer} · {sel.city}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                <div><div className="text-xs text-muted-foreground">Status</div><StatusBadge status={sel.status} /></div>
                <div><div className="text-xs text-muted-foreground">Priority</div><StatusBadge status={sel.priority} /></div>
                <div><div className="text-xs text-muted-foreground">Total</div><div className="font-semibold">{formatCurrency(sel.total)}</div></div>
              </div>

              <div className="mt-6">
                <div className="text-sm font-medium mb-3">Fulfillment timeline</div>
                <div className="relative">
                  <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />
                  <div className="space-y-3">
                    {stages.map((st) => {
                      const reached = stageOrder[sel.status] >= stageOrder[st.key];
                      const cancelled = sel.status === "cancelled";
                      return (
                        <div key={st.key} className="relative flex items-center gap-3 pl-1">
                          <div className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${
                            cancelled ? "bg-muted text-muted-foreground" : reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            <st.icon className="h-3 w-3" />
                          </div>
                          <div className={`text-sm ${reached && !cancelled ? "" : "text-muted-foreground"}`}>{st.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm font-medium mb-2">Order items</div>
                <div className="rounded-lg border border-border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Ordered</TableHead>
                        <TableHead className="text-right">Picked</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sel.items.map((it, i) => {
                        const p = productById(it.productId);
                        return (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="text-sm font-medium truncate max-w-[200px]">{p?.name}</div>
                              <div className="text-[11px] font-mono text-muted-foreground">{p?.sku}</div>
                            </TableCell>
                            <TableCell className="text-right">{it.qty}</TableCell>
                            <TableCell className="text-right font-medium">{it.picked}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => window.print()}>Print delivery note</Button>
                <Button className="flex-1 bg-gradient-primary text-primary-foreground" onClick={() => advance(sel.id)}>
                  Advance status
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(state) => !state && setDeleteTarget(null)}
        title="Delete outbound order?"
        description={deleteTarget ? `This removes ${deleteTarget.ref} from the outbound queue in this demo.` : ""}
        confirmLabel="Delete order"
        onConfirm={remove}
      />
    </>
  );
}
