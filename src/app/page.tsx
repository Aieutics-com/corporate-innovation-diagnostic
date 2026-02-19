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
          <p className="font-[family-name:var(--font-body)] text-base md:text-lg text-white/70 leading-relaxed mb-10">
            A structured assessment for corporate innovators.
            <br />
            Identify where your initiative is structurally at risk — before it stalls.
          </p>

          <Link
            href="/diagnostic"
            className="inline-block bg-[var(--color-orange)] text-white font-[family-name:var(--font-heading)] font-bold text-lg px-12 py-4 rounded-xl shadow-[0_0_20px_rgba(255,95,31,0.2)] hover:shadow-[0_0_40px_rgba(255,95,31,0.3)] hover:scale-[1.02] transition-all duration-300"
          >
            Start the Diagnostic
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

          {/* Dimensions preview */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-5 gap-4 text-left">
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
            from patterns observed across executive coaching, corporate accelerator programmes, and consulting engagements with corporate innovation teams.
            These tools are starting points. If your results raise questions,{" "}
            <a href="https://www.aieutics.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">let&apos;s talk</a>.
          </p>
        </div>
      </footer>
    </main>
  );
}
