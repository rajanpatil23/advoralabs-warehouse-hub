import { PageHeader } from "@/components/PageHeader";
import { suppliers } from "@/data/mock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Star, Download } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportCSV } from "@/lib/exportCSV";
import { toast } from "sonner";

export default function Suppliers() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Suppliers"
        description="Manage vendors, performance and purchase relationships."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => { exportCSV("suppliers", suppliers); toast.success("Suppliers exported"); }}>
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-primary text-primary-foreground"><Plus className="mr-1.5 h-4 w-4" /> Add supplier</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add supplier</DialogTitle>
                  <DialogDescription>Create a new supplier record.</DialogDescription>
                </DialogHeader>
                <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); toast.success("Supplier created"); setOpen(false); }}>
                  <div className="space-y-1.5 sm:col-span-2"><Label>Company name</Label><Input required placeholder="Northwind Traders" /></div>
                  <div className="space-y-1.5"><Label>Contact name</Label><Input required placeholder="Aarav Mehta" /></div>
                  <div className="space-y-1.5"><Label>Email</Label><Input type="email" required placeholder="contact@supplier.com" /></div>
                  <div className="space-y-1.5"><Label>Phone</Label><Input placeholder="+91 90000 00000" /></div>
                  <div className="space-y-1.5"><Label>Country</Label>
                    <Select defaultValue="IN"><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["IN","AE","SG","US","DE","CN"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter className="sm:col-span-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-gradient-primary text-primary-foreground">Create supplier</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        }
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
