import { PageHeader } from "@/components/PageHeader";
import { suppliers } from "@/data/mock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Star } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export default function Suppliers() {
  return (
    <>
      <PageHeader
        title="Suppliers"
        description="Manage vendors, performance and purchase relationships."
        actions={<Button size="sm" className="bg-gradient-primary text-primary-foreground"><Plus className="mr-1.5 h-4 w-4" /> Add supplier</Button>}
      />
      <div className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Supplier</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground">{s.email}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{s.contact}</div>
                  <div className="text-[11px] text-muted-foreground">{s.phone}</div>
                </TableCell>
                <TableCell><span className="text-sm text-muted-foreground">{s.country}</span></TableCell>
                <TableCell className="text-right">{s.orders}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    <span className="text-sm">{s.rating.toFixed(1)}</span>
                  </div>
                </TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
