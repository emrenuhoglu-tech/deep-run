import type { Card } from "./cards";
import { makeDeck, shuffle } from "./cards";
import { score7 } from "./handEval";

// A single No-Limit Hold'em hand as a UI-drivable state machine.
// The driver applies actions (from the human or a bot) one at a time; the engine
// advances the actor / street / showdown. Handles antes, blinds, all-ins and side pots.

export type Street = "preflop" | "flop" | "turn" | "river" | "complete";

export type Seat = {
  id: number;
  name: string;
  isHero: boolean;
  stack: number; // chips behind
  hole: Card[];
  folded: boolean;
  allIn: boolean;
  committed: number; // chips in pot THIS street
  totalCommitted: number; // chips in pot THIS hand
  hasActed: boolean; // acted since the last aggression this street
};

export type Pot = { amount: number; eligible: number[] };
export type HandResult = {
  payouts: number[]; // gross chips returned to each seat
  board: Card[];
  revealed: Record<number, Card[]>;
  pots: Pot[];
};

export type HandState = {
  seats: Seat[];
  button: number;
  board: Card[];
  deck: Card[];
  street: Street;
  toAct: number; // seat to act, or -1
  currentBet: number; // max committed this street
  minRaise: number; // min legal raise increment
  lastAggressor: number;
  bb: number;
  results?: HandResult;
};

export type Action =
  | { type: "fold" }
  | { type: "check" }
  | { type: "call" }
  | { type: "raise"; to: number };

const inHand = (s: Seat) => !s.folded;
const canAct = (s: Seat) => !s.folded && !s.allIn;

function nextIdx(seats: Seat[], from: number, pred: (s: Seat) => boolean): number {
  const n = seats.length;
  for (let k = 1; k <= n; k++) {
    const i = (from + k) % n;
    if (pred(seats[i])) return i;
  }
  return -1;
}
function firstFrom(seats: Seat[], from: number, pred: (s: Seat) => boolean): number {
  const n = seats.length;
  for (let k = 0; k < n; k++) {
    const i = (from + k) % n;
    if (pred(seats[i])) return i;
  }
  return -1;
}

export function startHand(opts: {
  stacks: number[];
  names: string[];
  heroSeat: number;
  button: number;
  sb: number;
  bb: number;
  ante: number;
}): HandState {
  const deck = shuffle(makeDeck());
  const seats: Seat[] = opts.stacks.map((st, i) => ({
    id: i,
    name: opts.names[i],
    isHero: i === opts.heroSeat,
    stack: st,
    hole: [],
    folded: st <= 0,
    allIn: false,
    committed: 0,
    totalCommitted: 0,
    hasActed: false,
  }));
  for (let r = 0; r < 2; r++) for (const s of seats) if (!s.folded) s.hole.push(deck.pop()!);

  const state: HandState = {
    seats,
    button: opts.button,
    board: [],
    deck,
    street: "preflop",
    toAct: -1,
    currentBet: 0,
    minRaise: opts.bb,
    lastAggressor: -1,
    bb: opts.bb,
  };

  const post = (s: Seat, amt: number) => {
    const a = Math.min(amt, s.stack);
    s.stack -= a;
    s.committed += a;
    if (s.stack === 0) s.allIn = true;
  };
  if (opts.ante > 0) for (const s of seats) if (inHand(s)) post(s, opts.ante);

  const nActive = seats.filter(inHand).length;
  let sbSeat: number;
  let bbSeat: number;
  let firstAct: number;
  if (nActive === 2) {
    sbSeat = opts.button;
    bbSeat = nextIdx(seats, opts.button, inHand);
    firstAct = opts.button;
  } else {
    sbSeat = nextIdx(seats, opts.button, inHand);
    bbSeat = nextIdx(seats, sbSeat, inHand);
    firstAct = nextIdx(seats, bbSeat, inHand);
  }
  // Blinds post on top of any ante already committed → committed = ante + blind.
  post(seats[sbSeat], opts.sb);
  post(seats[bbSeat], opts.bb);
  state.currentBet = seats[bbSeat].committed;
  state.minRaise = opts.bb;

  state.toAct = firstFrom(seats, firstAct, canAct);
  // If nobody can act (all all-in from posting), run it out.
  if (state.toAct === -1 || seats.filter(canAct).length === 0) runoutAndShowdown(state);
  return state;
}

export function legalActions(state: HandState) {
  const s = state.seats[state.toAct];
  const toCall = state.currentBet - s.committed;
  const call = Math.min(toCall, s.stack);
  const maxTo = s.committed + s.stack; // all-in total
  const minRaiseTo = Math.min(maxTo, state.currentBet + state.minRaise);
  return {
    fold: true,
    check: toCall === 0,
    call, // chips needed to call
    canRaise: maxTo > state.currentBet,
    minRaiseTo,
    maxRaiseTo: maxTo,
  };
}

export function applyAction(state: HandState, action: Action): HandState {
  const i = state.toAct;
  const s = state.seats[i];
  const toCall = state.currentBet - s.committed;

  if (action.type === "fold") {
    s.folded = true;
    s.hasActed = true;
  } else if (action.type === "check") {
    s.hasActed = true;
  } else if (action.type === "call") {
    const amt = Math.min(toCall, s.stack);
    s.stack -= amt;
    s.committed += amt;
    if (s.stack === 0) s.allIn = true;
    s.hasActed = true;
  } else {
    const to = Math.min(action.to, s.committed + s.stack);
    const inc = to - state.currentBet;
    const put = to - s.committed;
    s.stack -= put;
    s.committed = to;
    if (s.stack === 0) s.allIn = true;
    if (inc >= state.minRaise) state.minRaise = inc;
    state.currentBet = to;
    state.lastAggressor = i;
    for (const o of state.seats) if (canAct(o) && o.id !== i) o.hasActed = false;
    s.hasActed = true;
  }

  advance(state);
  return state;
}

function roundClosed(state: HandState): boolean {
  const active = state.seats.filter(canAct);
  if (active.length === 0) return true;
  return active.every((s) => s.hasActed && s.committed === state.currentBet);
}

function advance(state: HandState) {
  const live = state.seats.filter(inHand);
  if (live.length === 1) {
    endUncontested(state, live[0].id);
    return;
  }
  if (roundClosed(state)) {
    nextStreet(state);
    return;
  }
  state.toAct = nextIdx(state.seats, state.toAct, canAct);
}

function deal(state: HandState, n: number) {
  for (let k = 0; k < n; k++) state.board.push(state.deck.pop()!);
}

function nextStreet(state: HandState) {
  for (const s of state.seats) {
    s.totalCommitted += s.committed;
    s.committed = 0;
    s.hasActed = false;
  }
  state.currentBet = 0;
  state.minRaise = state.bb;
  state.lastAggressor = -1;

  if (state.street === "river") {
    showdown(state);
    return;
  }
  if (state.street === "preflop") {
    state.street = "flop";
    deal(state, 3);
  } else if (state.street === "flop") {
    state.street = "turn";
    deal(state, 1);
  } else {
    state.street = "river";
    deal(state, 1);
  }

  if (state.seats.filter(canAct).length <= 1) {
    runoutAndShowdown(state);
    return;
  }
  // Postflop action opens with the first active seat left of the button.
  state.toAct = nextIdx(state.seats, state.button, canAct);
}

function runoutAndShowdown(state: HandState) {
  for (const s of state.seats) {
    s.totalCommitted += s.committed;
    s.committed = 0;
  }
  while (state.board.length < 5) state.board.push(state.deck.pop()!);
  showdown(state);
}

export function computePots(seats: Seat[]): Pot[] {
  const pots: Pot[] = [];
  const levels = Array.from(new Set(seats.map((s) => s.totalCommitted).filter((c) => c > 0))).sort(
    (a, b) => a - b,
  );
  let prev = 0;
  for (const L of levels) {
    const layer = L - prev;
    const contributors = seats.filter((s) => s.totalCommitted >= L);
    const amount = layer * contributors.length;
    const eligible = contributors.filter((s) => !s.folded).map((s) => s.id);
    if (amount > 0) {
      if (eligible.length > 0) pots.push({ amount, eligible });
      else if (pots.length) pots[pots.length - 1].amount += amount;
    }
    prev = L;
  }
  return pots;
}

function showdown(state: HandState) {
  const n = state.seats.length;
  const pots = computePots(state.seats);
  const payouts = new Array(n).fill(0);
  const revealed: Record<number, Card[]> = {};

  for (const pot of pots) {
    let best = -1;
    let winners: number[] = [];
    for (const id of pot.eligible) {
      const sc = score7([...state.seats[id].hole, ...state.board]);
      revealed[id] = state.seats[id].hole;
      if (sc > best) {
        best = sc;
        winners = [id];
      } else if (sc === best) winners.push(id);
    }
    const share = Math.floor(pot.amount / winners.length);
    const remainder = pot.amount - share * winners.length;
    for (const w of winners) payouts[w] += share;
    if (remainder > 0) payouts[winners[0]] += remainder; // odd chip → first eligible
  }

  for (let i = 0; i < n; i++) state.seats[i].stack += payouts[i];
  state.results = { payouts, board: [...state.board], revealed, pots };
  state.street = "complete";
  state.toAct = -1;
}

function endUncontested(state: HandState, winnerId: number) {
  for (const s of state.seats) {
    s.totalCommitted += s.committed;
    s.committed = 0;
  }
  const total = state.seats.reduce((a, s) => a + s.totalCommitted, 0);
  const n = state.seats.length;
  const payouts = new Array(n).fill(0);
  payouts[winnerId] = total;
  state.seats[winnerId].stack += total;
  state.results = { payouts, board: [...state.board], revealed: {}, pots: [{ amount: total, eligible: [winnerId] }] };
  state.street = "complete";
  state.toAct = -1;
}

export function potSize(state: HandState): number {
  return state.seats.reduce((a, s) => a + s.committed + s.totalCommitted, 0);
}

export function snapshot(state: HandState): HandState {
  return structuredClone(state);
}
