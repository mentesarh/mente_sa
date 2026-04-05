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
    changeType === "positive" ? TrendingUp :
    changeType === "negative" ? TrendingDown : Minus;

  const changePill = {
    positive: { bg: "rgba(16,185,129,0.08)", color: "#059669", border: "rgba(16,185,129,0.18)" },
    negative: { bg: "rgba(239,68,68,0.08)",  color: "#dc2626", border: "rgba(239,68,68,0.18)" },
    neutral:  { bg: "rgba(100,116,139,0.08)", color: "#64748b", border: "rgba(100,116,139,0.14)" },
  }[changeType];

  return (
    <div
      className={cn("group relative overflow-hidden rounded-2xl transition-all duration-200", className)}
      style={{
        background: "white",
        border: "1px solid hsl(220,14%,91%)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px -4px rgba(0,0,0,0.06)",
        padding: "22px 22px 20px",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 2px 8px rgba(0,0,0,0.06), 0 8px 28px -8px rgba(0,0,0,0.10)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px -4px rgba(0,0,0,0.06)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Subtle top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(90deg, hsl(172,68%,36%), hsl(158,58%,42%))" }}
      />

      {/* Header row */}
      <div className="flex items-start justify-between mb-5">
        <p
          className="font-medium leading-snug"
          style={{ fontSize: 12.5, color: "hsl(220,12%,54%)" }}
        >
          {title}
        </p>

        {/* Icon box */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{
            background: "linear-gradient(135deg, hsl(172,68%,36%/0.10), hsl(158,58%,38%/0.07))",
          }}
        >
          <Icon
            style={{ width: 17, height: 17, color: "hsl(172,68%,33%)" }}
          />
        </div>
      </div>

      {/* Value */}
      <p
        className="font-bold tracking-tight mb-3"
        style={{ fontSize: 30, lineHeight: 1, color: "hsl(220,30%,12%)" }}
      >
        {value}
      </p>

      {/* Change pill */}
      {change && (
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{
            background: changePill.bg,
            border: `1px solid ${changePill.border}`,
          }}
        >
          <ChangeIcon style={{ width: 11, height: 11, color: changePill.color }} />
          <span
            className="font-semibold"
            style={{ fontSize: 11, color: changePill.color }}
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
