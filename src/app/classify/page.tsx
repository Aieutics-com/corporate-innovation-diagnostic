"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CLASSIFICATION_QUESTIONS,
  CLASSIFICATION_RESULTS,
  classify,
} from "@/lib/classification-data";
import type { ClassificationType } from "@/lib/classification-data";

export default function ClassifyPage() {
  const [answers, setAnswers] = useState<
    Record<number, "A" | "B" | "C">
  >({});
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = CLASSIFICATION_QUESTIONS[currentStep];
  const totalSteps = CLASSIFICATION_QUESTIONS.length;

  const isCurrentAnswered = currentQuestion
    ? answers[currentQuestion.id] !== undefined
    : false;

  const handleAnswer = useCallback(
    (questionId: number, value: "A" | "B" | "C") => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    },
    []
  );

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowResults(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep, totalSteps]);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const result: ClassificationType | null = useMemo(() => {
    if (!showResults) return null;
    return classify(answers);
  }, [showResults, answers]);

  const classificationResult = result
    ? CLASSIFICATION_RESULTS[result]
    : null;

  // Colour mapping for classification types
  const typeColor: Record<ClassificationType, string> = {
    optimisation: "var(--color-green)",
    adjacency: "var(--color-amber)",
    transformation: "var(--color-orange)",
  };

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
            Initiative Classification
          </span>
        </div>
      </header>

      <div className="flex-1 px-6 py-8 md:px-12">
        <div className="max-w-2xl mx-auto">
          {!showResults ? (
            <>
              {/* Progress */}
              <div className="mb-10">
                <div className="flex gap-1.5 mb-3">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-1.5 rounded-full bg-[var(--color-grey-light)] overflow-hidden"
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width:
                            i < currentStep
                              ? "100%"
                              : i === currentStep
                              ? "40%"
                              : "0%",
                          backgroundColor: "var(--color-orange)",
                          opacity: i === currentStep ? 0.5 : 1,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-grey)]">
                  <span className="text-[var(--color-orange)]">
                    {String(currentStep + 1).padStart(2, "0")}
                  </span>
                  /{String(totalSteps).padStart(2, "0")} &middot;{" "}
                  Classification
                </p>
              </div>

              {/* Question */}
              <div>
                <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-widest text-[var(--color-orange)] mb-3">
                  Question {currentStep + 1} of {totalSteps}
                </p>
                <h2 className="font-[family-name:var(--font-heading)] text-xl md:text-2xl font-bold mb-8">
                  {currentQuestion.text}
                </h2>

                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected =
                      answers[currentQuestion.id] === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleAnswer(currentQuestion.id, option.value)
                        }
                        className={`
                          w-full text-left p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer
                          ${
                            isSelected
                              ? "border-[var(--color-orange)] bg-[var(--color-orange-vsoft)]"
                              : "border-[var(--color-grey-light)] bg-[var(--color-white)] hover:border-[var(--color-grey-lighter)]"
                          }
                        `}
                      >
                        <p
                          className={`font-[family-name:var(--font-heading)] text-sm font-bold mb-1 ${
                            isSelected
                              ? "text-[var(--color-orange)]"
                              : "text-[var(--color-foreground)]"
                          }`}
                        >
                          {option.label}
                        </p>
                        <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-grey)] leading-relaxed">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-[var(--color-grey-light)]">
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

                <button
                  onClick={goNext}
                  disabled={!isCurrentAnswered}
                  className={`
                    font-[family-name:var(--font-heading)] text-sm font-bold px-10 py-3 rounded-xl
                    transition-all duration-300 cursor-pointer
                    ${
                      isCurrentAnswered
                        ? "bg-[var(--color-orange)] text-white shadow-[0_0_15px_rgba(255,95,31,0.2)] hover:shadow-[0_0_30px_rgba(255,95,31,0.3)] hover:scale-[1.02]"
                        : "bg-[var(--color-grey-light)] text-[var(--color-grey)] cursor-not-allowed"
                    }
                  `}
                >
                  {currentStep === totalSteps - 1
                    ? "See Classification"
                    : "Next Question"}
                </button>
              </div>
            </>
          ) : (
            /* Results */
            classificationResult && (
              <div>
                <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-widest text-[var(--color-orange)] mb-2">
                  Your Classification
                </p>
                <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold mb-6">
                  <span style={{ color: typeColor[classificationResult.type] }}>
                    {classificationResult.label}
                  </span>
                </h2>

                <p className="font-[family-name:var(--font-body)] text-base leading-relaxed text-[var(--color-grey)] mb-8">
                  {classificationResult.description}
                </p>

                <div className="rounded-xl border border-[var(--color-grey-light)] bg-[var(--color-white)] p-6 mb-8">
                  <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold mb-4">
                    What this means for your initiative
                  </h3>
                  <ul className="space-y-3">
                    {classificationResult.implications.map(
                      (implication, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 font-[family-name:var(--font-body)] text-sm text-[var(--color-grey)] leading-relaxed"
                        >
                          <span
                            className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                typeColor[classificationResult.type],
                            }}
                          />
                          {implication}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="rounded-xl bg-[var(--color-orange-vsoft)] border border-[var(--color-orange-soft)] p-6 mb-8">
                  <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-foreground)] leading-relaxed">
                    This classification shapes the intensity, timeline, and political complexity of every subsequent step.
                    Keep it in mind as you work through the full diagnostic — the same gap carries different weight depending on
                    whether you&apos;re optimising, extending, or transforming.
                  </p>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <Link
                    href="/diagnostic"
                    className="inline-block bg-[var(--color-orange)] text-white font-[family-name:var(--font-heading)] font-bold text-sm px-8 py-3 rounded-xl shadow-[0_0_15px_rgba(255,95,31,0.2)] hover:shadow-[0_0_30px_rgba(255,95,31,0.3)] hover:scale-[1.02] transition-all duration-300"
                  >
                    Take the Full Diagnostic
                  </Link>
                  <button
                    onClick={handleRestart}
                    className="px-8 py-3 text-sm font-bold font-[family-name:var(--font-heading)] border border-[var(--color-grey-light)] rounded-xl text-[var(--color-grey)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)] transition-all duration-200 cursor-pointer"
                  >
                    Reclassify
                  </button>
                </div>
              </div>
            )
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
            Classification based on the{" "}
            <a href="https://www.aieutics.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-orange)] transition-colors">
              Critical Path Layers
            </a>{" "}
            framework by Aieutics.
          </p>
        </div>
      </footer>
    </main>
  );
}
