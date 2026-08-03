import type { HandState, Action } from "./hand";
import { startHand, applyAction } from "./hand";
import { botAction } from "./opponent";
import { levelAt } from "./blinds";
import type { Level } from "./blinds";

export type TSeat = { name: string; stack: number; isHero: boolean };

export type TournamentState = {
  entrants: number;
  startStack: number;
  tableSize: number;
  buyin: number;
  handsPerLevel: number;
  totalChips: number;
  payouts: number[];
  paidPlaces: number;
  fieldRemaining: number;
  seats: TSeat[];
  heroSeat: number;
  button: number;
  level: number;
  levelShown: number;
  blinds: Level;
  handsThisLevel: number;
  handNo: number;
  status: "playing" | "busted" | "won";
  heroFinish?: number;
  cash: number;
  prevStacks: number[];
  hand?: HandState;
  message: string;
};

const NAMES = [
  "Ivey", "Negreanu", "Polk", "Selbst", "Hellmuth", "Chidwick", "Bonomo", "Foxen",
  "Schindler", "Kornuth", "Watson", "Holz", "Addamo", "Yan", "Lehr", "Kolev",
];

function makePayouts(entrants: number, buyin: number): number[] {
  const pool = entrants * buyin;
  const paid = Math.max(1, Math.round(entrants * 0.15));
  const w: number[] = [];
  for (let i = 0; i < paid; i++) w.push(Math.pow(0.72, i));
  const sum = w.reduce((a, b) => a + b, 0);
  return w.map((x) => Math.round((x / sum) * pool));
}

function nextAlive(seats: TSeat[], from: number): number {
  const n = seats.length;
  for (let k = 1; k <= n; k++) {
    const i = (from + k) % n;
    if (seats[i].stack > 0) return i;
  }
  return from;
}

export function createTournament(opts?: {
  entrants?: number;
  startStack?: number;
  tableSize?: number;
  buyin?: number;
  handsPerLevel?: number;
}): TournamentState {
  const entrants = opts?.entrants ?? 120;
  const startStack = opts?.startStack ?? 15000;
  const tableSize = opts?.tableSize ?? 8;
  const buyin = opts?.buyin ?? 100;
  const handsPerLevel = opts?.handsPerLevel ?? 10;

  const seats: TSeat[] = [];
  for (let i = 0; i < tableSize; i++) {
    seats.push({
      name: i === 0 ? "You" : NAMES[(i * 3) % NAMES.length],
      stack: startStack,
      isHero: i === 0,
    });
  }

  return {
    entrants,
    startStack,
    tableSize,
    buyin,
    handsPerLevel,
    totalChips: entrants * startStack,
    payouts: makePayouts(entrants, buyin),
    paidPlaces: makePayouts(entrants, buyin).length,
    fieldRemaining: entrants,
    seats,
    heroSeat: 0,
    button: tableSize - 1,
    level: 0,
    levelShown: 0,
    blinds: levelAt(0),
    handsThisLevel: 0,
    handNo: 0,
    status: "playing",
    cash: 0,
    prevStacks: seats.map((s) => s.stack),
    message: "",
  };
}

export function avgStack(t: TournamentState): number {
  return Math.round(t.totalChips / Math.max(1, t.fieldRemaining));
}

function stepBots(t: TournamentState) {
  const h = t.hand;
  if (!h) return;
  let guard = 0;
  while (h.street !== "complete" && h.toAct !== -1 && h.toAct !== t.heroSeat) {
    if (++guard > 500) break;
    applyAction(h, botAction(h, h.toAct));
  }
}

export function startNextHand(t: TournamentState) {
  if (t.status !== "playing") return;
  t.button = nextAlive(t.seats, t.button);
  const lvl = levelAt(t.level);
  t.blinds = lvl;
  t.levelShown = t.level;
  const aliveCount = t.seats.filter((s) => s.stack > 0).length;
  const perSeatAnte = lvl.ante > 0 ? Math.max(1, Math.round(lvl.ante / Math.max(1, aliveCount))) : 0;

  t.prevStacks = t.seats.map((s) => s.stack);
  t.hand = startHand({
    stacks: t.seats.map((s) => s.stack),
    names: t.seats.map((s) => s.name),
    heroSeat: t.heroSeat,
    button: t.button,
    sb: lvl.sb,
    bb: lvl.bb,
    ante: perSeatAnte,
  });
  t.handNo += 1;
  t.handsThisLevel += 1;
  if (t.handsThisLevel >= t.handsPerLevel) {
    t.level += 1;
    t.handsThisLevel = 0;
  }
  stepBots(t);
}

export function heroToAct(t: TournamentState): boolean {
  return !!t.hand && t.hand.street !== "complete" && t.hand.toAct === t.heroSeat;
}
export function handOver(t: TournamentState): boolean {
  return !!t.hand && t.hand.street === "complete";
}

export function heroAct(t: TournamentState, action: Action) {
  if (!heroToAct(t)) return;
  applyAction(t.hand!, action);
  stepBots(t);
}

// Settle a completed hand into the field, then (if the hero survives) deal the next.
export function nextHand(t: TournamentState) {
  settle(t);
  if (t.status === "playing") startNextHand(t);
}

function settle(t: TournamentState) {
  const h = t.hand;
  if (!h) return;

  // Write chip results back to the table.
  for (let i = 0; i < t.seats.length; i++) t.seats[i].stack = h.seats[i].stack;

  // Busts at the hero's table this hand.
  let tableBusts = 0;
  for (let i = 0; i < t.seats.length; i++) {
    if (!t.seats[i].isHero && t.prevStacks[i] > 0 && t.seats[i].stack === 0) tableBusts++;
  }
  const heroBusted = t.seats[t.heroSeat].stack === 0;

  // Field shrinks by table busts.
  t.fieldRemaining -= tableBusts;

  if (heroBusted) {
    // Hero finishes at the current field size + 1 (they are one of the just-eliminated).
    t.heroFinish = t.fieldRemaining + 1;
    if (t.heroFinish <= t.paidPlaces) t.cash = t.payouts[t.heroFinish - 1];
    t.status = "busted";
    t.message = t.cash > 0 ? `Busted ${t.heroFinish}/${t.entrants} — cashed $${t.cash}` : `Busted ${t.heroFinish}/${t.entrants}`;
    return;
  }

  // Abstract eliminations at other tables (only before the final table).
  const liveTable = t.seats.filter((s) => s.stack > 0).length;
  let outside = t.fieldRemaining - liveTable;
  if (t.fieldRemaining > t.tableSize && outside > 0) {
    const elim = Math.min(outside, Math.round(outside * 0.05 * (0.4 + Math.random())));
    t.fieldRemaining -= elim;
    outside -= elim;
  }

  if (t.fieldRemaining <= 1) {
    t.status = "won";
    t.heroFinish = 1;
    t.cash = t.payouts[0];
    t.message = `🏆 You won it! $${t.cash}`;
    return;
  }

  // Refill empty opponent seats from the field pool (rebalancing / final-table seating).
  const seatable = Math.min(t.tableSize, t.fieldRemaining);
  const av = avgStack(t);
  for (let i = 0; i < t.seats.length; i++) {
    const live = t.seats.filter((s) => s.stack > 0).length;
    if (live >= seatable) break;
    const s = t.seats[i];
    if (!s.isHero && s.stack === 0 && outside > 0) {
      s.stack = av;
      s.name = NAMES[(i * 5 + t.handNo) % NAMES.length];
      outside -= 1;
    }
  }

  // Bubble / money messaging.
  if (t.fieldRemaining === t.paidPlaces + 1) t.message = `Money bubble — ${t.fieldRemaining} left, ${t.paidPlaces} paid`;
  else if (t.fieldRemaining <= t.paidPlaces) t.message = `In the money — ${t.fieldRemaining} left`;
  else if (t.fieldRemaining <= t.tableSize) t.message = `Final table — ${t.fieldRemaining} left`;
  else t.message = `${t.fieldRemaining} / ${t.entrants} left`;
}
