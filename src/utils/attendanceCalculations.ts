import { RiskLevel } from '../types.ts';

export interface CalculationResult {
  percentage: number;
  riskLevel: RiskLevel;
  riskReason: string;
  canMissCount: number;
  recoverConsecutiveCount: number;
  isRecoverable: boolean;
}

/**
 * Calculates student attendance percentage, risk status, and recovery counts.
 * Excuses approved leave from applicable lecture count (ensuring students are not penalized).
 */
export function calculateAttendanceMetrics(
  attended: number,
  total: number,
  approvedLeave = 0,
  requiredPercentage = 75,
  riskBuffer = 5
): CalculationResult {
  // Applicable lectures exclude approved leaves (or minimum 0)
  const applicable = Math.max(0, total - approvedLeave);

  if (applicable === 0) {
    return {
      percentage: 100,
      riskLevel: 'safe',
      riskReason: 'No non-excused lectures have been conducted yet. Attendance is currently in good standing.',
      canMissCount: 0,
      recoverConsecutiveCount: 0,
      isRecoverable: true,
    };
  }

  const rawPct = (attended / applicable) * 100;
  const percentage = Math.round(rawPct * 10) / 10;

  // Determine risk level
  let riskLevel: RiskLevel = 'safe';
  let riskReason = '';

  if (percentage < requiredPercentage) {
    riskLevel = 'critical';
    const deficit = Math.round((requiredPercentage - percentage) * 10) / 10;
    riskReason = `Critical: Your attendance is ${percentage}%, which is ${deficit}% below the required ${requiredPercentage}%. Urgent recovery is needed.`;
  } else if (percentage < requiredPercentage + riskBuffer) {
    riskLevel = 'at_risk';
    const margin = Math.round((percentage - requiredPercentage) * 10) / 10;
    riskReason = `At Risk: Your attendance is ${percentage}%, only ${margin}% above the required ${requiredPercentage}%. Missing upcoming lectures will drop you into the critical zone.`;
  } else {
    riskLevel = 'safe';
    const buffer = Math.round((percentage - requiredPercentage) * 10) / 10;
    riskReason = `Safe: Your attendance is ${percentage}%, well above the required ${requiredPercentage}% (+${buffer}% safety margin).`;
  }

  // Calculate how many lectures can be missed without falling below required percentage
  // floor((attended / (requiredPercentage / 100)) - applicable)
  let canMissCount = 0;
  if (percentage >= requiredPercentage) {
    const targetFraction = requiredPercentage / 100;
    if (targetFraction > 0) {
      canMissCount = Math.max(0, Math.floor(attended / targetFraction - applicable));
    }
  }

  // Calculate consecutive lectures needed to recover
  let recoverConsecutiveCount = 0;
  let isRecoverable = true;

  if (percentage < requiredPercentage) {
    const targetFraction = requiredPercentage / 100;
    if (targetFraction >= 1.0) {
      // Impossible if already missed any
      isRecoverable = false;
      recoverConsecutiveCount = 999;
    } else {
      // (attended + x) / (applicable + x) >= targetFraction
      // x * (1 - targetFraction) >= targetFraction * applicable - attended
      const numerator = targetFraction * applicable - attended;
      const denominator = 1 - targetFraction;
      recoverConsecutiveCount = Math.max(0, Math.ceil(numerator / denominator));
    }
  }

  return {
    percentage,
    riskLevel,
    riskReason,
    canMissCount,
    recoverConsecutiveCount,
    isRecoverable,
  };
}

/**
 * Simulates missing 1 upcoming lecture
 */
export function simulateMissNextLecture(
  attended: number,
  total: number,
  approvedLeave = 0,
  requiredPercentage = 75
): {
  currentPercentage: number;
  projectedPercentage: number;
  dropPercentage: number;
  canSafelyMiss: boolean;
  explanation: string;
} {
  const currentMetrics = calculateAttendanceMetrics(attended, total, approvedLeave, requiredPercentage);
  const projectedMetrics = calculateAttendanceMetrics(attended, total + 1, approvedLeave, requiredPercentage);

  const drop = Math.round((currentMetrics.percentage - projectedMetrics.percentage) * 10) / 10;
  const canSafelyMiss = projectedMetrics.percentage >= requiredPercentage;

  let explanation = '';
  if (canSafelyMiss) {
    explanation = `Your attendance will decrease from ${currentMetrics.percentage}% to ${projectedMetrics.percentage}%. Since this remains above ${requiredPercentage}%, you can safely miss this lecture.`;
  } else {
    explanation = `Your attendance will drop from ${currentMetrics.percentage}% to ${projectedMetrics.percentage}%, falling below the required ${requiredPercentage}%. Missing this lecture is NOT recommended.`;
  }

  return {
    currentPercentage: currentMetrics.percentage,
    projectedPercentage: projectedMetrics.percentage,
    dropPercentage: drop,
    canSafelyMiss,
    explanation,
  };
}

/**
 * Calculates Engagement Score based on configurable weights
 */
export function calculateEngagementScore(
  attendancePct: number,
  assignmentPct: number,
  quizPct: number,
  participationPct: number,
  weights = { attendance: 0.4, assignments: 0.25, quizzes: 0.2, participation: 0.15 }
): number {
  const score =
    attendancePct * weights.attendance +
    assignmentPct * weights.assignments +
    quizPct * weights.quizzes +
    participationPct * weights.participation;
  return Math.min(100, Math.max(0, Math.round(score)));
}
