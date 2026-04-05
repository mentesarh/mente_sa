import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  className?: string;
}

const StatCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  className,
}: StatCardProps) => {
  const ChangeIcon =
    changeType === "positive"
      ? TrendingUp
      : changeType === "negative"
      ? TrendingDown
      : Minus;

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border p-5 transition-all duration-200 card-hover group",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="w-9 h-9 rounded-lg bg-gradient-primary-soft flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
          <Icon className="w-4.5 h-4.5 text-primary" style={{ width: 18, height: 18 }} />
        </div>
      </div>

      <p className="text-2xl font-bold text-foreground tracking-tight mb-2">
        {value}
      </p>

      {change && (
        <div
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
            changeType === "positive" &&
              "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
            changeType === "negative" &&
              "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
            changeType === "neutral" &&
              "bg-secondary text-muted-foreground"
          )}
        >
          <ChangeIcon className="w-3 h-3" />
          {change}
        </div>
      )}
    </div>
  );
};

export default StatCard;
