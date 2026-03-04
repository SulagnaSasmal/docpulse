"use client";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  color?: "indigo" | "emerald" | "amber" | "red" | "slate";
}

const colorMap = {
  indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
  emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  slate: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
};

export function MetricCard({ label, value, subtitle, trend, color = "indigo" }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </span>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorMap[color]}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
