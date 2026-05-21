type Item = {
  label: string;
  value: number;
  className: string;
};

type Props = {
  title: string;
  items: Item[];
};

export default function AdminDonutChart({ title, items }: Props) {
  const total = Math.max(
    items.reduce((sum, item) => sum + item.value, 0),
    1
  );

  let offset = 25;

  return (
    <section className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
      <h2 className="text-xl font-extrabold text-gray-950 dark:text-white mb-6">
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="relative mx-auto h-48 w-48">
          <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
            <circle
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="7"
              className="text-gray-100 dark:text-gray-800"
            />

            {items.map((item) => {
              const percent = (item.value / total) * 100;
              const dash = `${percent} ${100 - percent}`;
              const currentOffset = offset;
              offset -= percent;

              return (
                <circle
                  key={item.label}
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeDasharray={dash}
                  strokeDashoffset={currentOffset}
                  className={item.className}
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-extrabold text-gray-950 dark:text-white">
              {total}
            </p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${item.className}`} />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
              </div>

              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}