import type { TournamentState } from "./tournament";
import type { Action, HandState } from "./hand";
import { legalActions, potSize } from "./hand";
import { chenScore, handKey } from "./ranges";
import { score7, categoryOf } from "./handEval";
import { inShoveRange } from "./pushfold";
import { positionOf, rfiAction, vsOpenAction, vsOpenCovered, callOffAction, restealAction } from "./preflop";
import { icmPressure } from "./icm";

// Map the hero's seat to a Nash position label (UTG/MP/CO/BTN/SB) for range lookup.
function heroPosition(h: HandState, heroSeat: number): string {
  const n = h.seats.length;
  const dealt = (i: number) => h.seats[i].hole.length === 2 || i === heroSeat;
  const nActive = h.seats.filter((_, i) => dealt(i)).length;
  if (nActive <= 2) return "SB"; // heads-up: button/SB jams widest
  if (heroSeat === h.button) return "BTN";
  let p = 0;
  for (let k = 1; k <= n; k++) {
    const i = (h.button + k) % n;
    if (!dealt(i)) continue;
    p++;
    if (i === heroSeat) break;
  }
  if (p <= 2) return "SB"; // SB, or BB fallback (BB is not a first-in open spot)
  const stealDist = nActive - p; // 1 = CO, 2 = HJ, ...
  if (stealDist === 1) return "CO";
  if (stealDist <= 3) return "MP";
  return "UTG";
}

export type Rec = {
  bucket: "fold" | "check" | "call" | "raise";
  allIn?: boolean;
  regime: string;
  reason: string;
  icmNote?: string;
};

const CAT_WORDS = [
  "high card", "a pair", "two pair", "trips", "a straight", "a flush", "a full house", "quads", "a straight flush",
];

function icmContext(t: TournamentState) {
  const finalTable = t.fieldRemaining <= t.tableSize;
  const bubbleZone =
    t.fieldRemaining > t.paidPlaces &&
    t.fieldRemaining <= t.paidPlaces + Math.max(2, Math.round(t.paidPlaces * 0.12));
  const pressure = finalTable || bubbleZone;

  // At the final table the field is small enough for exact ICM — feed real stacks + the
  // payout ladder through icmPressure so the survival premium actually drives the decision.
  let dollars = 0;
  if (finalTable && t.seats && t.payouts) {
    const alive = t.seats.map((s, i) => ({ s, i })).filter((x) => x.s.stack > 0);
    const heroPos = alive.findIndex((x) => x.i === t.heroSeat);
    if (heroPos >= 0 && alive.length >= 2 && alive.length <= 10) {
      dollars = icmPressure(alive.map((x) => x.s.stack), t.payouts, heroPos);
    }
  }
  // tighten shifts call-off ranges one stack-band narrower when there's a survival premium.
  return { finalTable, bubbleZone, pressure, tighten: pressure ? 1 : 0, dollars };
}

// The "textbook" line at the hero's current decision (heuristic, ICM-aware).
export function recommend(t: TournamentState): Rec | null {
  const h = t.hand;
  if (!h || h.toAct !== t.heroSeat) return null;
  const s = h.seats[t.heroSeat];
  const la = legalActions(h);
  const bb = h.bb;
  const stackBB = (s.stack + s.committed) / bb;
  const chen = chenScore(s.hole);
  const key = handKey(s.hole);
  const facingBet = la.call > 0;
  // A voluntary preflop raise — NOT just blinds/antes. startHand posts blinds & antes via
  // post() (never applyAction), so lastAggressor stays -1 until a real raise. Using
  // `currentBet > bb` here misread every ante-level pot as raised, disabling the open &
  // Nash-jam branches for most of the tournament.
  const facingRaise = h.street === "preflop" && h.lastAggressor !== -1;
  const icm = icmContext(t);
  const premium = icm.dollars < 0 ? ` (~$${Math.abs(Math.round(icm.dollars))} of your equity is survival premium)` : "";
  const icmNote = !icm.pressure
    ? undefined
    : icm.finalTable
      ? `Final table: ICM adds a survival premium${premium} — lean tighter with marginal hands, apply pressure when you cover people.`
      : "Money bubble: survival premium is high — fold marginal spots, attack stacks that can't call.";

  if (h.street === "preflop") {
    if (stackBB <= 15) {
      const regime = "Short-stack push/fold";
      const pos = heroPosition(h, t.heroSeat);
      if (!facingRaise) {
        const sr = inShoveRange(key, stackBB, pos);
        // At <=5bb on the button/SB there's no folding — jam any two.
        const jamAny = stackBB <= 5 && (pos === "BTN" || pos === "SB");
        return sr.inRange || jamAny
          ? { bucket: "raise", allIn: true, regime, reason: `${stackBB.toFixed(0)}bb ${pos}: ${key} open-jams${jamAny && !sr.inRange ? " (≤5bb — jam any two)" : ` (Nash ~${sr.percent}%)`}.`, icmNote }
          : { bucket: "fold", regime, reason: `${key} is outside the ${pos} open-jam range at ${stackBB.toFixed(0)}bb (~${sr.percent}%).`, icmNote };
      }
      // Facing a raise short: call off a jam, or resteal (3-bet jam) over a live open.
      const aggr = h.lastAggressor;
      const openerPos = aggr >= 0 ? positionOf(h, aggr) : "UTG";
      if (aggr >= 0 && h.seats[aggr].allIn) {
        const act = callOffAction(key, openerPos, stackBB, icm.tighten);
        return act === "call"
          ? { bucket: "call", regime, reason: `${key} calls the ${openerPos} jam at ${stackBB.toFixed(0)}bb${icm.tighten ? " (ICM-tightened)" : ""}.`, icmNote }
          : { bucket: "fold", regime, reason: `${key} can't profitably call the ${openerPos} jam${icm.tighten ? " — ICM survival premium" : ""}.`, icmNote };
      }
      return restealAction(key, openerPos, stackBB) === "raise"
        ? { bucket: "raise", allIn: true, regime, reason: `${key}: 3-bet jam (resteal) over the ${openerPos} open.`, icmNote }
        : { bucket: "fold", regime, reason: `${key} folds to the ${openerPos} open at ${stackBB.toFixed(0)}bb.`, icmNote };
    }
    const regime = "Preflop";
    const heroPos = positionOf(h, t.heroSeat);
    if (!facingRaise) {
      return rfiAction(key, heroPos, stackBB) === "raise"
        ? { bucket: "raise", regime, reason: `${key}: a standard ${heroPos} open — raise and take the initiative.`, icmNote }
        : { bucket: la.check ? "check" : "fold", regime, reason: `${key} is outside the ${heroPos} opening range — ${la.check ? "check" : "fold"}.`, icmNote };
    }
    // Facing a single raise: use documented response ranges where the charts cover the spot.
    const openerPos = h.lastAggressor >= 0 ? positionOf(h, h.lastAggressor) : "UTG";
    if (vsOpenCovered(heroPos, openerPos)) {
      const act = vsOpenAction(key, openerPos, heroPos === "BB", stackBB);
      if (act === "raise") return { bucket: "raise", regime, reason: `${key} vs a ${openerPos} open: 3-bet for value.`, icmNote };
      if (act === "call") return { bucket: "call", regime, reason: `${key} vs a ${openerPos} open: call at this price${heroPos === "BB" ? " — the big blind defends wide" : ""}.`, icmNote };
      return { bucket: "fold", regime, reason: `${key} folds to a ${openerPos} open from ${heroPos}.`, icmNote };
    }
    // Uncovered spot (blind-vs-blind, vs a late open out of position): Chen fallback.
    if (chen >= 13) return { bucket: "raise", regime, reason: `${key} plays as a value 3-bet.`, icmNote };
    if (chen >= 9 && la.call <= s.stack * 0.12) return { bucket: "call", regime, reason: `${key} is a fine call at this price.`, icmNote };
    return { bucket: "fold", regime, reason: `${key} is a fold facing a raise.`, icmNote };
  }

  // Postflop
  const regime = "Postflop";
  const cat = categoryOf(score7([...s.hole, ...h.board]));
  const boardCat = categoryOf(score7(h.board)); // strength of the board by itself
  const heroBeatsBoard = cat > boardCat; // hole cards actually improve on the board
  const pot = potSize(h);
  const topBoard = Math.max(...h.board.map((c) => c.r));
  const holeR = s.hole.map((c) => c.r);
  const strongPair =
    (holeR[0] === holeR[1] && holeR[0] > topBoard) || // overpair
    holeR.includes(topBoard); // top pair (paired the highest board card)

  if (!facingBet) {
    return heroBeatsBoard && cat >= 1
      ? { bucket: "raise", regime, reason: `You have ${CAT_WORDS[cat]} — bet for value/protection.`, icmNote }
      : { bucket: "check", regime, reason: `Not much beyond the board yet — check.`, icmNote };
  }
  // Facing a bet. Two pair or better never folds to a single bet.
  if (heroBeatsBoard && cat >= 3)
    return { bucket: "raise", regime, reason: `${CAT_WORDS[cat]} is strong — raise for value.`, icmNote };
  if (heroBeatsBoard && cat === 2)
    return { bucket: "call", regime, reason: `Two pair is strong enough to continue — call.`, icmNote };
  if (heroBeatsBoard && cat === 1) {
    const ceiling = strongPair ? pot : pot * 0.4; // top pair / overpair call bigger bets than weak pairs
    return la.call <= ceiling
      ? {
          bucket: "call",
          regime,
          reason: `${strongPair ? "Top pair / overpair" : "A pair"} at a fair price — call.`,
          icmNote,
        }
      : { bucket: "fold", regime, reason: `Only a marginal pair facing a big bet — fold.`, icmNote };
  }
  return { bucket: "fold", regime, reason: `Your hand doesn't beat the board — fold.`, icmNote };
}

export type Grade = { verdict: "good" | "ok" | "mistake"; regime: string; note: string };

const RANK: Record<string, number> = { fold: 0, check: 1, call: 2, raise: 3 };

export function grade(rec: Rec, action: Action): Grade {
  const hero = action.type === "raise" ? "raise" : action.type;
  const base = rec.reason + (rec.icmNote ? " " + rec.icmNote : "");
  if (hero === rec.bucket) return { verdict: "good", regime: rec.regime, note: "Textbook. " + base };

  // Too passive — passing up the aggression the spot calls for.
  if (rec.bucket === "raise" && hero === "fold")
    return { verdict: "mistake", regime: rec.regime, note: "Too tight — this is a spot to get chips in. " + base };
  if (rec.bucket === "raise" && hero === "check")
    return { verdict: "mistake", regime: rec.regime, note: "You left value on the table — this should be a bet. " + base };

  // Too tight — folding a hand you should keep (over-folding is a real leak, not a free pass).
  if ((rec.bucket === "call" || rec.bucket === "check") && hero === "fold")
    return { verdict: "mistake", regime: rec.regime, note: "Too tight — you're giving up a hand you should keep. " + base };

  // Too loose — continuing where you should fold.
  if (rec.bucket === "fold" && RANK[hero] >= 2)
    return { verdict: "mistake", regime: rec.regime, note: "Too loose — better to give this up. " + base };

  if (Math.abs(RANK[rec.bucket] - RANK[hero]) === 1)
    return { verdict: "ok", regime: rec.regime, note: "Defensible, but the standard line differs. " + base };
  return { verdict: "ok", regime: rec.regime, note: base };
}
