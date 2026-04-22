import { useMemo, useState } from "react";
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

const stages: { key: string; label: string; icon: typeof Package }[] = [
  { key: "approved", label: "Approved", icon: CheckCircle2 },
  { key: "picking", label: "Picking", icon: Package },
  { key: "packed", label: "Packed", icon: Package },
  { key: "dispatched", label: "Dispatched", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];
const stageOrder: Record<string, number> = { new: 0, approved: 1, picking: 2, packed: 3, dispatched: 4, delivered: 5, cancelled: -1 };
const nextStatus: Record<string, string> = { new: "approved", approved: "picking", picking: "packed", packed: "dispatched", dispatched: "delivered" };

export default function Outbound() {
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [orders, setOrders] = useState(initialOrders);

  const sel = useMemo(() => orders.find((o) => o.id === open), [open, orders]);

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

  return (
    <>
      <PageHeader
        title="Outbound orders"
        description="Pick, pack, dispatch and track shipments to customers."
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground"><Plus className="mr-1.5 h-4 w-4" /> New order</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create outbound order</DialogTitle>
                <DialogDescription>Send goods to a customer.</DialogDescription>
              </DialogHeader>
              <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); toast.success("Order created"); setCreateOpen(false); }}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Customer</Label><Input required placeholder="Lyra Retail" /></div>
                  <div className="space-y-1.5"><Label>City</Label><Input required placeholder="Mumbai" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Warehouse</Label>
                    <Select defaultValue={warehouses[0].id}><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.code}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Priority</Label>
                    <Select defaultValue="normal"><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["low","normal","high","urgent"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5"><Label>Primary product</Label>
                  <Select defaultValue={products[0].id}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{products.slice(0, 30).map((p) => <SelectItem key={p.id} value={p.id}>{p.sku} — {p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-gradient-primary text-primary-foreground">Create order</Button>
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
                    <TableCell><Button size="sm" variant="ghost" onClick={() => setOpen(o.id)}><Eye className="h-4 w-4" /></Button></TableCell>
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
    </>
  );
}
