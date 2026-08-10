// Two-axis range-recall: (stack depth × table size/position) resolved to the
// exact chart range(s) the engine grades against. Reads ONLY the curated chart
// JSONs via handsIn() — never invents ranges. Combos with no chart are not offered.
import preflopRaw from "../../content/preflop_charts.json";
import callRaw from "../../content/call_charts.json";
import pushRaw from "../../content/pushfold_charts.json";
import { shoveRange } from "../../engine/pushfold";
import { handsIn } from "../../engine/rangeNotation";

export type ChartPos = "UTG" | "MP" | "CO" | "BTN" | "SB";
export type TableSize = 3 | 4 | 6 | 8;
export type Kind = "jam" | "calloff" | "resteal" | "rfi" | "vsopen" | "bbdef";

const preflop = preflopRaw as {
  rfi: Record<string, Record<string, string>>;
  vs_open: Record<string, Record<string, { "3bet"?: string; call?: string }>>;
  bb_defense: Record<string, Record<string, { "3bet"?: string; call?: string }>>;
};
const call = callRaw as {
  call_off: Record<string, Record<string, string>>;
  resteal: Record<string, Record<string, string>>;
};
const push = (pushRaw as { charts: { stack_bb: number; position: string; approx_percent?: number }[] }).charts;

// Short stacks use the discrete push/fold + call-off + resteal charts; deep
// stacks the RFI / vs-open / BB-defense band charts.
export const STACKS = [6, 8, 10, 12, 15, 20, 40, 100];
export const TABLE_SIZES: TableSize[] = [3, 4, 6, 8];

// Same depth→band mapping as preflop.ts band() (not exported there).
const band = (bb: number) => (bb >= 70 ? "100" : bb >= 30 ? "40" : "20");

// `hero: true` → the position chip is the hero's seat; else it is the villain's
// (the jammer for call-off, the opener for resteal / vs-open / BB-defense).
export const KINDS: Record<Kind, { label: string; hero: boolean }> = {
  jam: { label: "Open-jam", hero: true },
  calloff: { label: "Call-off (BB)", hero: false },
  resteal: { label: "Resteal jam", hero: false },
  rfi: { label: "Open-raise", hero: true },
  vsopen: { label: "vs open (IP)", hero: false },
  bbdef: { label: "BB defense", hero: false },
};

// Seat → chart-position bucketing per table size, mirroring positionOf() in
// preflop.ts: BTN/SB/BB are the first three seats from the button, the last
// seat before the button is CO, the one before that folds into MP, the rest
// into UTG. `seat` is the real seat name at that table size.
export type PosOption = { chartPos: ChartPos; seat: string };
const SEATS: Record<TableSize, PosOption[]> = {
  3: [
    { chartPos: "BTN", seat: "BTN" },
    { chartPos: "SB", seat: "SB" },
  ],
  4: [
    { chartPos: "CO", seat: "CO" },
    { chartPos: "BTN", seat: "BTN" },
    { chartPos: "SB", seat: "SB" },
  ],
  6: [
    { chartPos: "UTG", seat: "UTG" },
    { chartPos: "MP", seat: "HJ" },
    { chartPos: "CO", seat: "CO" },
    { chartPos: "BTN", seat: "BTN" },
    { chartPos: "SB", seat: "SB" },
  ],
  8: [
    { chartPos: "UTG", seat: "UTG–LJ" },
    { chartPos: "MP", seat: "HJ" },
    { chartPos: "CO", seat: "CO" },
    { chartPos: "BTN", seat: "BTN" },
    { chartPos: "SB", seat: "SB" },
  ],
};

// Honest label: "HJ→MP" when the real seat folds into a different chart bucket.
export function posLabel(p: PosOption): string {
  return p.seat === p.chartPos ? p.seat : `${p.seat}→${p.chartPos}`;
}

// Chart kinds that exist at this stack (no 6bb resteal chart in the JSON).
export function kindsFor(stack: number): Kind[] {
  if (stack <= 15) return stack >= 8 ? ["jam", "calloff", "resteal"] : ["jam", "calloff"];
  return ["rfi", "vsopen", "bbdef"];
}

// Positions offerable for a kind at a table size. vs_open charts only cover
// UTG/MP/CO openers (BTN/SB opens are only charted as BB defense), so vs-open
// is empty at 3-max.
export function positionsFor(kind: Kind, table: TableSize): PosOption[] {
  const seats = SEATS[table];
  if (kind === "vsopen")
    return seats.filter((p) => p.chartPos === "UTG" || p.chartPos === "MP" || p.chartPos === "CO");
  return seats;
}

export type RangePart = { action: string; set: Set<string>; title: string };
export type Spot = {
  kind: Kind;
  stack: number;
  table: TableSize;
  pos: PosOption;
  title: string;
  prompt: string;
  actions: string[]; // grading-priority order, "Fold" last
  ranges: RangePart[]; // grading-priority order (fold = in none of them)
  percent?: number; // chart's approx_percent (push/fold charts only)
};

export function buildSpot(kind: Kind, stack: number, table: TableSize, pos: PosOption): Spot | null {
  const max = `${table}-max`;
  const pl = posLabel(pos);
  const base = { kind, stack, table, pos };
  switch (kind) {
    case "jam": {
      const r = shoveRange(stack, pos.chartPos);
      if (!r) return null;
      return {
        ...base,
        title: `${max} · ${pl} · ${stack}bb · Open-jam`,
        prompt: `Folded to you in the ${pos.seat} at ${stack}bb. Open-jam or fold?`,
        actions: ["Jam", "Fold"],
        ranges: [{ action: "Jam", set: handsIn(r), title: `${pos.chartPos} open-jam · ${stack}bb` }],
        percent: push.find((c) => c.stack_bb === stack && c.position === pos.chartPos)?.approx_percent,
      };
    }
    case "calloff": {
      const r = call.call_off[String(stack)]?.[pos.chartPos];
      if (!r) return null;
      return {
        ...base,
        title: `${max} · vs ${pl} jam · ${stack}bb · Call-off`,
        prompt: `${pos.seat} open-jams ${stack}bb; you're in the BB. Call or fold?`,
        actions: ["Call", "Fold"],
        ranges: [{ action: "Call", set: handsIn(r), title: `BB call-off vs ${pos.chartPos} jam · ${stack}bb` }],
      };
    }
    case "resteal": {
      const bucket = pos.chartPos === "UTG" || pos.chartPos === "MP" ? "early" : "late";
      const r = call.resteal[String(stack)]?.[bucket];
      if (!r) return null;
      return {
        ...base,
        title: `${max} · vs ${pl} open · ${stack}bb · Resteal`,
        prompt: `${pos.seat} opens (not all-in); you're in the blinds with ${stack}bb. 3-bet jam or fold?`,
        actions: ["Jam", "Fold"],
        ranges: [{ action: "Jam", set: handsIn(r), title: `Resteal jam vs ${bucket} open · ${stack}bb` }],
      };
    }
    case "rfi": {
      const r = preflop.rfi[band(stack)]?.[pos.chartPos];
      if (!r) return null;
      return {
        ...base,
        title: `${max} · ${pl} · ${stack}bb · Open-raise`,
        prompt: `Folded to you in the ${pos.seat}, ${stack}bb deep. Open-raise or fold?`,
        actions: ["Raise", "Fold"],
        ranges: [{ action: "Raise", set: handsIn(r), title: `${pos.chartPos} opening range · ${stack}bb` }],
      };
    }
    case "vsopen":
    case "bbdef": {
      const t = (kind === "bbdef" ? preflop.bb_defense : preflop.vs_open)[band(stack)]?.[pos.chartPos];
      if (!t || (!t["3bet"] && !t.call)) return null;
      const ranges: RangePart[] = [];
      if (t["3bet"]) ranges.push({ action: "3-bet", set: handsIn(t["3bet"]), title: `3-bet vs ${pos.chartPos} open · ${stack}bb` });
      if (t.call) ranges.push({ action: "Call", set: handsIn(t.call), title: `Call vs ${pos.chartPos} open · ${stack}bb` });
      const hero = kind === "bbdef" ? "you're in the BB" : "you're in position (CO/BTN)";
      return {
        ...base,
        title: `${max} · vs ${pl} open · ${stack}bb · ${kind === "bbdef" ? "BB defense" : "IP response"}`,
        prompt: `${pos.seat} opens; ${hero}, ${stack}bb deep. 3-bet, call or fold?`,
        actions: [...ranges.map((r) => r.action), "Fold"],
        ranges,
      };
    }
  }
}

const DESC = "AKQJT98765432";
export const ALL_KEYS: string[] = (() => {
  const out: string[] = [];
  for (let i = 0; i < 13; i++)
    for (let j = 0; j < 13; j++)
      out.push(i === j ? DESC[i] + DESC[i] : i < j ? DESC[i] + DESC[j] + "s" : DESC[j] + DESC[i] + "o");
  return out;
})();

// Walk the ranges in grading-priority order (same as vsOpenAction: 3-bet before
// call); a hand in none of them is a fold.
export function correctAction(spot: Spot, key: string): string {
  for (const r of spot.ranges) if (r.set.has(key)) return r.action;
  return "Fold";
}

// Balanced sampling: pick an answer class uniformly (so tight charts still show
// in-range hands), then a random hand within it. Pure question selection —
// grading always goes through the chart sets above.
export function sampleKey(spot: Spot): string {
  const classes: string[][] = [];
  const used = new Set<string>();
  for (const r of spot.ranges) {
    const mine = [...r.set].filter((k) => !used.has(k));
    for (const k of mine) used.add(k);
    if (mine.length) classes.push(mine);
  }
  const fold = ALL_KEYS.filter((k) => !used.has(k));
  if (fold.length) classes.push(fold);
  const cls = classes[Math.floor(Math.random() * classes.length)];
  return cls[Math.floor(Math.random() * cls.length)];
}
