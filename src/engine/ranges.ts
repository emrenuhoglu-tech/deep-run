import type { Card } from "./cards";
import { RANKS } from "./cards";

// Canonical starting-hand key, e.g. "AA", "AKs", "T9o".
export function handKey(hole: Card[]): string {
  const [a, b] = [...hole].sort((x, y) => y.r - x.r);
  if (a.r === b.r) return RANKS[a.r] + RANKS[b.r];
  return RANKS[a.r] + RANKS[b.r] + (a.s === b.s ? "s" : "o");
}

// Bill Chen's preflop strength formula (higher = stronger; AA ≈ 20, 72o ≈ -1).
export function chenScore(hole: Card[]): number {
  const [a, b] = [...hole].sort((x, y) => y.r - x.r);
  const hv = (r: number) => (r === 14 ? 10 : r === 13 ? 8 : r === 12 ? 7 : r === 11 ? 6 : r / 2);

  if (a.r === b.r) return Math.round(Math.max(hv(a.r) * 2, 5));

  let pts = hv(a.r);
  if (a.s === b.s) pts += 2;
  const gap = a.r - b.r - 1;
  if (gap === 1) pts -= 1;
  else if (gap === 2) pts -= 2;
  else if (gap === 3) pts -= 4;
  else if (gap >= 4) pts -= 5;
  if (gap <= 1 && a.r < 12 && b.r < 12) pts += 1; // straight bonus for lower connectors
  return Math.round(pts);
}
