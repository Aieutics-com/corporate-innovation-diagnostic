import Link from "next/link";
import Image from "next/image";
import HeroVideo from "@/components/HeroVideo";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 md:px-12 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Image
            src="/aieutics_transparentbg_logo.png"
            alt="Aieutics"
            width={80}
            height={80}
            className="h-20 w-auto"
          />
          <span className="font-[family-name:var(--font-body)] text-sm text-white/70 italic hidden sm:inline">
            See further. Think deeper. Break through.
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-16 md:py-24 relative overflow-hidden">
        {/* Video background */}
        <HeroVideo />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white animate-text-focus-in">
            Corporate Innovation
            <br />
            <span className="text-[var(--color-orange)]">Diagnostic</span>
          </h1>

          <p className="font-[family-name:var(--font-body)] text-lg md:text-xl text-white/80 leading-relaxed mb-4">
            18 binary questions. 5 dimensions. No middle ground.
          </p>
          <p className="font-[family-name:var(--font-body)] text-base md:text-lg text-white/70 leading-relaxed mb-4">
            A structured assessment for corporate innovators.
            <br />
            Identify where your initiative is structurally at risk — before it stalls.
          </p>
          <p className="font-[family-name:var(--font-body)] text-sm text-white/60 mb-10">
            Free assessment. Detailed analysis from EUR 49 / GBP 39.
          </p>

          <Link
            href="/diagnostic"
            className="inline-block bg-[var(--color-orange)] text-white font-[family-name:var(--font-heading)] font-bold text-lg px-12 py-4 rounded-xl shadow-[0_0_20px_rgba(255,95,31,0.2)] hover:shadow-[0_0_40px_rgba(255,95,31,0.3)] hover:scale-[1.02] transition-all duration-300"
          >
            Start the Diagnostic — Free
          </Link>
          <p className="font-[family-name:var(--font-body)] text-sm text-white/60 mt-4">
            Takes 3-5 minutes. Only what is concretely true today counts as
            Yes.
          </p>

          <p className="font-[family-name:var(--font-body)] text-sm text-white/50 mt-3">
            Not sure what type of initiative you&apos;re running?{" "}
            <Link
              href="/classify"
              className="text-[var(--color-orange)] hover:text-white transition-colors underline underline-offset-2"
            >
              Classify it first
            </Link>
          </p>

          {/* How it works */}
          <div className="mt-16 mb-12">
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-white mb-8">
              How it works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              {[
                {
                  step: "1",
                  title: "Answer 18 questions",
                  desc: "Yes/no questions across 5 critical dimensions of corporate innovation readiness.",
                },
                {
                  step: "2",
                  title: "Get your profile instantly",
                  desc: "Scores, radar chart, and traffic-light risk map — free, immediately after completion.",
                },
                {
                  step: "3",
                  title: "Unlock the full analysis",
                  desc: "Coaching reflections, pattern interpretation, action prompts, and a branded PDF report.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="border border-white/20 rounded-xl p-5 bg-black/30 backdrop-blur-sm"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-orange)] text-white font-[family-name:var(--font-heading)] font-bold text-sm mb-3">
                    {item.step}
                  </span>
                  <p className="font-[family-name:var(--font-heading)] text-sm font-bold text-white mb-2">
                    {item.title}
                  </p>
                  <p className="font-[family-name:var(--font-body)] text-xs text-white/60 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Dimensions preview */}
          <div className="mb-12 grid grid-cols-1 sm:grid-cols-5 gap-4 text-left">
            {[
              { label: "Problem Legitimacy", desc: "Is it real and grounded?" },
              {
                label: "Stakeholder Architecture",
                desc: "Have you mapped the power structure?",
              },
              {
                label: "Organisational Feasibility",
                desc: "Can the machinery handle it?",
              },
              {
                label: "Internal Value & Adoption",
                desc: "Will it become operational?",
              },
              {
                label: "Delivery & Scope",
                desc: "Are constraints clearly defined?",
              },
            ].map((dim, i) => (
              <div
                key={i}
                className="border border-white/20 rounded-xl p-3 hover:border-[var(--color-orange)] hover:shadow-[0_0_20px_rgba(255,95,31,0.1)] transition-all duration-300 bg-black/30 backdrop-blur-sm"
              >
                <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-wider text-[var(--color-orange)] mb-1">
                  {dim.label}
                </p>
                <p className="font-[family-name:var(--font-body)] text-xs text-white/60">
                  {dim.desc}
                </p>
              </div>
            ))}
          </div>

          {/* What's included — 3 tiers */}
          <div className="mb-12">
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-white mb-8">
              What&apos;s included
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Free tier */}
              <div className="border border-white/20 rounded-xl p-5 bg-black/30 backdrop-blur-sm">
                <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-widest text-white/60 mb-1">
                  Free
                </p>
                <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-white mb-4">
                  EUR 0
                </p>
                <ul className="space-y-2">
                  {[
                    "Your score across 5 dimensions",
                    "Radar chart visualisation",
                    "Traffic-light risk map",
                    "Two coaching teasers",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="font-[family-name:var(--font-body)] text-xs text-white/70 flex items-start gap-2"
                    >
                      <span className="text-[var(--color-orange)] mt-0.5 flex-shrink-0">
                        &#10003;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full Analysis tier */}
              <div className="border-2 border-[var(--color-orange)] rounded-xl p-5 bg-black/30 backdrop-blur-sm relative">
                <div className="absolute -top-3 left-4 bg-[var(--color-orange)] text-white text-xs font-[family-name:var(--font-heading)] font-bold px-3 py-0.5 rounded-full">
                  Most popular
                </div>
                <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-widest text-[var(--color-orange)] mb-1">
                  Full Analysis
                </p>
                <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-white mb-1">
                  EUR 49
                </p>
                <p className="font-[family-name:var(--font-body)] text-xs text-white/50 mb-4">
                  GBP 39 / USD 59
                </p>
                <ul className="space-y-2">
                  {[
                    "Everything in Free",
                    "Pattern interpretation",
                    "Per-dimension coaching reflections",
                    "Recommended next steps",
                    "Risk narrative",
                    "Branded PDF report",
                    "Share by email",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="font-[family-name:var(--font-body)] text-xs text-white/70 flex items-start gap-2"
                    >
                      <span className="text-[var(--color-orange)] mt-0.5 flex-shrink-0">
                        &#10003;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Debrief tier */}
              <div className="border border-white/20 rounded-xl p-5 bg-black/30 backdrop-blur-sm">
                <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-widest text-white/60 mb-1">
                  Full Analysis + Debrief
                </p>
                <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-white mb-1">
                  EUR 149
                </p>
                <p className="font-[family-name:var(--font-body)] text-xs text-white/50 mb-4">
                  GBP 119 / USD 179
                </p>
                <ul className="space-y-2">
                  {[
                    "Everything in Full Analysis",
                    "20-min video debrief with Alexandra",
                    "Walk through your results together",
                    "Identify the binding constraint",
                    "Leave with a clear next step",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="font-[family-name:var(--font-body)] text-xs text-white/70 flex items-start gap-2"
                    >
                      <span className="text-[var(--color-orange)] mt-0.5 flex-shrink-0">
                        &#10003;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
          <Image
            src="/aieutics_transparentbg_logo.png"
            alt="Aieutics"
            width={24}
            height={24}
            className="h-6 w-auto opacity-40"
          />
          <p className="font-[family-name:var(--font-body)] text-xs text-white/50">
            Built by{" "}
            <a href="https://www.aieutics.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">Aieutics</a>{" "}
            from two decades of practice across strategy consulting, executive coaching, and digital transformation.
            These diagnostics are starting points. If your results raise questions,{" "}
            <a href="https://www.aieutics.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">let&apos;s talk</a>.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="font-[family-name:var(--font-body)] text-xs text-white/40 hover:text-white/60 transition-colors">
              Terms of Sale
            </Link>
            <Link href="/privacy" className="font-[family-name:var(--font-body)] text-xs text-white/40 hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
