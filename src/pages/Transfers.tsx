import { PageHeader } from "@/components/PageHeader";
import { warehouses, products, productById, warehouseById } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";

const transfers = Array.from({ length: 10 }).map((_, i) => {
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
  return (
    <>
      <PageHeader
        title="Stock transfers"
        description="Move stock between warehouses and bins with full audit trail."
        actions={<Button size="sm" className="bg-gradient-primary text-primary-foreground"><Plus className="mr-1.5 h-4 w-4" /> New transfer</Button>}
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
            {transfers.map((t) => {
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
