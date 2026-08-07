// Generate isolated, randomized training spots that the existing engine can grade
// end-to-end (recommend + grade). Each spot is a minimal TournamentState.
import type { TournamentState } from "../../engine/tournament";
import type { HandState, Seat } from "../../engine/hand";
import { makeDeck, shuffle } from "../../engine/cards";
import type { Card } from "../../engine/cards";

export const CONCEPTS = ["Preflop (deep)", "Push/fold", "Postflop"] as const;
export type Concept = (typeof CONCEPTS)[number];

const BB = 100;
const POS_SEAT: Record<string, number> = { UTG: 3, MP: 6, CO: 7, BTN: 0, SB: 1, BB: 2 };
const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const rnd = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

export type Spot = { t: TournamentState; concept: Concept; label: string };

function baseSeats(deck: Card[], heroSeat: number, heroChips: number, heroHole: Card[]): Seat[] {
  const seats: Seat[] = [];
  for (let i = 0; i < 8; i++)
    seats.push({
      id: i, name: i === heroSeat ? "You" : "P" + i, isHero: i === heroSeat,
      stack: i === heroSeat ? heroChips : 100000,
      hole: i === heroSeat ? heroHole : [deck.pop()!, deck.pop()!],
      folded: false, allIn: false, committed: 0, totalCommitted: 0, hasActed: false,
    });
  return seats;
}

function wrap(hand: HandState, heroSeat: number, concept: Concept, label: string): Spot {
  const t = {
    hand, heroSeat, fieldRemaining: 100, paidPlaces: 15, tableSize: 8,
    seats: hand.seats.map((s) => ({ name: s.name, stack: s.stack, isHero: s.isHero })),
    payouts: [1000, 600, 400, 300, 200, 150, 100, 80],
  } as unknown as TournamentState;
  return { t, concept, label };
}

function preflopDeep(): Spot {
  const deck = shuffle(makeDeck());
  const hole = [deck.pop()!, deck.pop()!];
  const stackBB = rnd(30, 100);
  const facing = Math.random() < 0.5;
  if (!facing) {
    const pos = pick(["UTG", "MP", "CO", "BTN", "SB"]);
    const heroSeat = POS_SEAT[pos];
    const seats = baseSeats(deck, heroSeat, stackBB * BB, hole);
    seats[POS_SEAT.SB].committed = BB / 2;
    seats[POS_SEAT.BB].committed = BB;
    const hand: HandState = {
      seats, button: 0, board: [], deck, street: "preflop", toAct: heroSeat,
      currentBet: BB, minRaise: BB, lastAggressor: -1, bb: BB,
    };
    return wrap(hand, heroSeat, "Preflop (deep)", `${stackBB}bb in the ${pos}. Folded to you — open or fold?`);
  }
  const opener = pick(["UTG", "MP", "CO"]);
  const heroPos = pick(["BTN", "BB"]);
  const heroSeat = POS_SEAT[heroPos];
  const seats = baseSeats(deck, heroSeat, stackBB * BB, hole);
  seats[POS_SEAT.SB].committed = BB / 2;
  seats[POS_SEAT.BB].committed = BB;
  const raiseTo = Math.round(2.3 * BB);
  seats[POS_SEAT[opener]].committed = raiseTo;
  const hand: HandState = {
    seats, button: 0, board: [], deck, street: "preflop", toAct: heroSeat,
    currentBet: raiseTo, minRaise: BB, lastAggressor: POS_SEAT[opener], bb: BB,
  };
  return wrap(hand, heroSeat, "Preflop (deep)", `${stackBB}bb in the ${heroPos}. ${opener} opens to 2.3bb — your move?`);
}

function pushFold(): Spot {
  const deck = shuffle(makeDeck());
  const hole = [deck.pop()!, deck.pop()!];
  const stackBB = rnd(6, 15);
  const jam = Math.random() < 0.5;
  if (!jam) {
    const pos = pick(["UTG", "MP", "CO", "BTN", "SB"]);
    const heroSeat = POS_SEAT[pos];
    const seats = baseSeats(deck, heroSeat, stackBB * BB, hole);
    seats[POS_SEAT.SB].committed = BB / 2;
    seats[POS_SEAT.BB].committed = BB;
    const hand: HandState = {
      seats, button: 0, board: [], deck, street: "preflop", toAct: heroSeat,
      currentBet: BB, minRaise: BB, lastAggressor: -1, bb: BB,
    };
    return wrap(hand, heroSeat, "Push/fold", `${stackBB}bb in the ${pos}. Folded to you — open-jam or fold?`);
  }
  const jammer = pick(["UTG", "MP", "CO", "BTN"]);
  const heroSeat = POS_SEAT.BB;
  const seats = baseSeats(deck, heroSeat, stackBB * BB, hole);
  seats[POS_SEAT.SB].committed = BB / 2;
  seats[heroSeat].committed = BB;
  const js = POS_SEAT[jammer];
  seats[js].committed = stackBB * BB;
  seats[js].allIn = true;
  seats[js].stack = 0;
  const hand: HandState = {
    seats, button: 0, board: [], deck, street: "preflop", toAct: heroSeat,
    currentBet: stackBB * BB, minRaise: BB, lastAggressor: js, bb: BB,
  };
  return wrap(hand, heroSeat, "Push/fold", `${stackBB}bb in the BB. ${jammer} jams all-in — call or fold?`);
}

function postflop(): Spot {
  const deck = shuffle(makeDeck());
  const hole = [deck.pop()!, deck.pop()!];
  const heroSeat = 0;
  const stackBB = rnd(40, 100);
  const seats = baseSeats(deck, heroSeat, stackBB * BB, hole);
  const board = [deck.pop()!, deck.pop()!, deck.pop()!];
  const preflopPot = rnd(3, 7) * BB;
  seats[heroSeat].totalCommitted = preflopPot;
  seats[4].totalCommitted = preflopPot;
  const bet = Math.random() < 0.5 ? Math.round(preflopPot * (Math.random() < 0.5 ? 0.5 : 1)) : 0;
  if (bet > 0) {
    seats[4].committed = bet;
  }
  const hand: HandState = {
    seats, button: 0, board, deck, street: "flop", toAct: heroSeat,
    currentBet: bet, minRaise: BB, lastAggressor: bet > 0 ? 4 : -1, bb: BB,
  };
  const potbb = ((preflopPot * 2 + bet) / BB).toFixed(0);
  return wrap(hand, heroSeat, "Postflop", bet > 0 ? `Flop, ~${potbb}bb pot. Villain bets — call, raise or fold?` : `Flop, ~${potbb}bb pot. Checked to you — bet or check?`);
}

export function makeSpot(concept?: Concept): Spot {
  const c = concept ?? pick(CONCEPTS);
  if (c === "Push/fold") return pushFold();
  if (c === "Postflop") return postflop();
  return preflopDeep();
}
