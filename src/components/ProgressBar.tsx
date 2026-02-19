"use client";

import { DIMENSIONS } from "@/lib/diagnostic-data";

interface ProgressBarProps {
  currentStep: number;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="w-full">
      {/* Segmented bar */}
      <div className="flex gap-1.5">
        {DIMENSIONS.map((dim, i) => {
          const isComplete = i < currentStep;
          const isActive = i === currentStep;
          const width = isComplete ? "100%" : isActive ? "40%" : "0%";
          return (
            <div key={dim.id} className="flex-1">
              <div className="h-1 rounded-full bg-[var(--color-grey-light)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width,
                    backgroundColor:
                      isComplete || isActive
                        ? "var(--color-orange)"
                        : "transparent",
                    opacity: isActive ? 0.5 : 1,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* Step label */}
      <div className="mt-3 flex items-center gap-2">
        <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-orange)] font-medium">
          {String(currentStep + 1).padStart(2, "0")}/05
        </span>
        <span className="font-[family-name:var(--font-body)] text-xs text-[var(--color-grey)]">
          {DIMENSIONS[currentStep]?.name}
        </span>
      </div>
    </div>
  );
}
