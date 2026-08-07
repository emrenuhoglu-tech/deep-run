import { useState } from "react";
import { legalActions, potSize } from "../../engine/hand";
import type { Action } from "../../engine/hand";
import { recommend, grade } from "../../engine/feedback";
import type { Rec, Grade } from "../../engine/feedback";
import { handKey } from "../../engine/ranges";
import { openRangeFor } from "../../engine/preflop";
import { equityForSpot } from "../../engine/equity";
import { PlayingCard } from "../../components/PlayingCard";
import { RangeGrid } from "../../components/RangeGrid";
import { makeSpot, CONCEPTS } from "./spots";
import type { Concept, Spot } from "./spots";
import { recordDecision, weakestConcept } from "../../lib/leaks";
import { recordHand } from "../../lib/history";
import { addXp } from "../../lib/progress";
import { play } from "../../lib/sound";

type Focus = "Mix" | "Weak" | Concept;

function build(f: Focus): { spot: Spot; rec: Rec | null } {
  const concept: Concept | undefined =
    f === "Mix" ? undefined : f === "Weak" ? ((weakestConcept() as Concept) ?? undefined) : f;
  const spot = makeSpot(concept);
  return { spot, rec: recommend(spot.t) };
}

export function Drill({ notify }: { notify: () => void }) {
  const [focus, setFocus] = useState<Focus>("Mix");
  const [cur, setCur] = useState(() => build("Mix"));
  const [g, setG] = useState<Grade | null>(null);
  const [eq, setEq] = useState<ReturnType<typeof equityForSpot> | null>(null);
  const [session, setSession] = useState({ good: 0, total: 0 });
  const weak = weakestConcept();

  function next(f: Focus = focus) {
    setG(null);
    setEq(null);
    setCur(build(f));
  }
  function choose(f: Focus) {
    setFocus(f);
    next(f);
  }
  function act(action: Action) {
    if (g) return;
    play(action.type === "fold" ? "fold" : action.type === "check" ? "check" : "chip");
    const rec = cur.rec;
    if (!rec) return;
    const gg = grade(rec, action);
    const e = equityForSpot(cur.spot.t);
    recordDecision(cur.spot.concept, gg.verdict);
    recordHand({
      concept: cur.spot.concept, label: cur.spot.label,
      hand: handKey(cur.spot.t.hand!.seats[cur.spot.t.heroSeat].hole),
      action: action.type, correct: rec.bucket, verdict: gg.verdict, note: gg.note, equity: e.pct,
    });
    if (gg.verdict === "good") addXp(2);
    else if (gg.verdict === "ok") addXp(1);
    play(gg.verdict === "good" ? "good" : gg.verdict === "mistake" ? "mistake" : "tap");
    setEq(e);
    setG(gg);
    setSession((s) => ({ good: s.good + (gg.verdict === "good" ? 1 : 0), total: s.total + 1 }));
    notify();
  }

  const h = cur.spot.t.hand!;
  const hero = h.seats[cur.spot.t.heroSeat];
  const la = legalActions(h);
  const pot = potSize(h);
  const stackBB = (hero.stack + hero.committed) / h.bb;
  const isPush = cur.spot.concept === "Push/fold";
  const raiseTo = isPush ? la.maxRaiseTo : Math.min(la.maxRaiseTo, h.currentBet + pot);
  const rangeView = g ? openRangeFor(h, cur.spot.t.heroSeat, stackBB) : null;

  const FOCI: Focus[] = ["Mix", ...(weak ? (["Weak"] as Focus[]) : []), ...CONCEPTS];

  return (
    <section className="pb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="eyebrow">Drill · isolated spots</p>
          <h1 className="text-xl font-bold">Sharpen your decisions</h1>
        </div>
        {session.total > 0 && (
          <div className="chip bg-surface2 border border-line text-teal">
            {session.good}/{session.total} · {Math.round((session.good / session.total) * 100)}%
          </div>
        )}
      </div>

      {/* focus selector */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {FOCI.map((f) => (
          <button
            key={f}
            onClick={() => choose(f)}
            className={`chip border ${focus === f ? "bg-teal text-base border-teal" : "bg-surface2 border-line text-muted"}`}
          >
            {f === "Weak" ? "⚠ Weak spots" : f}
          </button>
        ))}
      </div>

      {/* spot */}
      <div className="card-raised p-4 mb-3">
        <div className="eyebrow mb-1">{cur.spot.concept}</div>
        <p className="text-sm text-ink mb-3">{cur.spot.label}</p>
        {h.board.length > 0 && (
          <div className="felt rounded-lg p-2 mb-3 flex justify-center gap-1.5">
            {h.board.map((c, k) => (
              <PlayingCard key={k} card={c} />
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">You</span>
          <div className="flex gap-1.5">
            {hero.hole.map((c, k) => (
              <PlayingCard key={k} card={c} />
            ))}
          </div>
          <span className="ml-auto font-mono text-sm text-muted">{stackBB.toFixed(0)}bb</span>
        </div>
      </div>

      {/* actions or feedback */}
      {!g ? (
        <div className="flex gap-2">
          {la.check ? (
            <button className="btn-ghost flex-1" onClick={() => act({ type: "check" })}>
              Check
            </button>
          ) : (
            <>
              <button className="btn-ghost flex-1" onClick={() => act({ type: "fold" })}>
                Fold
              </button>
              <button className="btn-ghost flex-1" onClick={() => act({ type: "call" })}>
                Call {la.call.toLocaleString()}
              </button>
            </>
          )}
          {la.canRaise && (
            <button className="btn-teal flex-1" onClick={() => act({ type: "raise", to: raiseTo })}>
              {isPush || raiseTo >= la.maxRaiseTo ? "Jam" : "Raise"}
            </button>
          )}
        </div>
      ) : (
        <div>
          <FeedbackCard g={g} />
          {eq && (
            <div className="card p-3 mb-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Equity vs {eq.model}</span>
                <span className="font-mono font-bold text-teal tabular-nums">{Math.round(eq.pct * 100)}%</span>
              </div>
              {eq.ev && (
                <div className="mt-2 flex items-center gap-4 text-xs font-mono border-t border-line pt-2">
                  <span className={eq.ev.call >= 0 ? "text-good" : "text-bad"}>
                    Call EV {eq.ev.call >= 0 ? "+" : ""}{Math.round(eq.ev.call).toLocaleString()}
                  </span>
                  <span className="text-muted">Fold EV 0</span>
                  <span className="ml-auto text-muted">chip-EV: {eq.ev.call >= 0 ? "call" : "fold"}</span>
                </div>
              )}
            </div>
          )}
          {rangeView && (
            <div className="card p-3 mb-3">
              <RangeGrid range={rangeView.set} mark={handKey(hero.hole)} title={rangeView.label} />
              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
                <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-teal inline-block" /> in range</span>
                <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-gold inline-block" /> your hand</span>
              </div>
            </div>
          )}
          <button className="btn-teal w-full" onClick={() => next()}>
            Next spot →
          </button>
        </div>
      )}
    </section>
  );
}

function FeedbackCard({ g }: { g: Grade }) {
  const c = g.verdict === "good" ? "border-good text-good" : g.verdict === "mistake" ? "border-bad text-bad" : "border-gold text-gold";
  const label = g.verdict === "good" ? "✓ Good" : g.verdict === "mistake" ? "✗ Mistake" : "~ Close";
  return (
    <div className={`card p-3 mb-3 border-l-4 anim-pop ${c}`} style={{ borderLeftColor: "currentColor" }}>
      <div className="flex items-center gap-2 text-sm font-bold">
        <span>{label}</span>
        <span className="chip bg-surface2 border border-line text-muted">{g.regime}</span>
      </div>
      <div className="text-sm text-ink mt-1.5">{g.note}</div>
    </div>
  );
}
