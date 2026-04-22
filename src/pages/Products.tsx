import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { products as initialProducts, categories, totalAvailable, formatCurrency, supplierById, type Product } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, Plus, Download, LayoutGrid, List, Package } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { exportCSV } from "@/lib/exportCSV";
import { EntityActionMenu } from "@/components/EntityActionMenu";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type ProductFormState = {
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  cost: string;
  price: string;
  reorderLevel: string;
  safetyStock: string;
  description: string;
};

const defaultForm: ProductFormState = {
  name: "",
  sku: "",
  barcode: "",
  category: categories[0]?.name ?? "",
  brand: "",
  cost: "0",
  price: "0",
  reorderLevel: "30",
  safetyStock: "15",
  description: "",
};

export default function Products() {
  const [items, setItems] = useState(initialProducts);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(defaultForm);

  useEffect(() => {
    if (!open) {
      setForm(defaultForm);
      setEditing(null);
    }
  }, [open]);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (status !== "all" && p.status !== status) return false;
      if (q && !(`${p.name} ${p.sku} ${p.barcode}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [items, q, cat, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      brand: product.brand,
      cost: String(product.cost),
      price: String(product.price),
      reorderLevel: String(product.reorderLevel),
      safetyStock: String(product.safetyStock),
      description: "",
    });
    setOpen(true);
  };

  const saveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: Product = editing
      ? {
          ...editing,
          name: form.name,
          sku: form.sku,
          barcode: form.barcode,
          category: form.category,
          brand: form.brand,
          cost: Number(form.cost),
          price: Number(form.price),
          reorderLevel: Number(form.reorderLevel),
          safetyStock: Number(form.safetyStock),
        }
      : {
          id: `prd-local-${Date.now()}`,
          sku: form.sku,
          name: form.name,
          barcode: form.barcode,
          category: form.category,
          brand: form.brand,
          unit: "pcs",
          weightKg: 0.5,
          price: Number(form.price),
          cost: Number(form.cost),
          reorderLevel: Number(form.reorderLevel),
          safetyStock: Number(form.safetyStock),
          supplierId: initialProducts[0]?.supplierId ?? "sup-1",
          status: "active",
          batchTracked: false,
          expiryTracked: false,
          stock: {},
        };

    setItems((prev) => editing ? prev.map((item) => (item.id === editing.id ? payload : item)) : [payload, ...prev]);
    toast.success(editing ? `Updated ${payload.sku}` : `Created ${payload.sku}`);
    setOpen(false);
  };

  const deleteProduct = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    toast.success(`Deleted ${deleteTarget.sku}`);
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader
        title="Products"
        description={`${items.length} SKUs across ${categories.length} categories`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const rows = filtered.map((p) => ({
                  sku: p.sku, name: p.name, category: p.category, brand: p.brand,
                  price: p.price, cost: p.cost, available: totalAvailable(p),
                  reorderLevel: p.reorderLevel, status: p.status,
                }));
                exportCSV("products", rows);
                toast.success(`Exported ${rows.length} products`);
              }}
            >
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={openCreate}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit product" : "Create new product"}</DialogTitle>
                  <DialogDescription>{editing ? "Update the product record and keep catalog data current." : "Add a SKU to your catalog. You can edit details later."}</DialogDescription>
                </DialogHeader>
                <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveProduct}>
                  <div className="space-y-1.5 sm:col-span-2"><Label>Product name</Label><Input required value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Apex Wireless Earbuds" /></div>
                  <div className="space-y-1.5"><Label>SKU</Label><Input required value={form.sku} onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))} placeholder="ELE-0123" /></div>
                  <div className="space-y-1.5"><Label>Barcode</Label><Input value={form.barcode} onChange={(e) => setForm((prev) => ({ ...prev, barcode: e.target.value }))} placeholder="8901234567890" /></div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Brand</Label><Input value={form.brand} onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))} placeholder="Nimbus" /></div>
                  <div className="space-y-1.5"><Label>Cost price</Label><Input required type="number" min="0" value={form.cost} onChange={(e) => setForm((prev) => ({ ...prev, cost: e.target.value }))} placeholder="0" /></div>
                  <div className="space-y-1.5"><Label>Selling price</Label><Input required type="number" min="0" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="0" /></div>
                  <div className="space-y-1.5"><Label>Reorder level</Label><Input type="number" min="0" value={form.reorderLevel} onChange={(e) => setForm((prev) => ({ ...prev, reorderLevel: e.target.value }))} /></div>
                  <div className="space-y-1.5"><Label>Safety stock</Label><Input type="number" min="0" value={form.safetyStock} onChange={(e) => setForm((prev) => ({ ...prev, safetyStock: e.target.value }))} /></div>
                  <div className="space-y-1.5 sm:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Short description…" /></div>
                  <DialogFooter className="sm:col-span-2">
                    <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-gradient-primary text-primary-foreground">{editing ? "Save changes" : "Create product"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="surface-card p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search by name, SKU or barcode…" className="pl-9" />
          </div>
          <Select value={cat} onValueChange={(v) => { setCat(v); setPage(1); }}>
            <SelectTrigger className="sm:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1 rounded-md border border-border p-0.5">
            <Button size="icon" variant={view === "list" ? "secondary" : "ghost"} className="h-8 w-8" onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
            <Button size="icon" variant={view === "grid" ? "secondary" : "ghost"} className="h-8 w-8" onClick={() => setView("grid")}><LayoutGrid className="h-4 w-4" /></Button>
          </div>
        </div>

        {view === "list" ? (
          <div className="mt-3 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((p) => {
                  const stock = totalAvailable(p);
                  const low = stock < p.reorderLevel;
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            <Package className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate max-w-[260px]">{p.name}</div>
                            <div className="text-[11px] text-muted-foreground">{p.brand} · {p.unit}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><span className="font-mono text-xs">{p.sku}</span></TableCell>
                      <TableCell><span className="text-sm">{p.category}</span></TableCell>
                      <TableCell><span className="text-sm text-muted-foreground">{supplierById(p.supplierId)?.name}</span></TableCell>
                      <TableCell className="text-right">
                        <span className={low ? "text-warning font-medium" : ""}>{stock}</span>
                        {low && <div className="text-[10px] text-warning">below reorder</div>}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(p.price)}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                       <TableCell>
                         <EntityActionMenu onEdit={() => openEdit(p)} onDelete={() => setDeleteTarget(p)} editLabel="Edit product" deleteLabel="Delete product" />
                       </TableCell>
                    </TableRow>
                  );
                })}
                {paged.length === 0 && (
                   <TableRow><TableCell colSpan={8} className="text-center py-12 text-sm text-muted-foreground">No products match your filters</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paged.map((p) => {
              const stock = totalAvailable(p);
              return (
                <div key={p.id} className="rounded-lg border border-border bg-surface-elevated/40 p-4 transition hover:shadow-elevated">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Package className="h-5 w-5" /></div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="mt-3 font-medium truncate">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{p.sku}</div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{p.category}</span>
                    <span className="font-semibold">{formatCurrency(p.price)}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{stock} in stock</div>
                    <div className="mt-3 flex justify-end">
                      <EntityActionMenu onEdit={() => openEdit(p)} onDelete={() => setDeleteTarget(p)} editLabel="Edit product" deleteLabel="Delete product" />
                    </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div>Showing {paged.length} of {filtered.length}</div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span>Page {page} / {pageCount}</span>
            <Button size="sm" variant="outline" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(state) => !state && setDeleteTarget(null)}
        title="Delete product?"
        description={deleteTarget ? `This will remove ${deleteTarget.name} from the catalog list in this demo workspace.` : ""}
        confirmLabel="Delete product"
        onConfirm={deleteProduct}
      />
    </>
  );
}
