import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { inboundShipments, supplierById, warehouseById, productById } from "@/data/mock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { format } from "date-fns";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

export default function Inbound() {
  const [open, setOpen] = useState<string | null>(null);
  const sel = inboundShipments.find((s) => s.id === open);

  return (
    <>
      <PageHeader
        title="Inbound shipments"
        description="Receive stock, capture damages and close out POs."
        actions={<Button size="sm" className="bg-gradient-primary text-primary-foreground"><Plus className="mr-1.5 h-4 w-4" /> New shipment</Button>}
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
            {inboundShipments.map((s) => {
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
                    <Button size="sm" variant="ghost" onClick={() => setOpen(s.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
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
                <Button variant="outline" className="flex-1">Print GRN</Button>
                <Button className="flex-1 bg-gradient-primary text-primary-foreground">Receive stock</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
