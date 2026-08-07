import type { Card } from "./cards";

// 7-card evaluator → a single comparable score (higher is better).
// Encodes category (0 high card … 8 straight flush) plus up to 5 tiebreak ranks.

export const CATEGORY_NAMES = [
  "High Card",
  "Pair",
  "Two Pair",
  "Three of a Kind",
  "Straight",
  "Flush",
  "Full House",
  "Four of a Kind",
  "Straight Flush",
];

function enc(cat: number, ks: number[]): number {
  let v = cat;
  for (let i = 0; i < 5; i++) v = v * 15 + (ks[i] || 0);
  return v;
}
function pad5(a: number[]): number[] {
  const b = a.slice(0, 5);
  while (b.length < 5) b.push(0);
  return b;
}
function uniqueDesc(a: number[]): number[] {
  return Array.from(new Set(a)).sort((x, y) => y - x);
}
// Highest kicker, or 0 when none remain (e.g. scoring a bare paired board with no side card).
function topKicker(rs: number[]): number {
  return rs.length ? Math.max(...rs) : 0;
}

// Highest card of the best 5-in-a-row within a rank set (0 if none). Handles the wheel.
function bestStraight(rankSet: number[]): number {
  const present = new Set(rankSet);
  if (present.has(14)) present.add(1); // ace low
  const arr = Array.from(present).sort((a, b) => b - a);
  let run = 1;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] - 1 === arr[i + 1]) {
      run++;
      if (run >= 5) return arr[i + 1] + 4;
    } else {
      run = 1;
    }
  }
  return 0;
}

export function score7(cards: Card[]): number {
  const ranks = cards.map((c) => c.r);

  const rc: Record<number, number> = {};
  for (const r of ranks) rc[r] = (rc[r] || 0) + 1;
  const sc = [0, 0, 0, 0];
  for (const c of cards) sc[c.s]++;

  let flushSuit = -1;
  for (let s = 0; s < 4; s++) if (sc[s] >= 5) flushSuit = s;

  // Straight flush (incl. royal + wheel)
  if (flushSuit >= 0) {
    const fs = cards.filter((c) => c.s === flushSuit).map((c) => c.r);
    const sf = bestStraight(fs);
    if (sf) return enc(8, [sf, 0, 0, 0, 0]);
  }

  const byCount: Record<number, number[]> = {};
  for (const r of uniqueDesc(ranks)) (byCount[rc[r]] = byCount[rc[r]] || []).push(r);
  const quads = (byCount[4] || []).sort((a, b) => b - a);
  const trips = (byCount[3] || []).sort((a, b) => b - a);
  const pairs = (byCount[2] || []).sort((a, b) => b - a);

  // Four of a kind
  if (quads.length) {
    const q = quads[0];
    const kicker = topKicker(ranks.filter((r) => r !== q));
    return enc(7, [q, kicker, 0, 0, 0]);
  }

  // Full house (trips + another trip or a pair)
  if (trips.length && (trips.length >= 2 || pairs.length)) {
    const t = trips[0];
    const p = trips.length >= 2 ? trips[1] : pairs[0];
    return enc(6, [t, p, 0, 0, 0]);
  }

  // Flush
  if (flushSuit >= 0) {
    const top5 = cards
      .filter((c) => c.s === flushSuit)
      .map((c) => c.r)
      .sort((a, b) => b - a)
      .slice(0, 5);
    return enc(5, pad5(top5));
  }

  // Straight
  const st = bestStraight(ranks);
  if (st) return enc(4, [st, 0, 0, 0, 0]);

  // Three of a kind
  if (trips.length) {
    const t = trips[0];
    const ks = uniqueDesc(ranks.filter((r) => r !== t)).slice(0, 2);
    return enc(3, pad5([t, ...ks]));
  }

  // Two pair
  if (pairs.length >= 2) {
    const [p1, p2] = pairs;
    const kicker = topKicker(ranks.filter((r) => r !== p1 && r !== p2));
    return enc(2, [p1, p2, kicker, 0, 0]);
  }

  // One pair
  if (pairs.length === 1) {
    const p = pairs[0];
    const ks = uniqueDesc(ranks.filter((r) => r !== p)).slice(0, 3);
    return enc(1, pad5([p, ...ks]));
  }

  // High card
  return enc(0, pad5(uniqueDesc(ranks).slice(0, 5)));
}

export function categoryOf(score: number): number {
  return Math.floor(score / 15 ** 5);
}
