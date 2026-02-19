import {
  DIMENSIONS,
  PATTERN_INTERPRETATIONS,
  type Dimension,
  type DimensionResult,
  type PatternInterpretation,
  type Status,
} from "./diagnostic-data";

export type Answers = Record<number, boolean | null>;

export function getStatus(score: number, maxScore: number): Status {
  if (score === maxScore) return "green";
  if (score <= Math.floor(maxScore * 0.33)) return "red";
  // For 3-question dimensions: 0-1 = red, 2 = amber, 3 = green
  // For 4-question dimensions: 0-1 = red, 2-3 = amber, 4 = green
  return "amber";
}

export function getDimensionStatus(dimension: Dimension, score: number): Status {
  const max = dimension.questions.length;
  if (score === max) return "green";
  if (score <= dimension.threshold) return "red";
  return "amber";
}

export function scoreDimension(
  dimension: Dimension,
  answers: Answers
): DimensionResult {
  const score = dimension.questions.reduce((sum, q) => {
    return sum + (answers[q.id] === true ? 1 : 0);
  }, 0);

  const maxScore = dimension.questions.length;
  const status = getDimensionStatus(dimension, score);
  const percentage = Math.round((score / maxScore) * 100);

  return { dimension, score, maxScore, status, percentage };
}

export function scoreAll(answers: Answers): DimensionResult[] {
  return DIMENSIONS.map((d) => scoreDimension(d, answers));
}

export function getMatchingPatterns(
  results: DimensionResult[]
): PatternInterpretation[] {
  return PATTERN_INTERPRETATIONS.filter((p) => p.condition(results));
}

export function getTotalScore(results: DimensionResult[]): number {
  return results.reduce((sum, r) => sum + r.score, 0);
}

export function getTotalMax(results: DimensionResult[]): number {
  return results.reduce((sum, r) => sum + r.maxScore, 0);
}

export function getRedCount(results: DimensionResult[]): number {
  return results.filter((r) => r.status === "red").length;
}

export function shouldShowReflection(result: DimensionResult): boolean {
  return result.score <= result.dimension.threshold;
}
