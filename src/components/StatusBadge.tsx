import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  // common
  active: "bg-success/15 text-success border-success/30",
  inactive: "bg-muted text-muted-foreground border-border",
  draft: "bg-muted text-muted-foreground border-border",
  archived: "bg-muted text-muted-foreground border-border",
  // inbound
  expected: "bg-info/15 text-info border-info/30",
  partial: "bg-warning/15 text-warning border-warning/30",
  received: "bg-success/15 text-success border-success/30",
  closed: "bg-muted text-muted-foreground border-border",
  // outbound
  new: "bg-info/15 text-info border-info/30",
  approved: "bg-info/15 text-info border-info/30",
  picking: "bg-warning/15 text-warning border-warning/30",
  packed: "bg-primary/15 text-primary border-primary/30",
  dispatched: "bg-primary/15 text-primary border-primary/30",
  delivered: "bg-success/15 text-success border-success/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  // priority
  low: "bg-muted text-muted-foreground border-border",
  normal: "bg-info/15 text-info border-info/30",
  high: "bg-warning/15 text-warning border-warning/30",
  urgent: "bg-destructive/15 text-destructive border-destructive/30",
  // alerts
  info: "bg-info/15 text-info border-info/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  critical: "bg-destructive/15 text-destructive border-destructive/30",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const cls = map[status] || "bg-muted text-muted-foreground border-border";
  return (
    <Badge
      variant="outline"
      className={cn("rounded-md font-medium capitalize border", cls, className)}
    >
      {status}
    </Badge>
  );
}
