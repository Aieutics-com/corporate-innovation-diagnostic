import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Corporate Innovation Diagnostic",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </span>
        </div>
      </header>

      <div className="flex-1 px-6 py-8 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-bold mb-8">
            Privacy Policy
          </h1>

          <div className="font-[family-name:var(--font-body)] text-sm text-[var(--color-foreground)] leading-relaxed space-y-6">
            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold mb-2">
                1. Data Controller
              </h2>
              <p>
                Alexandra Najdanovic, trading as Aieutics. Contact:{" "}
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
                2. What We Collect
              </h2>
              <ul className="list-disc list-inside mt-2 space-y-1 text-[var(--color-grey)]">
                <li>
                  <strong>Diagnostic responses:</strong> Your 18 yes/no answers
                  and computed scores. Stored in Notion.
                </li>
                <li>
                  <strong>Share details:</strong> If you choose to share results
                  by email — your name, email address, and initiative/project
                  name. Stored in Notion.
                </li>
                <li>
                  <strong>Payment details:</strong> If you purchase the paid
                  analysis — your email, company name, and optional VAT number.
                  Processed by Stripe. Payment card details are never stored by
                  Aieutics.
                </li>
                <li>
                  <strong>Analytics:</strong> Anonymous usage data via Vercel
                  Analytics (page views, diagnostic completion events). No
                  personal identifiers.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold mb-2">
                3. How We Use Your Data
              </h2>
              <ul className="list-disc list-inside mt-2 space-y-1 text-[var(--color-grey)]">
                <li>
                  To generate and deliver your diagnostic results and analysis
                </li>
                <li>
                  To send your results by email when you request it
                </li>
                <li>To process payments for paid tiers</li>
                <li>
                  To improve the diagnostic tool based on aggregate, anonymised
                  patterns
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold mb-2">
                4. Data Processors
              </h2>
              <ul className="list-disc list-inside mt-2 space-y-1 text-[var(--color-grey)]">
                <li>
                  <strong>Notion:</strong> Stores diagnostic submissions and
                  share details.
                </li>
                <li>
                  <strong>Resend:</strong> Sends email when you share results.
                </li>
                <li>
                  <strong>Stripe:</strong> Processes payments for paid analysis
                  tiers. Handles payment card data, email, company name, and VAT
                  number.
                </li>
                <li>
                  <strong>Vercel:</strong> Hosts the application. Collects
                  anonymous analytics.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold mb-2">
                5. Data Retention
              </h2>
              <p>
                Diagnostic submissions are retained indefinitely for aggregate
                analysis. You may request deletion of your identifiable data at
                any time by emailing{" "}
                <a
                  href="mailto:hello@aieutics.com"
                  className="text-[var(--color-orange)] hover:underline"
                >
                  hello@aieutics.com
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold mb-2">
                6. Cookies
              </h2>
              <p>
                This site uses an HttpOnly cookie ({`"ci_unlock"`}) to maintain
                your paid access status after purchase. This cookie expires after
                30 days. No tracking cookies are used.
              </p>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold mb-2">
                7. Your Rights
              </h2>
              <p>
                Under GDPR and UK data protection law, you have the right to
                access, rectify, erase, or port your personal data. Contact{" "}
                <a
                  href="mailto:hello@aieutics.com"
                  className="text-[var(--color-orange)] hover:underline"
                >
                  hello@aieutics.com
                </a>{" "}
                to exercise any of these rights.
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
