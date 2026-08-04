// Nash open-shove ranges from content/pushfold_charts.json, expanded from poker
// range notation ("22+", "A8s+", "KTo+", "T8s+", "QJs") into hand-key membership.
import data from "../content/pushfold_charts.json";

type Chart = { stack_bb: number; position: string; shove_range: string; approx_percent?: number };
const CHARTS = (data as { charts: Chart[] }).charts;

const ORDER = "23456789TJQKA";
const idx = (ch: string) => ORDER.indexOf(ch);

function expandToken(tok: string, out: Set<string>) {
  const plus = tok.includes("+");
  const t = tok.replace("+", "");
  if (t.length >= 2 && t[0] === t[1]) {
    // pair
    const lo = idx(t[0]);
    const hi = plus ? idx("A") : lo;
    for (let r = lo; r <= hi; r++) out.add(ORDER[r] + ORDER[r]);
    return;
  }
  // suited/offsuit combo, e.g. A8s, KQo, T8s
  const hi = t[0];
  const suit = t[2]; // 's' | 'o'
  const loStart = idx(t[1]);
  const loEnd = plus ? idx(hi) - 1 : loStart;
  for (let r = loStart; r <= loEnd; r++) out.add(hi + ORDER[r] + suit);
}

const cache = new Map<string, Set<string>>();
function expandRange(str: string): Set<string> {
  let s = cache.get(str);
  if (s) return s;
  s = new Set<string>();
  for (const tok of str.split(",").map((x) => x.trim()).filter(Boolean)) expandToken(tok, s);
  cache.set(str, s);
  return s;
}

const STACKS = [6, 8, 10, 12, 15];
function nearestStack(bb: number): number {
  const c = Math.max(6, Math.min(15, bb));
  return STACKS.reduce((best, s) => (Math.abs(s - c) < Math.abs(best - c) ? s : best), STACKS[0]);
}

export function inShoveRange(
  key: string,
  stackBB: number,
  position: string,
): { inRange: boolean; percent: number } {
  const target = nearestStack(stackBB);
  const chart = CHARTS.find((c) => c.position === position && c.stack_bb === target);
  if (!chart) return { inRange: false, percent: 0 };
  return { inRange: expandRange(chart.shove_range).has(key), percent: chart.approx_percent ?? 0 };
}
