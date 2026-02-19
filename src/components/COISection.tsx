import { COI_COPY } from "@/lib/diagnostic-data";
import type { DimensionResult } from "@/lib/diagnostic-data";

interface COISectionProps {
  results: DimensionResult[];
}

export default function COISection({ results }: COISectionProps) {
  const totalNos = results.reduce(
    (sum, r) => sum + (r.maxScore - r.score),
    0
  );

  return (
    <section className="relative bg-[var(--color-foreground)] text-[var(--color-background)] p-8 rounded-2xl mt-10 overflow-hidden">
      <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold mb-4 text-[var(--color-orange)]">
        {COI_COPY.heading}
      </h3>
      <p className="font-[family-name:var(--font-body)] text-base leading-relaxed mb-4 text-[var(--color-grey-light)]">
        {COI_COPY.intro}
      </p>
      <p className="font-[family-name:var(--font-body)] text-base leading-relaxed mb-6 text-[var(--color-grey-light)]">
        {COI_COPY.body}
      </p>
      <div className="border-t border-[var(--color-grey)] pt-4">
        <p className="font-[family-name:var(--font-heading)] text-5xl font-bold text-[var(--color-orange)] mb-1">
          {totalNos}
        </p>
        <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-grey-light)]">
          unaddressed gaps in this initiative — each one a compounding risk.
        </p>
      </div>
    </section>
  );
}
