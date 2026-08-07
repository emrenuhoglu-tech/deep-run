// Expand poker range-notation strings into hand-key membership.
// Tokens (comma-separated): pairs "22" / "22+" / "66-99"; suited & offsuit
// "A5s" / "A5s+" / "T8s-T5s" / "AQo-ATo". "+" climbs the low card toward the high.
const ORDER = "23456789TJQKA";
const idx = (c: string) => ORDER.indexOf(c);
const pairKey = (r: number) => ORDER[r] + ORDER[r];
const comboKey = (hi: number, lo: number, suit: string) => ORDER[hi] + ORDER[lo] + suit;

function addPlus(tok: string, out: Set<string>): void {
  const t = tok.slice(0, -1);
  if (t.length === 2 && t[0] === t[1]) {
    for (let r = idx(t[0]); r <= idx("A"); r++) out.add(pairKey(r)); // 22+ → 22..AA
    return;
  }
  const hi = idx(t[0]);
  const suit = t[2];
  for (let lo = idx(t[1]); lo < hi; lo++) out.add(comboKey(hi, lo, suit)); // A5s+ → A5s..AKs
}

function addSpan(tok: string, out: Set<string>): void {
  const [a, b] = tok.split("-").map((x) => x.trim());
  if (a.length === 2 && a[0] === a[1]) {
    let [r1, r2] = [idx(a[0]), idx(b[0])];
    if (r1 > r2) [r1, r2] = [r2, r1];
    for (let r = r1; r <= r2; r++) out.add(pairKey(r)); // 66-99
    return;
  }
  const hi = idx(a[0]);
  const suit = a[2];
  let [l1, l2] = [idx(a[1]), idx(b[1])];
  if (l1 > l2) [l1, l2] = [l2, l1];
  for (let lo = l1; lo <= l2; lo++) out.add(comboKey(hi, lo, suit)); // T8s-T5s / AQo-ATo
}

function addSingle(tok: string, out: Set<string>): void {
  if (tok.length === 2 && tok[0] === tok[1]) {
    out.add(tok); // 22
    return;
  }
  const a = idx(tok[0]);
  const b = idx(tok[1]);
  out.add(comboKey(Math.max(a, b), Math.min(a, b), tok[2])); // AJo / T9s
}

const cache = new Map<string, Set<string>>();
export function handsIn(str: string): Set<string> {
  let s = cache.get(str);
  if (s) return s;
  s = new Set<string>();
  for (const raw of str.split(",")) {
    const tok = raw.trim();
    if (!tok) continue;
    if (tok.includes("-")) addSpan(tok, s);
    else if (tok.endsWith("+")) addPlus(tok, s);
    else addSingle(tok, s);
  }
  cache.set(str, s);
  return s;
}

export function inRange(key: string, str: string): boolean {
  return handsIn(str).has(key);
}
