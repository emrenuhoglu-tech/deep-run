import type { Card } from "./cards";
import type { HandState, Action } from "./hand";
import { legalActions, potSize } from "./hand";
import { score7, categoryOf } from "./handEval";
import { chenScore } from "./ranges";

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(x)));
}

// Rough made-hand strength 0..1 given hole + current board.
function madeStrength(hole: Card[], board: Card[]): number {
  if (board.length < 3) return Math.min(1, Math.max(0, chenScore(hole) / 20));
  const cat = categoryOf(score7([...hole, ...board]));
  return [0.15, 0.42, 0.62, 0.74, 0.83, 0.89, 0.94, 0.98, 1][cat];
}

// A serviceable heuristic opponent (not GTO — believable, non-broken).
export function botAction(state: HandState, i: number): Action {
  const s = state.seats[i];
  const la = legalActions(state);
  const bb = state.bb;
  const stackBB = (s.stack + s.committed) / bb;
  const rnd = Math.random();
  const pot = potSize(state);

  const raiseTo = (frac: number) =>
    clamp(state.currentBet + Math.round(frac * (pot || bb)), la.minRaiseTo, la.maxRaiseTo);

  if (state.street === "preflop") {
    const chen = chenScore(s.hole);

    // Short stack → push/fold.
    if (stackBB <= 12) {
      if (chen >= 8 && la.canRaise) return { type: "raise", to: la.maxRaiseTo };
      if (la.check) return { type: "check" };
      if (chen >= 11) return { type: "call" };
      return la.check ? { type: "check" } : { type: "fold" };
    }

    // Deeper: option / limped pot.
    if (la.check) {
      if (chen >= 12 && la.canRaise && rnd < 0.7) return { type: "raise", to: raiseTo(1.0) };
      return { type: "check" };
    }
    // Facing a bet.
    if (chen >= 13 && la.canRaise && rnd < 0.6) return { type: "raise", to: raiseTo(1.1) };
    if (chen >= 9 && (la.call <= s.stack * 0.15 || chen >= 11)) return { type: "call" };
    return { type: "fold" };
  }

  // Postflop.
  const strength = madeStrength(s.hole, state.board);
  if (la.check) {
    if (strength > 0.55 && la.canRaise && rnd < 0.7) return { type: "raise", to: raiseTo(0.6) };
    if (strength > 0.35 && la.canRaise && rnd < 0.3) return { type: "raise", to: raiseTo(0.5) };
    return { type: "check" };
  }
  // Facing a bet.
  const priceOk = la.call <= pot * 0.5;
  if (strength > 0.75 && la.canRaise && rnd < 0.5) return { type: "raise", to: raiseTo(0.9) };
  if (strength > 0.45 || (priceOk && strength > 0.3)) return { type: "call" };
  return { type: "fold" };
}
