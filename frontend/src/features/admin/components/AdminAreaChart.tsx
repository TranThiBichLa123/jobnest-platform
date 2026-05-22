"use client";

import { useMemo, useState } from "react";

type Props = {
  title: string;
  description?: string;
  values: number[];
  label: string;
};

type Point = {
  x: number;
  y: number;
  value: number;
};

export default function AdminAreaChart({
  title,
  description,
  values,
  label,
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const width = 720;
  const height = 260;

  const { points, areaPath, linePath } = useMemo(() => {
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = Math.max(max - min, 1);

    const generatedPoints: Point[] = values.map((value, index) => {
      const x =
        40 + (index / Math.max(values.length - 1, 1)) * (width - 80);

      const y =
        height -
        40 -
        ((value - min) / range) * (height - 80);

      return { x, y, value };
    });

    const smoothPath = generatedPoints.reduce((acc, point, index, arr) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }

      const prev = arr[index - 1];

      const cp1x = prev.x + (point.x - prev.x) / 2;
      const cp1y = prev.y;

      const cp2x = prev.x + (point.x - prev.x) / 2;
      const cp2y = point.y;

      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
    }, "");

    const area = `${smoothPath} L ${width - 40} ${
      height - 40
    } L 40 ${height - 40} Z`;

    return {
      points: generatedPoints,
      areaPath: area,
      linePath: smoothPath,
    };
  }, [values]);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
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

      <div className="relative">
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

          <defs>
            <linearGradient id="adminChartGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <path d={areaPath} fill="url(#adminChartGradient)" />

          <path
            d={linePath}
            fill="none"
            stroke="#0891b2"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) => (
            <g
              key={index}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className="cursor-pointer"
            >
              <circle
                cx={point.x}
                cy={point.y}
                r={activeIndex === index ? 9 : 6}
                fill="#0891b2"
                className="transition-all"
              />

              {activeIndex === index && (
                <>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="18"
                    fill="#0891b2"
                    opacity="0.12"
                  />

                  <foreignObject
                    x={point.x - 40}
                    y={point.y - 55}
                    width="80"
                    height="40"
                  >
                    <div className="rounded-xl bg-gray-950 text-white text-xs font-bold px-3 py-2 text-center shadow-xl">
                      {point.value}
                    </div>
                  </foreignObject>
                </>
              )}
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}