import { useMemo, useState } from "react";
import { RangeGrid } from "../../components/RangeGrid";
import {
  STACKS,
  TABLE_SIZES,
  KINDS,
  kindsFor,
  positionsFor,
  buildSpot,
  correctAction,
  sampleKey,
  posLabel,
} from "./questions";
import type { Kind, TableSize, Spot } from "./questions";
import { recordDecision } from "../../lib/leaks";
import { recordHand } from "../../lib/history";
import { addXp } from "../../lib/progress";
import { play } from "../../lib/sound";

type Sel = { stack: number; table: TableSize; kind: Kind; pos: string };

// Clamp a selection to combos that actually have a chart.
function normalize(s: Sel): Sel {
  const kinds = kindsFor(s.stack).filter((k) => positionsFor(k, s.table).length > 0);
  const kind = kinds.includes(s.kind) ? s.kind : kinds[0];
  const poss = positionsFor(kind, s.table);
  const pos = poss.some((p) => p.chartPos === s.pos) ? s.pos : poss[0].chartPos;
  return { stack: s.stack, table: s.table, kind, pos };
}
function toSpot(s: Sel): Spot {
  const pos = positionsFor(s.kind, s.table).find((p) => p.chartPos === s.pos)!;
  return buildSpot(s.kind, s.stack, s.table, pos)!;
}

export function Recall({ notify }: { notify: () => void }) {
  const [sel, setSel] = useState<Sel>(() => normalize({ stack: 10, table: 8, kind: "jam", pos: "UTG" }));
  const spot = useMemo(() => toSpot(sel), [sel]);
  const [key, setKey] = useState<string>(() => sampleKey(spot));
  const [answer, setAnswer] = useState<{ chosen: string; correct: string } | null>(null);
  const [session, setSession] = useState({ good: 0, total: 0 });

  function select(patch: Partial<Sel>) {
    const nsel = normalize({ ...sel, ...patch });
    setSel(nsel);
    setAnswer(null);
    setKey(sampleKey(toSpot(nsel)));
  }
  function next() {
    setAnswer(null);
    setKey(sampleKey(spot));
  }
  function act(chosen: string) {
    if (answer) return;
    play(chosen === "Fold" ? "fold" : "chip");
    const correct = correctAction(spot, key);
    const verdict = chosen === correct ? "good" : "mistake";
    recordDecision("Range recall", verdict);
    recordHand({
      concept: "Range recall",
      label: spot.title,
      hand: key,
      action: chosen,
      correct,
      verdict,
      note: `${key} → ${correct} (${spot.title})`,
    });
    if (verdict === "good") addXp(2);
    play(verdict === "good" ? "good" : "mistake");
    setAnswer({ chosen, correct });
    setSession((s) => ({ good: s.good + (verdict === "good" ? 1 : 0), total: s.total + 1 }));
    notify();
  }

  const kinds = kindsFor(sel.stack).filter((k) => positionsFor(k, sel.table).length > 0);
  const positions = positionsFor(sel.kind, sel.table);
  const villain = !KINDS[sel.kind].hero;
  const shape = key.length === 2 ? "pocket pair" : key.endsWith("s") ? "suited" : "offsuit";
  const chip = (on: boolean) =>
    `chip border ${on ? "bg-teal text-base border-teal" : "bg-surface2 border-line text-muted"}`;

  return (
    <section className="pb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="eyebrow">Recall · range memory</p>
          <h1 className="text-xl font-bold">Memorize the charts</h1>
        </div>
        {session.total > 0 && (
          <div className="chip bg-surface2 border border-line text-teal">
            {session.good}/{session.total} · {Math.round((session.good / session.total) * 100)}%
          </div>
        )}
      </div>

      {/* axis selectors */}
      <div className="mb-3 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {STACKS.map((s) => (
            <button key={s} onClick={() => select({ stack: s })} className={chip(sel.stack === s)}>
              {s}bb
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TABLE_SIZES.map((t) => (
            <button key={t} onClick={() => select({ table: t })} className={chip(sel.table === t)}>
              {t}-max
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {kinds.map((k) => (
            <button key={k} onClick={() => select({ kind: k })} className={chip(sel.kind === k)}>
              {KINDS[k].label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {positions.map((p) => (
            <button key={p.chartPos} onClick={() => select({ pos: p.chartPos })} className={chip(sel.pos === p.chartPos)}>
              {villain ? "vs " : ""}
              {posLabel(p)}
            </button>
          ))}
        </div>
      </div>

      {/* question */}
      <div className="card-raised p-4 mb-3">
        <div className="eyebrow mb-1">{spot.title}</div>
        <p className="text-sm text-ink">{spot.prompt}</p>
        <div className="text-center py-4">
          <div className="font-mono text-5xl font-bold tracking-tight">{key}</div>
          <div className="text-xs text-muted mt-1">{shape}</div>
        </div>
      </div>

      {/* actions or feedback */}
      {!answer ? (
        <div className="flex gap-2">
          {[...spot.actions].reverse().map((a, i, arr) => (
            <button
              key={a}
              onClick={() => act(a)}
              className={`${i === arr.length - 1 ? "btn-teal" : "btn-ghost"} flex-1`}
            >
              {a}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div
            className={`card p-3 mb-3 border-l-4 anim-pop ${
              answer.chosen === answer.correct ? "border-good text-good" : "border-bad text-bad"
            }`}
            style={{ borderLeftColor: "currentColor" }}
          >
            <div className="text-sm font-bold">
              {answer.chosen === answer.correct ? "✓ Correct" : "✗ Mistake"}
            </div>
            <div className="text-sm text-ink mt-1">
              {key} is a {answer.correct.toLowerCase()} here.
            </div>
          </div>
          <div className="card p-3 mb-3">
            {spot.ranges.map((r) => (
              <div key={r.action} className="mb-3 last:mb-0">
                <RangeGrid range={r.set} mark={key} title={r.title} />
              </div>
            ))}
            <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-teal inline-block" /> in range
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-gold inline-block" /> this hand
              </span>
              {spot.percent != null && (
                <span className="ml-auto font-mono">≈{spot.percent}% of combos</span>
              )}
            </div>
          </div>
          <button className="btn-teal w-full" onClick={next}>
            Next hand →
          </button>
        </div>
      )}
    </section>
  );
}
