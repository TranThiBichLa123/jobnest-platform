type Props = {
  title: string;
  description?: string;
  values: number[];
  label: string;
};

export default function AdminAreaChart({
  title,
  description,
  values,
  label,
}: Props) {
  const width = 720;
  const height = 260;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);

  const points = values.map((value, index) => {
    const x = 40 + (index / Math.max(values.length - 1, 1)) * (width - 80);
    const y = height - 40 - ((value - min) / range) * (height - 80);
    return { x, y };
  });

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const area = `${line} L ${width - 40} ${height - 40} L 40 ${height - 40} Z`;

  return (
    <section className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
      <div className="flex justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-950 dark:text-white">
            {title}
          </h2>

          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>

        <span className="h-fit rounded-xl bg-cyan-50 dark:bg-cyan-900/30 px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">
          {label}
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        {[0, 1, 2, 3].map((lineIndex) => {
          const y = 40 + lineIndex * 55;

          return (
            <line
              key={lineIndex}
              x1="40"
              x2={width - 40}
              y1={y}
              y2={y}
              stroke="currentColor"
              className="text-gray-100 dark:text-gray-800"
            />
          );
        })}

        <path
          d={area}
          fill="currentColor"
          className="text-cyan-500"
          opacity="0.14"
        />

        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-cyan-700 dark:text-cyan-300"
        />

        {points.map((point, index) =>
          index === points.length - 1 ? (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="7"
              className="fill-cyan-700 dark:fill-cyan-300"
            />
          ) : null
        )}
      </svg>
    </section>
  );
}