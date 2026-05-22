type Props = {
  values: number[];
  className?: string;
};

type Point = {
  x: number;
  y: number;
};

export default function AdminSparkline({ values, className = "" }: Props) {
  const width = 180;
  const height = 58;

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);

  const points: Point[] = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width;
    const y = height - ((value - min) / range) * (height - 12) - 6;
    return { x, y };
  });

  const path = points.reduce((acc, point, index, arr) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const prev = arr[index - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;

    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  }, "");

  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className}>
      <path d={areaPath} fill="currentColor" opacity="0.14" />
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}