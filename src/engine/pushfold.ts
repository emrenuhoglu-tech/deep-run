// Nash open-shove ranges from content/pushfold_charts.json, resolved via the
// shared range-notation parser.
import data from "../content/pushfold_charts.json";
import { inRange } from "./rangeNotation";

type Chart = { stack_bb: number; position: string; shove_range: string; approx_percent?: number };
const CHARTS = (data as { charts: Chart[] }).charts;

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
  return { inRange: inRange(key, chart.shove_range), percent: chart.approx_percent ?? 0 };
}
