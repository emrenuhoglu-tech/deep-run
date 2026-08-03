// Independent Chip Model (Malmuth-Harville). Given chip stacks and the payout
// ladder, returns each player's $ equity. Exact for small fields; falls back to
// a proportional split when the field is too large for exact recursion.

export function icmEquity(stacks: number[], payouts: number[]): number[] {
  const n = stacks.length;
  const eq = new Array(n).fill(0);
  if (n === 0) return eq;
  const spots = Math.min(payouts.length, n);
  if (spots === 0) return eq;

  // Too large for exact O(n!/(n-spots)!) recursion → proportional fallback.
  if (n > 10) {
    const totalChips = stacks.reduce((a, b) => a + b, 0) || 1;
    const totalPrize = payouts.slice(0, spots).reduce((a, b) => a + b, 0);
    return stacks.map((s) => (s / totalChips) * totalPrize);
  }

  const idxAll = stacks.map((_, i) => i);
  const recurse = (idxs: number[], prob: number, place: number) => {
    const total = idxs.reduce((s, i) => s + stacks[i], 0);
    if (total <= 0) return;
    for (const i of idxs) {
      const p = prob * (stacks[i] / total);
      eq[i] += p * payouts[place];
      if (place + 1 < spots) recurse(idxs.filter((j) => j !== i), p, place + 1);
    }
  };
  recurse(idxAll, 1, 0);
  return eq;
}

// Convenience: the $ value a player would gain/lose relative to their current
// chip-proportional share — a quick read on ICM pressure.
export function icmPressure(stacks: number[], payouts: number[], i: number): number {
  const eq = icmEquity(stacks, payouts);
  const totalChips = stacks.reduce((a, b) => a + b, 0) || 1;
  const totalPrize = payouts.reduce((a, b) => a + b, 0);
  const chipShare = (stacks[i] / totalChips) * totalPrize;
  return eq[i] - chipShare; // negative = you are "ICM-taxed" (survival premium)
}
