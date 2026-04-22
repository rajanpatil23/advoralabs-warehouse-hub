import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: ReactNode;
  hint?: string;
  delta?: number; // percentage
  icon?: LucideIcon;
  accent?: "primary" | "success" | "warning" | "destructive" | "info";
  className?: string;
};

const accentMap = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
};

export function StatCard({ label, value, hint, delta, icon: Icon, accent = "primary", className }: Props) {
  return (
    <div className={cn("surface-card p-5 transition hover:shadow-elevated", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        {Icon && (
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", accentMap[accent])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium",
              delta >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}
          >
            {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
