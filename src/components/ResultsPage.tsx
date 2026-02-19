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
import RadarChart from "./RadarChart";
import ShareModal from "./ShareModal";
import DimensionBar from "./DimensionBar";
import ReflectionBox from "./ReflectionBox";
import PatternInsight from "./PatternInsight";
import COISection from "./COISection";
import CTASection from "./CTASection";
import { track } from "@vercel/analytics";
import { useCallback, useState } from "react";

interface ResultsPageProps {
  results: DimensionResult[];
  answers: Answers;
  onRestart: () => void;
  notionPageId: string | null;
}

export default function ResultsPage({
  results,
  answers,
  onRestart,
  notionPageId,
}: ResultsPageProps) {
  const patterns = getMatchingPatterns(results);
  const totalScore = getTotalScore(results);
  const totalMax = getTotalMax(results);
  const redCount = getRedCount(results);
  const reflections = results.filter(shouldShowReflection);
  const [shareOpen, setShareOpen] = useState(false);

  const handlePrint = useCallback(() => {
    track("print_pdf");
    window.print();
  }, []);

  return (
    <div>
      {/* Header */}
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

      {/* Action buttons */}
      <div className="flex gap-3 mb-8 no-print flex-wrap">
        <button
          onClick={() => setShareOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold font-[family-name:var(--font-heading)] border border-[var(--color-grey-light)] rounded-xl text-[var(--color-grey)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)] transition-all duration-200 cursor-pointer"
        >
          Record results
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold font-[family-name:var(--font-heading)] border border-[var(--color-grey-light)] rounded-xl text-[var(--color-grey)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)] transition-all duration-200 cursor-pointer"
        >
          Print / PDF
        </button>
        <button
          onClick={onRestart}
          className="px-5 py-2.5 text-sm font-bold font-[family-name:var(--font-heading)] text-[var(--color-grey)] rounded-xl hover:text-[var(--color-foreground)] hover:bg-[var(--color-tag-bg)] transition-all duration-200 cursor-pointer"
        >
          Retake
        </button>
      </div>

      {/* Two-column grid: radar + dimension bars */}
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

      {/* Conditional reflections */}
      {reflections.length > 0 && (
        <div className="mb-8">
          <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold mb-4">
            Areas Requiring Attention
          </h3>
          {reflections.map((result, i) => (
            <ReflectionBox
              key={result.dimension.id}
              result={result}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Pattern interpretation */}
      <PatternInsight patterns={patterns} />

      {/* COI section */}
      <COISection results={results} />

      {/* CTA */}
      <CTASection redCount={redCount} />

      {/* Share modal */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        results={results}
        answers={answers}
        notionPageId={notionPageId}
      />
    </div>
  );
}
