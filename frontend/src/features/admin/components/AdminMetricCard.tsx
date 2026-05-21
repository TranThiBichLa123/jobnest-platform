import { ReactNode } from "react";
import AdminSparkline from "@/features/admin/components/AdminSparkline";

type Props = {
  title: string;
  value: number | string;
  description?: string;
  icon: ReactNode;
  trend?: string;
  trendColor?: string;
  iconClassName?: string;
  sparklineClassName?: string;
  sparkline?: number[];
};

export default function AdminMetricCard({
  title,
  value,
  description,
  icon,
  trend = "+12.5%",
  trendColor = "text-emerald-600",
  iconClassName = "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
  sparklineClassName = "text-cyan-700 dark:text-cyan-300",
  sparkline = [2, 4, 3, 5, 8, 7, 9],
}: Props) {
  return (
    <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
      <div
        className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl mb-5 ${iconClassName}`}
      >
        {icon}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>

      <p className="mt-2 text-3xl font-extrabold text-gray-950 dark:text-white">
        {value}
      </p>

      <p className="mt-2 text-sm">
        <span className={`font-bold ${trendColor}`}>{trend}</span>{" "}
        <span className="text-gray-400">vs last period</span>
      </p>

      {description && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

      <AdminSparkline
        values={sparkline}
        className={`mt-5 h-14 w-full ${sparklineClassName}`}
      />
    </div>
  );
}