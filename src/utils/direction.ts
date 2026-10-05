/**
 * Reusable servo-angle-to-direction mapping, kept out of UI code so it
 * can be unit tested and reused (Home dashboard, Monitoring screen,
 * future event history, etc.) without duplicating the thresholds.
 */
export type Direction = 'LEFT' | 'CENTER' | 'RIGHT';

export function getDirectionFromAngle(angle: number | null): Direction {
  if (angle === null || Number.isNaN(angle)) return 'CENTER';
  if (angle < 80) return 'LEFT';
  if (angle > 100) return 'RIGHT';
  return 'CENTER';
}
