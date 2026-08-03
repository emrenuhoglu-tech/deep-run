// Card primitives. r: 2..14 (14 = Ace), s: 0..3 (c,d,h,s).
export type Card = { r: number; s: number };

export const RANKS = "  23456789TJQKA"; // index by rank (RANKS[14] = "A")
export const SUITS = "cdhs";

export function cardStr(c: Card): string {
  return RANKS[c.r] + SUITS[c.s];
}

export function parseCard(str: string): Card {
  return { r: RANKS.indexOf(str[0]), s: SUITS.indexOf(str[1]) };
}

export function makeDeck(): Card[] {
  const d: Card[] = [];
  for (let s = 0; s < 4; s++) for (let r = 2; r <= 14; r++) d.push({ r, s });
  return d;
}

// In-place Fisher-Yates. Uses Math.random (fine at app runtime).
export function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
