"use client";

export default function BookingSection() {
  return (
    <section className="bg-[var(--color-foreground)] text-[var(--color-background)] p-8 rounded-2xl mt-8 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex-1">
          <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-widest text-[var(--color-orange)] mb-2">
            Your Debrief Session
          </p>
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-3">
            20-Minute Expert Debrief
          </h3>
          <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-grey-light)] leading-relaxed mb-3">
            Alexandra will contact you within 24 hours to schedule your
            debrief session. You will walk through your diagnostic results
            together, identify the binding constraint, discuss what to
            prioritise, and leave with a clear next step.
          </p>
          <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-grey-light)] leading-relaxed opacity-70">
            This report will be discussed in your scheduled debrief session.
          </p>
        </div>

        <div className="flex-shrink-0">
          <a
            href="mailto:hello@aieutics.com?subject=Corporate%20Innovation%20Diagnostic%20%E2%80%94%20Debrief%20Session"
            className="inline-block px-8 py-4 bg-[var(--color-orange)] text-white font-[family-name:var(--font-heading)] font-bold text-sm rounded-xl transition-all duration-200 hover:shadow-[0_0_25px_rgba(255,95,31,0.4)] hover:scale-[1.02] no-underline"
          >
            Contact Alexandra
          </a>
        </div>
      </div>
    </section>
  );
}
