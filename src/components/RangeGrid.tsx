// A 13x13 starting-hand grid. Highlights the hands in `range` (a set of hand keys
// like "AA" / "AKs" / "T9o"). Optionally marks the hero's hand.
const DESC = "AKQJT98765432".split("");

function cellKey(i: number, j: number): string {
  const hi = DESC[i];
  const lo = DESC[j];
  if (i === j) return hi + hi; // pair
  if (i < j) return hi + lo + "s"; // suited (upper triangle)
  return lo + hi + "o"; // offsuit (lower triangle)
}

export function RangeGrid({ range, mark, title }: { range: Set<string>; mark?: string; title?: string }) {
  return (
    <div>
      {title && <div className="eyebrow mb-1">{title}</div>}
      <div className="grid gap-px" style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}>
        {DESC.map((_, i) =>
          DESC.map((_, j) => {
            const k = cellKey(i, j);
            const on = range.has(k);
            const isMark = mark === k;
            return (
              <div
                key={k}
                className={`aspect-square grid place-items-center rounded-[2px] font-mono leading-none text-[7px] ${
                  isMark
                    ? "bg-gold text-base ring-1 ring-ink"
                    : on
                      ? "bg-teal text-base"
                      : "bg-surface2 text-muted/40"
                }`}
              >
                {k}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
