import type { TournamentState } from "./tournament";
import type { Action, HandState } from "./hand";
import { legalActions, potSize } from "./hand";
import { chenScore, handKey } from "./ranges";
import { score7, categoryOf } from "./handEval";
import { inShoveRange } from "./pushfold";

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
  return { finalTable, bubbleZone, pressure, tighten: pressure ? 2 : 0 };
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
  const icmNote = !icm.pressure
    ? undefined
    : icm.finalTable
      ? "Final table: ICM adds a survival premium — lean tighter with marginal hands, apply pressure when you cover people."
      : "Money bubble: survival premium is high — fold marginal spots, attack stacks that can't call.";

  if (h.street === "preflop") {
    if (stackBB <= 15) {
      const regime = "Short-stack push/fold";
      if (!facingRaise) {
        const pos = heroPosition(h, t.heroSeat);
        const sr = inShoveRange(key, stackBB, pos);
        return sr.inRange
          ? { bucket: "raise", allIn: true, regime, reason: `${stackBB.toFixed(0)}bb ${pos}: ${key} is in the Nash open-jam range (~${sr.percent}% of hands).`, icmNote }
          : { bucket: "fold", regime, reason: `${key} is outside the ${pos} Nash open-jam range at ${stackBB.toFixed(0)}bb (~${sr.percent}% jam).`, icmNote };
      }
      return chen >= 11 + icm.tighten
        ? { bucket: "call", regime, reason: `${key} is strong enough to call off ${stackBB.toFixed(0)}bb.`, icmNote }
        : { bucket: "fold", regime, reason: `${key} isn't enough to call a jam for ${stackBB.toFixed(0)}bb.`, icmNote };
    }
    const regime = "Preflop";
    if (!facingRaise) {
      return chen >= 7
        ? { bucket: "raise", regime, reason: `${key}: open with a raise and take the initiative.`, icmNote }
        : { bucket: la.check ? "check" : "fold", regime, reason: `${key} is too weak to open — ${la.check ? "check" : "fold"}.`, icmNote };
    }
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
