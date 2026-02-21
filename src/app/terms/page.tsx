import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Sale — Corporate Innovation Diagnostic",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 md:px-12">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <Image
              src="/aieutics_transparentbg_logo.png"
              alt="Aieutics"
              width={72}
              height={72}
              className="h-[4.5rem] w-auto"
            />
          </Link>
          <span className="font-[family-name:var(--font-heading)] text-xs text-[var(--color-grey)]">
            Terms of Sale
          </span>
        </div>
      </header>

      <div className="flex-1 px-6 py-8 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-bold mb-8">
            Terms of Sale
          </h1>

          <div className="font-[family-name:var(--font-body)] text-sm text-[var(--color-foreground)] leading-relaxed space-y-6">
            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold mb-2">
                1. Seller
              </h2>
              <p>
                The Corporate Innovation Diagnostic is provided by Alexandra
                Najdanovic, trading as Aieutics, a sole trader registered in the
                United Kingdom.
              </p>
              <p className="mt-2">
                Contact:{" "}
                <a
                  href="mailto:hello@aieutics.com"
                  className="text-[var(--color-orange)] hover:underline"
                >
                  hello@aieutics.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold mb-2">
                2. What You Are Purchasing
              </h2>
              <p>
                The paid tiers of the Corporate Innovation Diagnostic provide
                access to a digital analysis report generated from your
                diagnostic responses. This includes:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-[var(--color-grey)]">
                <li>
                  <strong>Full Analysis (EUR 49 / GBP 39 / USD 59):</strong>{" "}
                  Per-dimension coaching reflections, pattern interpretation,
                  recommended next steps, risk narrative, branded PDF report, and
                  share/print functionality.
                </li>
                <li>
                  <strong>
                    Full Analysis + Debrief (EUR 149 / GBP 119 / USD 179):
                  </strong>{" "}
                  Everything in the Full Analysis, plus a 20-minute video debrief
                  session with Alexandra Najdanovic.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold mb-2">
                3. Digital Content — Immediate Access
              </h2>
              <p>
                The analysis report is digital content delivered immediately upon
                completion of payment. By proceeding with the purchase, you
                acknowledge that the content is made available to you
                immediately, and you expressly consent to waive any right of
                withdrawal or cooling-off period that may otherwise apply under
                consumer protection regulations.
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold mb-2">
                4. Payment
              </h2>
              <p>
                Payments are processed securely via Stripe. The price displayed
                at checkout reflects your local currency. All prices are
                inclusive — no additional charges apply.
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold mb-2">
                5. VAT
              </h2>
              <p>
                Aieutics is not VAT-registered. No VAT is charged. For EU
                business-to-business purchases, the reverse charge mechanism
                applies — the buyer is responsible for accounting for VAT in
                their jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold mb-2">
                6. Debrief Sessions
              </h2>
              <p>
                If you purchase the Debrief tier, you will receive a link to
                schedule a 20-minute video call. Sessions must be booked within
                60 days of purchase. Rescheduling is permitted with 24 hours'
                notice.
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold mb-2">
                7. Disclaimer
              </h2>
              <p>
                The diagnostic and analysis are educational tools based on
                patterns observed across executive coaching and consulting
                engagements. They do not constitute professional advice. Results
                should be considered as a starting point for reflection, not as a
                definitive assessment.
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold mb-2">
                8. Privacy
              </h2>
              <p>
                Your diagnostic responses and contact details are processed in
                accordance with our{" "}
                <Link
                  href="/privacy"
                  className="text-[var(--color-orange)] hover:underline"
                >
                  Privacy Policy
                </Link>
                . Payment data is handled by Stripe and is not stored by
                Aieutics.
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold mb-2">
                9. Governing Law
              </h2>
              <p>
                These terms are governed by the laws of England and Wales. Any
                disputes will be subject to the exclusive jurisdiction of the
                courts of England and Wales.
              </p>
            </section>

            <p className="text-[var(--color-grey)] text-xs mt-8">
              Last updated: February 2026
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-[var(--color-grey-light)]">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
          <Link
            href="/"
            className="font-[family-name:var(--font-body)] text-xs text-[var(--color-grey)] hover:text-[var(--color-orange)] transition-colors"
          >
            Back to diagnostic
          </Link>
        </div>
      </footer>
    </main>
  );
}
