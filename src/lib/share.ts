import { DIMENSIONS } from "./diagnostic-data";
import type { Answers } from "./scoring";

/**
 * Encode 18 answers as a compact string: "1" = yes, "0" = no/unanswered.
 * Questions are ordered by ID (1-18).
 */
export function encodeAnswers(answers: Answers): string {
  const allQuestionIds = DIMENSIONS.flatMap((d) =>
    d.questions.map((q) => q.id)
  ).sort((a, b) => a - b);

  return allQuestionIds.map((id) => (answers[id] === true ? "1" : "0")).join("");
}

/**
 * Decode a compact string back into answers.
 */
export function decodeAnswers(encoded: string): Answers | null {
  const allQuestionIds = DIMENSIONS.flatMap((d) =>
    d.questions.map((q) => q.id)
  ).sort((a, b) => a - b);

  if (encoded.length !== allQuestionIds.length) return null;
  if (!/^[01]+$/.test(encoded)) return null;

  const answers: Answers = {};
  allQuestionIds.forEach((id, i) => {
    answers[id] = encoded[i] === "1";
  });
  return answers;
}

/**
 * Build a shareable URL with encoded answers.
 */
export function buildShareUrl(answers: Answers, baseUrl: string): string {
  const encoded = encodeAnswers(answers);
  return `${baseUrl}/diagnostic?r=${encoded}`;
}
