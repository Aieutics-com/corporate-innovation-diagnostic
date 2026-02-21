"use client";

import type { ReactNode } from "react";

interface PaywallGateProps {
  isPaid: boolean;
  children: ReactNode;
  /** Optional: height of the blurred preview area */
  previewHeight?: string;
}

export default function PaywallGate({
  isPaid,
  children,
  previewHeight = "200px",
}: PaywallGateProps) {
  if (isPaid) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div
        className="overflow-hidden pointer-events-none select-none"
        style={{ maxHeight: previewHeight }}
        aria-hidden="true"
      >
        <div className="blur-[6px] opacity-60">{children}</div>
      </div>

      {/* Gradient fade overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-background)]/70 to-[var(--color-background)]"
        style={{ minHeight: previewHeight }}
      />
    </div>
  );
}
