"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics";
import { DIMENSIONS } from "@/lib/diagnostic-data";
import {
  scoreAll,
  getMatchingPatterns,
  getTotalScore,
  getTotalMax,
  getRedCount,
  type Answers,
} from "@/lib/scoring";
import { decodeAnswers, encodeAnswers } from "@/lib/share";
import ProgressBar from "@/components/ProgressBar";
import WizardStep from "@/components/WizardStep";
import ResultsPage from "@/components/ResultsPage";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import type { Tier } from "@/lib/payment";

function DiagnosticContent() {
  const searchParams = useSearchParams();
  const [answers, setAnswers] = useState<Answers>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [notionPageId, setNotionPageId] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [tier, setTier] = useState<Tier | null>(null);
  const hasTrackedStart = useRef(false);
  const isSharedView = useRef(false);
  const hasCheckedUnlock = useRef(false);
  const hasCheckedCookie = useRef(false);
  const hasSubmitted = useRef(false);

  // Decode shared results from URL + handle unlock flow + demo check
  useEffect(() => {
    const encoded = searchParams.get("r");
    const sessionId = searchParams.get("session_id");
    const demoKey = searchParams.get("demo");

    if (encoded) {
      const decoded = decodeAnswers(encoded);
      if (decoded) {
        setAnswers(decoded);
        setShowResults(true);
        isSharedView.current = true;
      }
    } else if (!hasTrackedStart.current) {
      track("diagnostic_started");
      hasTrackedStart.current = true;
    }

    // Handle Stripe redirect: verify session and set unlock cookie
    if (sessionId && !hasCheckedUnlock.current) {
      hasCheckedUnlock.current = true;
      fetch(`/api/unlock?session_id=${encodeURIComponent(sessionId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsPaid(true);
            setTier(data.tier || "analysis");
            track("payment_unlocked", { tier: data.tier });
            // Clean up the URL — remove session_id but keep r
            const url = new URL(window.location.href);
            url.searchParams.delete("session_id");
            window.history.replaceState({}, "", url.toString());
          }
        })
        .catch(() => {});
    }

    // Handle demo link: verify server-side
    if (demoKey && !isPaid) {
      fetch(`/api/check-demo?key=${encodeURIComponent(demoKey)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setIsPaid(true);
            setTier("debrief");
          }
        })
        .catch(() => {});
    }

    // Check unlock cookie for returning visitors (no session_id, no demo)
    if (encoded && !sessionId && !demoKey && !isPaid && !hasCheckedCookie.current) {
      hasCheckedCookie.current = true;
      fetch(`/api/check-unlock?r=${encodeURIComponent(encoded)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.isPaid) {
            setIsPaid(true);
            setTier(data.tier || "analysis");
          }
        })
        .catch(() => {});
    }
  }, [searchParams, isPaid]);

  const handleAnswer = useCallback((questionId: number, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const currentDimension = DIMENSIONS[currentStep];

  const allCurrentAnswered = useMemo(() => {
    if (!currentDimension) return false;
    return currentDimension.questions.every(
      (q) => answers[q.id] !== undefined && answers[q.id] !== null
    );
  }, [currentDimension, answers]);

  const goNext = useCallback(() => {
    if (currentStep < DIMENSIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      track("diagnostic_completed");
      setShowResults(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Submit to Notion (fire-and-forget, deduplicated)
      if (hasSubmitted.current) return;
      hasSubmitted.current = true;
      const resultsData = scoreAll(answers);
      const encoded = encodeAnswers(answers);
      const allQuestionIds = DIMENSIONS.flatMap((d) => d.questions.map((q) => q.id));
      fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "Corporate Innovation",
          answers,
          questionCount: allQuestionIds.length,
          dimensions: resultsData.map((r) => ({
            name: r.dimension.name,
            score: r.score,
            maxScore: r.maxScore,
            status: r.status,
          })),
          patterns: getMatchingPatterns(resultsData).map((p) => p.id),
          totalScore: getTotalScore(resultsData),
          totalMax: getTotalMax(resultsData),
          redCount: getRedCount(resultsData),
          encodedAnswers: encoded,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.pageId) setNotionPageId(data.pageId);
        })
        .catch(() => {});
    }
  }, [currentStep, answers]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const handleRestart = useCallback(() => {
    setAnswers({});
    setCurrentStep(0);
    setShowResults(false);
    setNotionPageId(null);
    setIsPaid(false);
    setTier(null);
    isSharedView.current = false;
    hasCheckedUnlock.current = false;
    hasCheckedCookie.current = false;
    hasSubmitted.current = false;
    window.history.replaceState({}, "", "/diagnostic");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const results = useMemo(() => scoreAll(answers), [answers]);

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
            Corporate Innovation Diagnostic
          </span>
        </div>
      </header>

      <div className="flex-1 px-6 py-8 md:px-12">
        <div className="max-w-2xl mx-auto">
          {!showResults ? (
            <>
              {/* Progress */}
              <div className="mb-10 no-print">
                <ProgressBar currentStep={currentStep} />
              </div>

              {/* Wizard step */}
              <WizardStep
                dimension={currentDimension}
                answers={answers}
                onAnswer={handleAnswer}
                stepIndex={currentStep}
              />

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-[var(--color-grey-light)] no-print">
                <button
                  onClick={goBack}
                  disabled={currentStep === 0}
                  className={`
                    font-[family-name:var(--font-heading)] text-sm font-bold px-8 py-3 rounded-xl
                    transition-all duration-200 cursor-pointer
                    ${
                      currentStep === 0
                        ? "text-[var(--color-grey-light)] cursor-not-allowed"
                        : "border border-[var(--color-grey-light)] text-[var(--color-grey)] hover:border-[var(--color-foreground)] hover:text-[var(--color-foreground)]"
                    }
                  `}
                >
                  Back
                </button>

                {/* Step indicator on mobile */}
                <span className="md:hidden font-[family-name:var(--font-heading)] text-xs text-[var(--color-grey)]">
                  {currentStep + 1} / 5
                </span>

                <button
                  onClick={goNext}
                  disabled={!allCurrentAnswered}
                  className={`
                    font-[family-name:var(--font-heading)] text-sm font-bold px-10 py-3 rounded-xl
                    transition-all duration-300 cursor-pointer
                    ${
                      allCurrentAnswered
                        ? "bg-[var(--color-orange)] text-white shadow-[0_0_15px_rgba(255,95,31,0.2)] hover:shadow-[0_0_30px_rgba(255,95,31,0.3)] hover:scale-[1.02]"
                        : "bg-[var(--color-grey-light)] text-[var(--color-grey)] cursor-not-allowed"
                    }
                  `}
                >
                  {currentStep === DIMENSIONS.length - 1
                    ? "See Results"
                    : "Next Dimension"}
                </button>
              </div>
            </>
          ) : (
            <ResultsPage
              results={results}
              answers={answers}
              onRestart={handleRestart}
              notionPageId={notionPageId}
              isPaid={isPaid}
              tier={tier}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-[var(--color-grey-light)]">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
          <Image
            src="/aieutics_transparentbg_logo.png"
            alt="Aieutics"
            width={20}
            height={20}
            className="h-5 w-auto opacity-40"
          />
          <p className="font-[family-name:var(--font-body)] text-xs text-[var(--color-grey)]">
            Built by{" "}
            <a href="https://www.aieutics.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-orange)] transition-colors">Aieutics</a>{" "}
            from two decades of practice across strategy consulting, executive coaching, and digital transformation.
            These diagnostics are starting points. If your results raise questions,{" "}
            <a href="https://www.aieutics.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-orange)] transition-colors">let&apos;s talk</a>.
          </p>
        </div>
      </footer>
    </main>
  );
}

export default function DiagnosticPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <p className="font-[family-name:var(--font-heading)] text-sm text-[var(--color-grey)]">
              Loading diagnostic...
            </p>
          </div>
        }
      >
        <DiagnosticContent />
      </Suspense>
    </ErrorBoundary>
  );
}
