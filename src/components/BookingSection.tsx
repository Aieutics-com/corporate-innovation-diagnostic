"use client";

interface BookingSectionProps {
  email?: string;
  resultsUrl?: string;
}

export default function BookingSection({
  email,
  resultsUrl,
}: BookingSectionProps) {
  // Build Calendly URL with pre-filled fields
  // Alexandra will replace this with her actual Calendly or Cal.com link
  const bookingBaseUrl =
    "https://calendly.com/alexandra-aieutics/diagnostic-debrief";

  const params = new URLSearchParams();
  if (email) params.set("email", email);
  if (resultsUrl) params.set("a1", resultsUrl); // Calendly custom answer field

  const bookingUrl = `${bookingBaseUrl}${params.toString() ? `?${params.toString()}` : ""}`;

  return (
    <section className="bg-[var(--color-foreground)] text-[var(--color-background)] p-8 rounded-2xl mt-8 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex-1">
          <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-widest text-[var(--color-orange)] mb-2">
            Your Debrief Session
          </p>
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-3">
            Book Your 20-Minute Expert Debrief
          </h3>
          <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-grey-light)] leading-relaxed">
            Walk through your diagnostic results with Alexandra. Identify the
            binding constraint, discuss what to prioritise, and leave with a
            clear next step. This report will be discussed in your scheduled
            debrief session.
          </p>
        </div>

        <div className="flex-shrink-0">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-[var(--color-orange)] text-white font-[family-name:var(--font-heading)] font-bold text-sm rounded-xl transition-all duration-200 hover:shadow-[0_0_25px_rgba(255,95,31,0.4)] hover:scale-[1.02] no-underline"
          >
            Book Your Debrief
          </a>
        </div>
      </div>
    </section>
  );
}
