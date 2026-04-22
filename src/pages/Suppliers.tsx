import { useState, type FormEvent } from "react";

import { PageHeader } from "@/components/PageHeader";
import { suppliers as initialSuppliers, type Supplier } from "@/data/mock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Star, Download } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportCSV } from "@/lib/exportCSV";
import { toast } from "sonner";
import { EntityActionMenu } from "@/components/EntityActionMenu";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type SupplierForm = {
  name: string;
  contact: string;
  email: string;
  phone: string;
  country: string;
  status: Supplier["status"];
};

const defaultForm: SupplierForm = {
  name: "",
  contact: "",
  email: "",
  phone: "",
  country: "IN",
  status: "active",
};

export default function Suppliers() {
  const [supplierList, setSupplierList] = useState(initialSuppliers);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierForm>(defaultForm);

  const reset = () => {
    setForm(defaultForm);
    setEditing(null);
  };

  const openCreate = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone,
      country: supplier.country,
      status: supplier.status,
    });
    setOpen(true);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: Supplier = editing
      ? { ...editing, ...form }
      : {
          id: `sup-local-${Date.now()}`,
          ...form,
          rating: 4.6,
          orders: 0,
        };

    setSupplierList((prev) => editing ? prev.map((item) => (item.id === editing.id ? payload : item)) : [payload, ...prev]);
    toast.success(editing ? `Updated ${payload.name}` : `Created ${payload.name}`);
    setOpen(false);
    reset();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setSupplierList((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    toast.success(`Deleted ${deleteTarget.name}`);
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader
        title="Suppliers"
        description="Manage vendors, performance and purchase relationships."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => { exportCSV("suppliers", supplierList); toast.success("Suppliers exported"); }}>
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
            <Dialog open={open} onOpenChange={(state) => { setOpen(state); if (!state) reset(); }}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" /> Add supplier</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit supplier" : "Add supplier"}</DialogTitle>
                  <DialogDescription>{editing ? "Update vendor information, region, and current status." : "Create a new supplier record."}</DialogDescription>
                </DialogHeader>
                <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit}>
                  <div className="space-y-1.5 sm:col-span-2"><Label>Company name</Label><Input required value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Northwind Traders" /></div>
                  <div className="space-y-1.5"><Label>Contact name</Label><Input required value={form.contact} onChange={(e) => setForm((prev) => ({ ...prev, contact: e.target.value }))} placeholder="Aarav Mehta" /></div>
                  <div className="space-y-1.5"><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="contact@supplier.com" /></div>
                  <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="+91 90000 00000" /></div>
                  <div className="space-y-1.5"><Label>Country</Label>
                    <Select value={form.country} onValueChange={(value) => setForm((prev) => ({ ...prev, country: value }))}><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["IN", "AE", "SG", "US", "DE", "CN"].map((country) => <SelectItem key={country} value={country}>{country}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Status</Label>
                    <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as Supplier["status"] }))}><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter className="sm:col-span-2">
                    <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
                    <Button type="submit" className="bg-gradient-primary text-primary-foreground">{editing ? "Save supplier" : "Create supplier"}</Button>
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
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {supplierList.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>
                  <div className="font-medium">{supplier.name}</div>
                  <div className="text-[11px] text-muted-foreground">{supplier.email}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{supplier.contact}</div>
                  <div className="text-[11px] text-muted-foreground">{supplier.phone}</div>
                </TableCell>
                <TableCell><span className="text-sm text-muted-foreground">{supplier.country}</span></TableCell>
                <TableCell className="text-right">{supplier.orders}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    <span className="text-sm">{supplier.rating.toFixed(1)}</span>
                  </div>
                </TableCell>
                <TableCell><StatusBadge status={supplier.status} /></TableCell>
                <TableCell>
                  <EntityActionMenu onEdit={() => openEdit(supplier)} onDelete={() => setDeleteTarget(supplier)} editLabel="Edit supplier" deleteLabel="Delete supplier" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(state) => !state && setDeleteTarget(null)}
        title="Delete supplier?"
        description={deleteTarget ? `This removes ${deleteTarget.name} from the supplier list in this demo workspace.` : ""}
        confirmLabel="Delete supplier"
        onConfirm={handleDelete}
      />
    </>
  );
}
