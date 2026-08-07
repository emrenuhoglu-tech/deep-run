// Monte-Carlo hand equity (win + tie/2) vs one opponent — drawn from a modeled
// range or uniformly random. Pure TS; fast enough for a per-decision readout.
import { makeDeck, shuffle } from "./cards";
import type { Card } from "./cards";
import { score7 } from "./handEval";
import { handKey } from "./ranges";
import { positionOf } from "./preflop";
import { shoveRange } from "./pushfold";
import { handsIn } from "./rangeNotation";
import { legalActions, potSize } from "./hand";
import type { TournamentState } from "./tournament";

export function equity(hole: Card[], board: Card[], oppRange: Set<string> | null, iters = 300): number {
  const known = [...hole, ...board];
  const inKnown = (c: Card) => known.some((k) => k.r === c.r && k.s === c.s);
  const full = makeDeck().filter((c) => !inKnown(c));
  const need = 5 - board.length;
  let acc = 0;
  for (let it = 0; it < iters; it++) {
    const d = shuffle(full.slice());
    // opponent hand: sample a pair matching the range (else any).
    let ai = 0;
    let bi = 1;
    if (oppRange) {
      let found = false;
      for (let tries = 0; tries < 60 && !found; tries++) {
        const a = Math.floor(Math.random() * d.length);
        let b = Math.floor(Math.random() * d.length);
        if (a === b) b = (b + 1) % d.length;
        if (oppRange.has(handKey([d[a], d[b]]))) {
          ai = a;
          bi = b;
          found = true;
        }
      }
    }
    const opp = [d[ai], d[bi]];
    const rest = d.filter((_, k) => k !== ai && k !== bi);
    const run = [...board, ...rest.slice(0, need)];
    const hs = score7([...hole, ...run]);
    const os = score7([...opp, ...run]);
    acc += hs > os ? 1 : hs === os ? 0.5 : 0;
  }
  return acc / iters;
}

// Equity for the hero's current decision, plus call/fold EV when facing an all-in.
export function equityForSpot(
  t: TournamentState,
): { pct: number; model: string; ev?: { call: number; fold: number } } {
  const h = t.hand!;
  const hero = h.seats[t.heroSeat];
  const board = h.board;
  const jammer = h.lastAggressor >= 0 ? h.seats[h.lastAggressor] : null;

  if (h.street === "preflop" && jammer?.allIn) {
    const jp = positionOf(h, h.lastAggressor);
    const stackBB = (hero.stack + hero.committed) / h.bb;
    const rStr = shoveRange(stackBB, jp === "BB" ? "SB" : jp);
    const pct = equity(hero.hole, board, rStr ? handsIn(rStr) : null, 400);
    const callCost = legalActions(h).call;
    const potAfter = potSize(h) + callCost;
    return { pct, model: `a ${jp} jam range`, ev: { call: pct * potAfter - callCost, fold: 0 } };
  }
  return { pct: equity(hero.hole, board, null, 300), model: "a random hand" };
}
