import { useState, type FormEvent } from "react";

import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { EntityActionMenu } from "@/components/EntityActionMenu";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const initialUsers = [
  { name: "Aarav Mehta", email: "aarav@connecttly.io", role: "Admin", warehouse: "All", status: "active", last: "2m ago" },
  { name: "Priya Sharma", email: "priya@connecttly.io", role: "Warehouse Manager", warehouse: "MUM-01", status: "active", last: "12m ago" },
  { name: "Rohan Iyer", email: "rohan@connecttly.io", role: "Inventory Staff", warehouse: "BLR-02", status: "active", last: "1h ago" },
  { name: "Neha Kapoor", email: "neha@connecttly.io", role: "Dispatch Operator", warehouse: "DEL-03", status: "active", last: "3h ago" },
  { name: "Vikram Rao", email: "vikram@connecttly.io", role: "Viewer", warehouse: "DXB-04", status: "inactive", last: "2d ago" },
  { name: "Sara Khan", email: "sara@connecttly.io", role: "Inventory Staff", warehouse: "MUM-01", status: "active", last: "5h ago" },
];

const roleClr: Record<string, string> = {
  Admin: "bg-primary/15 text-primary border-primary/30",
  "Warehouse Manager": "bg-info/15 text-info border-info/30",
  "Inventory Staff": "bg-success/15 text-success border-success/30",
  "Dispatch Operator": "bg-warning/15 text-warning border-warning/30",
  Viewer: "bg-muted text-muted-foreground border-border",
};

const ROLES = ["Admin", "Warehouse Manager", "Inventory Staff", "Dispatch Operator", "Viewer"];
const WHS = ["All", "MUM-01", "BLR-02", "DEL-03", "DXB-04"];

type UserRow = typeof initialUsers[number];

type UserForm = {
  name: string;
  email: string;
  role: string;
  warehouse: string;
  status: string;
};

const defaultForm: UserForm = {
  name: "",
  email: "",
  role: "Inventory Staff",
  warehouse: "All",
  status: "active",
};

export default function Users() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState(initialUsers);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [form, setForm] = useState<UserForm>(defaultForm);

  const reset = () => {
    setEditing(null);
    setForm(defaultForm);
  };

  const openCreate = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (user: UserRow) => {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      warehouse: user.warehouse,
      status: user.status,
    });
    setOpen(true);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: UserRow = {
      name: form.name,
      email: form.email,
      role: form.role,
      warehouse: form.warehouse,
      status: form.status,
      last: editing?.last ?? "just now",
    };

    setUsers((prev) => editing ? prev.map((user) => (user.email === editing.email ? payload : user)) : [payload, ...prev]);
    toast.success(editing ? `Updated ${payload.email}` : `Invited ${payload.email}`);
    setOpen(false);
    reset();
  };

  const remove = () => {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((user) => user.email !== deleteTarget.email));
    toast.success(`Removed ${deleteTarget.email}`);
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader
        title="Users & roles"
        description="Team members, roles, warehouse access and recent activity."
        actions={
          <Dialog open={open} onOpenChange={(state) => { setOpen(state); if (!state) reset(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" /> Invite user</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit team member" : "Invite team member"}</DialogTitle>
                <DialogDescription>{editing ? "Update role, warehouse scope, or access state." : "They'll receive an email invitation to join your workspace."}</DialogDescription>
              </DialogHeader>
              <form className="grid gap-3" onSubmit={submit}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Full name</Label><Input required value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Asha Patel" /></div>
                  <div className="space-y-1.5"><Label>Email</Label><Input required type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="asha@connecttly.io" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Role</Label>
                    <Select value={form.role} onValueChange={(value) => setForm((prev) => ({ ...prev, role: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Warehouse access</Label>
                    <Select value={form.warehouse} onValueChange={(value) => setForm((prev) => ({ ...prev, warehouse: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{WHS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
                  <Button type="submit" className="bg-gradient-primary text-primary-foreground">{editing ? "Save user" : "Send invite"}</Button>
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
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Warehouse access</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.email}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary text-xs font-semibold text-primary-foreground">
                      {u.name.split(" ").map((p) => p[0]).join("")}
                    </div>
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-[11px] text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${roleClr[u.role] || "bg-muted text-muted-foreground border-border"}`}>
                    {u.role}
                  </span>
                </TableCell>
                <TableCell><span className="font-mono text-xs">{u.warehouse}</span></TableCell>
                <TableCell><StatusBadge status={u.status} /></TableCell>
                <TableCell><span className="text-sm text-muted-foreground">{u.last}</span></TableCell>
                <TableCell>
                  <EntityActionMenu onEdit={() => openEdit(u)} onDelete={() => setDeleteTarget(u)} editLabel="Edit user" deleteLabel="Delete user" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(state) => !state && setDeleteTarget(null)}
        title="Delete user?"
        description={deleteTarget ? `This removes ${deleteTarget.name} from the team list in this demo workspace.` : ""}
        confirmLabel="Delete user"
        onConfirm={remove}
      />
    </>
  );
}
