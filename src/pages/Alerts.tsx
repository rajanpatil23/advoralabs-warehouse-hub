import { PageHeader } from "@/components/PageHeader";
import { alerts as initialAlerts } from "@/data/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

export default function Alerts() {
  const [alerts, setAlerts] = useState(initialAlerts);

  const markAll = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    toast.success("All alerts marked as read");
  };
  const markOne = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <>
      <PageHeader
        title="Alerts"
        description={`${unreadCount} unread · ${alerts.length} total`}
        actions={
          <Button size="sm" variant="outline" onClick={markAll} disabled={unreadCount === 0}>
            <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all as read
          </Button>
        }
      />

      <div className="surface-card divide-y divide-border">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`flex items-start gap-4 p-4 transition-colors ${a.read ? "opacity-60" : "hover:bg-muted/30"}`}
          >
            <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-md ${
              a.severity === "critical" ? "bg-destructive/15 text-destructive" :
              a.severity === "warning" ? "bg-warning/15 text-warning" : "bg-info/15 text-info"
            }`}>
              <Bell className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="font-medium">{a.title}</div>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(a.ts), { addSuffix: true })}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">{a.detail}</div>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge status={a.severity} />
                <span className="text-[11px] text-muted-foreground">· {a.module}</span>
              </div>
            </div>
            {!a.read && (
              <Button size="sm" variant="ghost" onClick={() => markOne(a.id)} aria-label="Mark as read">
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
