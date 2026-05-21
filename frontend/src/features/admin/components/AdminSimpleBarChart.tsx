type ChartItem = {
  label: string;
  value: number;
};

type Props = {
  title: string;
  description?: string;
  data: ChartItem[];
};

export default function AdminSimpleBarChart({
  title,
  description,
  data,
}: Props) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <section className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

      <div className="mt-6 space-y-4">
        {data.map((item) => {
          const width = `${Math.max((item.value / max) * 100, item.value > 0 ? 8 : 2)}%`;

          return (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {item.value}
                </span>
              </div>

              <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-700 dark:bg-cyan-400 transition-all"
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}