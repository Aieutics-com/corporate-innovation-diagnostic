"use client";

import type { DimensionResult } from "@/lib/diagnostic-data";
import {
  getMatchingPatterns,
  getTotalScore,
  getTotalMax,
  getRedCount,
  shouldShowReflection,
} from "@/lib/scoring";
import type { Answers } from "@/lib/scoring";
import type { Tier } from "@/lib/payment";
import RadarChart from "./RadarChart";
import ShareModal from "./ShareModal";
import DimensionBar from "./DimensionBar";
import ReflectionBox from "./ReflectionBox";
import PatternInsight from "./PatternInsight";
import COISection from "./COISection";
import CTASection from "./CTASection";
import PaywallGate from "./PaywallGate";
import UnlockButtons from "./UnlockButtons";
import BookingSection from "./BookingSection";
import ActionPrompts from "./ActionPrompts";
import DownloadPDFButton from "./DownloadPDFButton";
import { useState } from "react";

interface ResultsPageProps {
  results: DimensionResult[];
  answers: Answers;
  onRestart: () => void;
  notionPageId: string | null;
  isPaid: boolean;
  tier: Tier | null;
}

export default function ResultsPage({
  results,
  answers,
  onRestart,
  notionPageId,
  isPaid,
  tier,
}: ResultsPageProps) {
  const patterns = getMatchingPatterns(results);
  const totalScore = getTotalScore(results);
  const totalMax = getTotalMax(results);
  const redCount = getRedCount(results);
  const reflections = results.filter(shouldShowReflection);
  const [shareOpen, setShareOpen] = useState(false);

  // Find the weakest dimension (lowest score, then lowest percentage) for teaser
  const weakestReflection =
    reflections.length > 0
      ? [...reflections].sort(
          (a, b) => a.percentage - b.percentage || a.score - b.score
        )[0]
      : null;

  return (
    <div>
      {/* Header — FREE */}
      <div className="mb-8">
        <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-widest text-[var(--color-orange)] mb-2">
          Your Results
        </p>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-bold mb-4">
          Corporate Innovation Profile
        </h2>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="font-[family-name:var(--font-heading)] text-6xl md:text-7xl font-bold tracking-tight text-[var(--color-orange)]">
            {totalScore}
          </span>
          <span className="font-[family-name:var(--font-heading)] text-2xl text-[var(--color-grey-lighter)]">
            /{totalMax}
          </span>
        </div>
        <p className="font-[family-name:var(--font-body)] text-[var(--color-grey)] text-base">
          This is a profile, not a grade. The pattern of your scores matters more
          than the total.
        </p>
      </div>

      {/* Action buttons — conditional on paid status */}
      <div className="flex gap-3 mb-8 no-print flex-wrap">
        {isPaid && (
          <>
            <button
              onClick={() => setShareOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold font-[family-name:var(--font-heading)] border border-[var(--color-grey-light)] rounded-xl text-[var(--color-grey)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)] transition-all duration-200 cursor-pointer"
            >
              Share results
            </button>
            <DownloadPDFButton />
          </>
        )}
        <button
          onClick={onRestart}
          className="px-5 py-2.5 text-sm font-bold font-[family-name:var(--font-heading)] text-[var(--color-grey)] rounded-xl hover:text-[var(--color-foreground)] hover:bg-[var(--color-tag-bg)] transition-all duration-200 cursor-pointer"
        >
          Retake
        </button>
      </div>

      {/* Two-column grid: radar + dimension bars — FREE */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Radar chart */}
        <div className="rounded-xl border border-[var(--color-grey-light)] bg-[var(--color-white)] p-4">
          <RadarChart results={results} />
        </div>

        {/* Dimension scores */}
        <div className="space-y-0">
          {results.map((result, i) => (
            <DimensionBar key={result.dimension.id} result={result} index={i} />
          ))}
        </div>
      </div>

      {/* Teaser reflection — FREE (weakest dimension only) */}
      {!isPaid && weakestReflection && (
        <div className="mb-4">
          <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold mb-4">
            Areas Requiring Attention
          </h3>
          <ReflectionBox result={weakestReflection} index={0} />
        </div>
      )}

      {/* Unlock buttons — shown when NOT paid */}
      {!isPaid && <UnlockButtons answers={answers} />}

      {/* === PAID CONTENT === */}

      {/* All reflections — PAID */}
      <PaywallGate isPaid={isPaid} previewHeight="250px">
        {reflections.length > 0 && (
          <div className="mb-8">
            {isPaid && (
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold mb-4">
                Areas Requiring Attention
              </h3>
            )}
            {reflections.map((result, i) => (
              <ReflectionBox
                key={result.dimension.id}
                result={result}
                index={i}
              />
            ))}
          </div>
        )}
      </PaywallGate>

      {/* Pattern interpretation — PAID */}
      <PaywallGate isPaid={isPaid} previewHeight="180px">
        <PatternInsight patterns={patterns} />
      </PaywallGate>

      {/* Action prompts — PAID */}
      <PaywallGate isPaid={isPaid} previewHeight="200px">
        <ActionPrompts results={results} />
      </PaywallGate>

      {/* COI section — PAID */}
      <PaywallGate isPaid={isPaid} previewHeight="150px">
        <COISection results={results} />
      </PaywallGate>

      {/* CTA — PAID */}
      <PaywallGate isPaid={isPaid} previewHeight="120px">
        <CTASection redCount={redCount} />
      </PaywallGate>

      {/* Booking section — DEBRIEF tier only */}
      {isPaid && tier === "debrief" && <BookingSection />}

      {/* Second unlock prompt at bottom — when not paid */}
      {!isPaid && <UnlockButtons answers={answers} />}

      {/* Share modal — PAID only */}
      {isPaid && (
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          results={results}
          answers={answers}
          notionPageId={notionPageId}
        />
      )}
    </div>
  );
}
