// Per-concept accuracy tracking. Every graded decision (simulator or drill) is
// recorded under a concept tag so weak spots can be resurfaced. localStorage.
import { load, save, remove } from "./storage";

export type Verdict = "good" | "ok" | "mistake";
type Stat = { seen: number; good: number; ok: number; mistake: number };
type LeakData = Record<string, Stat>;
const KEY = "leaks";

// Map an engine regime to a coarse, teachable concept label.
export function conceptOf(regime: string): string {
  if (regime.startsWith("Short-stack")) return "Push/fold";
  if (regime === "Preflop") return "Preflop (deep)";
  return "Postflop";
}

export function recordDecision(concept: string, verdict: Verdict): void {
  const d = load<LeakData>(KEY, {});
  const s = d[concept] || (d[concept] = { seen: 0, good: 0, ok: 0, mistake: 0 });
  s.seen++;
  s[verdict]++;
  save(KEY, d);
}

export type Leak = { concept: string; seen: number; accuracy: number; mistakes: number };

export function getLeaks(): Leak[] {
  const d = load<LeakData>(KEY, {});
  return Object.entries(d)
    .map(([concept, s]) => ({
      concept,
      seen: s.seen,
      mistakes: s.mistake,
      accuracy: s.seen ? (s.good + 0.5 * s.ok) / s.seen : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

// The concept most in need of work (lowest accuracy, enough samples), else null.
export function weakestConcept(min = 3): string | null {
  const l = getLeaks().filter((x) => x.seen >= min);
  return l.length && l[0].accuracy < 0.8 ? l[0].concept : null;
}

export function resetLeaks(): void {
  remove(KEY);
}
