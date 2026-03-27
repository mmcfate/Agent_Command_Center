"use client";

interface SparklineProps {
  data: number[];       // values expected in 0-100 range
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  max?: number;         // optional max (default 100)
}

export function Sparkline({ data, color = "#34d399", width = 80, height = 24, fill = false, max = 100 }: SparklineProps) {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="opacity-30" />;
  }

  // Use FIXED 0-to-max scale so the line accurately reflects % of the chart
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const pct = Math.min(Math.max(v, 0), max) / max;   // clamp to [0, max]
    const y = height - pct * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const areaPath =
    fill && data.length > 1
      ? `M0,${height} ` + data.map((v, i) => {
          const x = (i / (data.length - 1)) * width;
          const pct = Math.min(Math.max(v, 0), max) / max;
          const y = height - pct * height;
          return `L${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(" ") + ` L${width},${height} Z`
      : null;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="inline-block overflow-visible">
      {areaPath && (
        <path d={areaPath} fill={color} fillOpacity="0.15" />
      )}
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
