// Postflop draw detection (flop/turn only). Pure TS — counts flush draws and
// straight draws the hero actually contributes to, for semi-bluff / peel logic.
import type { Card } from "./cards";

export type Draw = {
  flushDraw: boolean;
  oesd: boolean; // open-ended (8-out) straight draw
  gutshot: boolean; // 4-out straight draw
  strong: boolean; // flush draw or OESD — worth continuing / semi-bluffing
  outs: number;
  label: string;
};

const NONE: Draw = { flushDraw: false, oesd: false, gutshot: false, strong: false, outs: 0, label: "" };

function has5Straight(set: Set<number>): boolean {
  const s = new Set(set);
  if (s.has(14)) s.add(1); // ace-low
  for (let lo = 1; lo <= 10; lo++) {
    let ok = true;
    for (let k = 0; k < 5; k++) if (!s.has(lo + k)) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}

// Distinct ranks that, if drawn, complete a 5-card straight.
function straightOuts(ranks: number[]): number {
  const base = new Set(ranks);
  let outs = 0;
  for (let r = 2; r <= 14; r++) {
    const set = new Set(base);
    set.add(r);
    if (has5Straight(set)) outs++;
  }
  return outs;
}

export function drawStrength(hole: Card[], board: Card[]): Draw {
  if (board.length < 3 || board.length >= 5) return NONE;

  // flush draw — 4 to a flush with at least one hole card in the suit
  const suit = [0, 0, 0, 0];
  const holeSuit = [0, 0, 0, 0];
  for (const c of board) suit[c.s]++;
  for (const c of hole) {
    suit[c.s]++;
    holeSuit[c.s]++;
  }
  let flushDraw = false;
  for (let s = 0; s < 4; s++) if (suit[s] === 4 && holeSuit[s] >= 1) flushDraw = true;

  // straight draw — the hero's own straight-completing ranks (board draws excluded)
  const sd = Math.max(
    0,
    straightOuts([...hole, ...board].map((c) => c.r)) - straightOuts(board.map((c) => c.r)),
  );
  const oesd = sd >= 2;
  const gutshot = sd === 1;

  const outs = (flushDraw ? 9 : 0) + (oesd ? 8 : gutshot ? 4 : 0) - (flushDraw && (oesd || gutshot) ? 2 : 0);
  const strong = flushDraw || oesd;
  const label =
    flushDraw && (oesd || gutshot)
      ? "Flush + straight draw"
      : flushDraw
        ? "Flush draw"
        : oesd
          ? "Open-ended straight draw"
          : gutshot
            ? "Gutshot straight draw"
            : "";

  return { flushDraw, oesd, gutshot, strong, outs, label };
}
