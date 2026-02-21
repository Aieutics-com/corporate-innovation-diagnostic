"use client";

import { encodeAnswers } from "@/lib/share";
import type { Answers } from "@/lib/scoring";

interface UnlockButtonsProps {
  answers: Answers;
}

export default function UnlockButtons({ answers }: UnlockButtonsProps) {
  const encoded = encodeAnswers(answers);

  const analysisUrl = process.env.NEXT_PUBLIC_PAYMENT_LINK_URL_ANALYSIS;
  const debriefUrl = process.env.NEXT_PUBLIC_PAYMENT_LINK_URL_DEBRIEF;

  // Append client_reference_id so Stripe passes the answers through
  const buildPaymentUrl = (baseUrl: string | undefined) => {
    if (!baseUrl) return "#";
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}client_reference_id=${encoded}`;
  };

  return (
    <div className="relative bg-[var(--color-white)] border border-[var(--color-grey-light)] rounded-2xl p-6 md:p-8 my-8">
      <div className="text-center mb-6">
        <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-widest text-[var(--color-orange)] mb-2">
          Unlock Your Full Analysis
        </p>
        <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-grey)] max-w-md mx-auto">
          Get the complete coaching analysis: per-dimension reflections, pattern
          interpretation, action prompts, risk narrative, and a branded PDF
          report.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {/* Full Analysis tier */}
        <a
          href={buildPaymentUrl(analysisUrl)}
          className="group flex-1 max-w-xs mx-auto sm:mx-0 block text-center px-6 py-4 rounded-xl border-2 border-[var(--color-orange)] bg-[var(--color-orange)] text-white font-[family-name:var(--font-heading)] font-bold text-sm transition-all duration-200 hover:shadow-[0_0_25px_rgba(255,95,31,0.3)] hover:scale-[1.02] no-underline"
        >
          <span className="block text-base mb-1">Full Analysis</span>
          <span className="block text-xs font-normal opacity-90">
            From EUR 49 / GBP 39
          </span>
        </a>

        {/* Debrief tier */}
        <a
          href={buildPaymentUrl(debriefUrl)}
          className="group flex-1 max-w-xs mx-auto sm:mx-0 block text-center px-6 py-4 rounded-xl border-2 border-[var(--color-foreground)] text-[var(--color-foreground)] font-[family-name:var(--font-heading)] font-bold text-sm transition-all duration-200 hover:bg-[var(--color-foreground)] hover:text-white hover:shadow-lg hover:scale-[1.02] no-underline"
        >
          <span className="block text-base mb-1">
            Full Analysis + Expert Debrief
          </span>
          <span className="block text-xs font-normal opacity-70">
            From EUR 149 / GBP 119
          </span>
          <span className="block text-xs font-normal opacity-60 mt-1">
            Includes 20-min video call
          </span>
        </a>
      </div>

      <p className="text-center mt-4 font-[family-name:var(--font-body)] text-xs text-[var(--color-grey)]">
        Secure checkout via Stripe. Price shown at checkout in your local
        currency.
      </p>
    </div>
  );
}
