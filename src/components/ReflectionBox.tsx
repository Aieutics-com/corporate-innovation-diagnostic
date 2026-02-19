import type { DimensionResult } from "@/lib/diagnostic-data";

interface ReflectionBoxProps {
  result: DimensionResult;
  index: number;
}

export default function ReflectionBox({ result }: ReflectionBoxProps) {
  const accentColor =
    result.status === "red" ? "var(--color-red)" : "var(--color-amber)";

  return (
    <div className="relative rounded-xl bg-[var(--color-white)] border border-[var(--color-grey-light)] p-5 mb-4 overflow-hidden">
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: accentColor }}
      />

      <div className="pl-4">
        <h4 className="font-[family-name:var(--font-heading)] text-sm font-bold mb-2 flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          {result.dimension.name}
          <span className="font-normal text-[var(--color-grey)]">
            — {result.score}/{result.maxScore}
          </span>
        </h4>
        <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-foreground)] leading-relaxed mb-3">
          {result.dimension.reflection}
        </p>
        <p className="font-[family-name:var(--font-body)] text-sm italic text-[var(--color-grey)]">
          {result.dimension.reflectionPrompt}
        </p>
      </div>
    </div>
  );
}
