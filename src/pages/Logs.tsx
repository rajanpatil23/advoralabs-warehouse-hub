import { PageHeader } from "@/components/PageHeader";
import { activities } from "@/data/mock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function Logs() {
  return (
    <>
      <PageHeader title="Activity logs" description="Every action across modules — fully searchable audit trail." />
      <div className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((a) => (
              <TableRow key={a.id}>
                <TableCell><span className="text-xs text-muted-foreground">{format(new Date(a.ts), "dd MMM, HH:mm")}</span></TableCell>
                <TableCell><span className="font-medium text-sm">{a.user}</span></TableCell>
                <TableCell><span className="text-sm">{a.module}</span></TableCell>
                <TableCell><span className="text-sm text-muted-foreground">{a.action}</span></TableCell>
                <TableCell><span className="font-mono text-xs">{a.detail}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
