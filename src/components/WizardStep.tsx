"use client";

import type { Dimension } from "@/lib/diagnostic-data";
import type { Answers } from "@/lib/scoring";
import Toggle from "./Toggle";

interface WizardStepProps {
  dimension: Dimension;
  answers: Answers;
  onAnswer: (questionId: number, value: boolean) => void;
  stepIndex: number;
}

export default function WizardStep({
  dimension,
  answers,
  onAnswer,
  stepIndex,
}: WizardStepProps) {
  return (
    <div>
      <div className="mb-8">
        <p className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-widest text-[var(--color-orange)] mb-2">
          Dimension {stepIndex + 1} of 5
        </p>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-bold mb-2">
          {dimension.name}
        </h2>
        <p className="font-[family-name:var(--font-body)] text-[var(--color-grey)] text-base md:text-lg italic">
          {dimension.subtitle}
        </p>
      </div>

      <div className="space-y-4">
        {dimension.questions.map((question) => (
          <div
            key={question.id}
            className="rounded-xl border border-[var(--color-grey-light)] bg-[var(--color-white)] p-5"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <span className="font-[family-name:var(--font-mono)] text-xs font-medium text-[var(--color-orange)] mr-2">
                  {String(question.id).padStart(2, "0")}.
                </span>
                <span className="font-[family-name:var(--font-body)] text-base leading-relaxed">
                  {question.text}
                </span>
              </div>
              <div className="flex-shrink-0">
                <Toggle
                  questionId={question.id}
                  value={answers[question.id] ?? null}
                  onChange={(val) => onAnswer(question.id, val)}
                />
              </div>
            </div>
            <p className="font-[family-name:var(--font-body)] text-xs text-[var(--color-grey)] mt-3 italic">
              &quot;Not sure&quot; counts as No. Only what is concretely true
              today counts as Yes.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
