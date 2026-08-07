// Documented preflop ranges (content/preflop_charts.json) resolved for a live
// decision: RFI by position, response vs a single open, and BB defense — across
// 100 / 40 / 20bb depth bands. Replaces the Chen heuristic in the deep branch.
import chartsRaw from "../content/preflop_charts.json";
import callRaw from "../content/call_charts.json";
import type { HandState } from "./hand";
import { inRange } from "./rangeNotation";

export type Pos = "UTG" | "MP" | "CO" | "BTN" | "SB" | "BB";
type Depth = "100" | "40" | "20";
type Response = { "3bet"?: string; call?: string };

const charts = chartsRaw as {
  rfi: Record<Depth, Record<string, string>>;
  vs_open: Record<Depth, Record<string, Response>>;
  bb_defense: Record<Depth, Record<string, Response>>;
};
const callCharts = callRaw as {
  call_off: Record<string, Record<string, string>>; // [stack][jammerPos] → calling range
  resteal: Record<string, Record<string, string>>; // [stack][early|late] → 3bet-jam range
};

// The five chart positions; the blinds' own jams/opens fold BB into SB.
function chartPos(p: Pos): "UTG" | "MP" | "CO" | "BTN" | "SB" {
  return p === "BB" ? "SB" : p;
}

function band(stackBB: number): Depth {
  if (stackBB >= 70) return "100";
  if (stackBB >= 30) return "40";
  return "20";
}

// Seat → position label, walking dealt-in seats clockwise from the button.
export function positionOf(h: HandState, seat: number): Pos {
  const n = h.seats.length;
  const dealt: number[] = [];
  for (let k = 0; k < n; k++) {
    const i = (h.button + k) % n;
    if (h.seats[i].hole.length === 2) dealt.push(i);
  }
  const m = dealt.length;
  const p = dealt.indexOf(seat);
  if (p < 0) return "UTG";
  if (m === 2) return p === 0 ? "SB" : "BB"; // heads-up: button posts the SB
  if (p === 0) return "BTN";
  if (p === 1) return "SB";
  if (p === 2) return "BB";
  if (p === m - 1) return "CO";
  if (p === m - 2) return "MP"; // hijack folded into the MP bucket
  return "UTG";
}

// Should the hero open first-in? "raise" | "fold".
export function rfiAction(key: string, pos: Pos, stackBB: number): "raise" | "fold" {
  const r = charts.rfi[band(stackBB)]?.[pos];
  return r && inRange(key, r) ? "raise" : "fold";
}

// Response facing a single open. isBB → use the wide big-blind-defense tables.
export function vsOpenAction(
  key: string,
  opener: Pos,
  isBB: boolean,
  stackBB: number,
): "raise" | "call" | "fold" {
  const table = (isBB ? charts.bb_defense : charts.vs_open)[band(stackBB)]?.[opener];
  if (!table) return "fold";
  if (table["3bet"] && inRange(key, table["3bet"])) return "raise";
  if (table.call && inRange(key, table.call)) return "call";
  return "fold";
}

// Whether the chart set covers this facing-a-raise spot (else the caller falls back to Chen).
export function vsOpenCovered(heroPos: Pos, openerPos: Pos): boolean {
  if (heroPos === "BB") return true; // bb_defense covers every opener
  const ip = heroPos === "CO" || heroPos === "BTN";
  return ip && (openerPos === "UTG" || openerPos === "MP" || openerPos === "CO");
}

const CALL_STACKS = [6, 8, 10, 12, 15];
const RESTEAL_STACKS = [8, 10, 12, 15];
function nearestIdx(list: number[], bb: number): number {
  const c = Math.max(list[0], Math.min(list[list.length - 1], bb));
  let best = 0;
  for (let i = 1; i < list.length; i++) if (Math.abs(list[i] - c) < Math.abs(list[best] - c)) best = i;
  return best;
}

// Should the hero CALL an all-in jam? `tighten` shifts to a deeper (narrower) chart for ICM pressure.
export function callOffAction(key: string, jammer: Pos, stackBB: number, tighten = 0): "call" | "fold" {
  const i = Math.min(CALL_STACKS.length - 1, nearestIdx(CALL_STACKS, stackBB) + tighten);
  const r = callCharts.call_off[String(CALL_STACKS[i])]?.[chartPos(jammer)];
  return r && inRange(key, r) ? "call" : "fold";
}

// Should the hero 3-bet-JAM (resteal) over a single non-all-in open?
export function restealAction(key: string, opener: Pos, stackBB: number): "raise" | "fold" {
  const bucket = opener === "UTG" || opener === "MP" ? "early" : "late";
  const r = callCharts.resteal[String(RESTEAL_STACKS[nearestIdx(RESTEAL_STACKS, stackBB)])]?.[bucket];
  return r && inRange(key, r) ? "raise" : "fold";
}
