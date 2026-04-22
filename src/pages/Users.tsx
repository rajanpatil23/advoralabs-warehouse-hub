import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

const users = [
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

export default function Users() {
  return (
    <>
      <PageHeader
        title="Users & roles"
        description="Team members, roles, warehouse access and recent activity."
        actions={<Button size="sm" className="bg-gradient-primary text-primary-foreground"><Plus className="mr-1.5 h-4 w-4" /> Invite user</Button>}
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
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${roleClr[u.role]}`}>
                    {u.role}
                  </span>
                </TableCell>
                <TableCell><span className="font-mono text-xs">{u.warehouse}</span></TableCell>
                <TableCell><StatusBadge status={u.status} /></TableCell>
                <TableCell><span className="text-sm text-muted-foreground">{u.last}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
