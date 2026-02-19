import type { DimensionResult } from "@/lib/diagnostic-data";

interface DimensionBarProps {
  result: DimensionResult;
  index: number;
}

const statusColors = {
  green: "var(--color-green)",
  amber: "var(--color-amber)",
  red: "var(--color-red)",
};

const statusDimColors = {
  green: "rgba(90, 154, 110, 0.12)",
  amber: "rgba(212, 148, 58, 0.12)",
  red: "rgba(239, 68, 68, 0.12)",
};

const statusLabels = {
  green: "Strong",
  amber: "Partial",
  red: "At Risk",
};

export default function DimensionBar({ result }: DimensionBarProps) {
  const color = statusColors[result.status];
  const dimColor = statusDimColors[result.status];
  const label = statusLabels[result.status];

  return (
    <div className="rounded-xl border border-[var(--color-grey-light)] bg-[var(--color-white)] p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="font-[family-name:var(--font-heading)] text-sm font-bold">
            {result.dimension.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-md font-[family-name:var(--font-heading)]"
            style={{ color, backgroundColor: dimColor }}
          >
            {label}
          </span>
          <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-grey)]">
            {result.score}/{result.maxScore}
          </span>
        </div>
      </div>
      <div className="relative h-1.5 bg-[var(--color-grey-light)] rounded-full overflow-hidden">
        <div
          className="absolute h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${result.percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
