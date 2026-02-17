import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  variant?: "default" | "primary" | "warning" | "destructive" | "success";
}

const variantStyles = {
  default: "bg-card border-border",
  primary: "bg-primary/5 border-primary/20",
  warning: "bg-warning/5 border-warning/20",
  destructive: "bg-destructive/5 border-destructive/20",
  success: "bg-success/5 border-success/20",
};

const iconStyles = {
  default: "text-muted-foreground bg-muted",
  primary: "text-primary bg-primary/10",
  warning: "text-warning bg-warning/10",
  destructive: "text-destructive bg-destructive/10",
  success: "text-success bg-success/10",
};

export default function StatCard({ title, value, icon: Icon, trend, trendUp, variant = "default" }: StatCardProps) {
  return (
    <div className={cn("rounded-xl p-5 border transition-all hover:shadow-md", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-display font-bold text-card-foreground mt-1">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn("text-xs font-semibold", trendUp ? "text-success" : "text-destructive")}>
                {trend}
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
