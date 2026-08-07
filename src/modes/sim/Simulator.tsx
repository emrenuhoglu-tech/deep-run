import { useEffect, useRef, useState } from "react";
import {
  createTournament,
  startNextHand,
  heroAct,
  nextHand,
  heroToAct,
  avgStack,
} from "../../engine/tournament";
import type { TournamentState } from "../../engine/tournament";
import { legalActions, potSize } from "../../engine/hand";
import type { Action, HandState } from "../../engine/hand";
import { recommend, grade } from "../../engine/feedback";
import type { Rec, Grade } from "../../engine/feedback";
import { PlayingCard } from "../../components/PlayingCard";
import { play } from "../../lib/sound";
import { recordDecision, conceptOf } from "../../lib/leaks";
import { recordHand } from "../../lib/history";
import { handKey } from "../../engine/ranges";

export default function Simulator() {
  const tRef = useRef<TournamentState | null>(null);
  const [, setTick] = useState(0);
  const [rec, setRec] = useState<Rec | null>(null);
  const [lastGrade, setLastGrade] = useState<Grade | null>(null);
  const [raiseTo, setRaiseTo] = useState(0);
  const bump = () => setTick((x) => x + 1);

  function afterAdvance(t: TournamentState) {
    if (heroToAct(t)) {
      setRec(recommend(t));
      setRaiseTo(legalActions(t.hand!).minRaiseTo);
    } else setRec(null);
    bump();
  }
  function begin() {
    const t = createTournament({ entrants: 120, handsPerLevel: 8 });
    startNextHand(t);
    tRef.current = t;
    setLastGrade(null);
    play("deal");
    afterAdvance(t);
  }
  function act(a: Action) {
    const t = tRef.current!;
    const r = rec;
    play(a.type === "fold" ? "fold" : a.type === "check" ? "check" : "chip");
    heroAct(t, a);
    if (r) {
      const g = grade(r, a);
      setLastGrade(g);
      recordDecision(conceptOf(g.regime), g.verdict);
      if (g.verdict !== "good")
        recordHand({
          concept: conceptOf(g.regime), label: `${t.blinds.sb}/${t.blinds.bb} · ${t.fieldRemaining} left`,
          hand: handKey(t.hand!.seats[t.heroSeat].hole), action: a.type, correct: r.bucket,
          verdict: g.verdict, note: g.note,
        });
      play(g.verdict === "good" ? "good" : g.verdict === "mistake" ? "mistake" : "tap");
    }
    afterAdvance(t);
  }
  function deal() {
    const t = tRef.current!;
    nextHand(t);
    setLastGrade(null);
    if (t.status === "playing") play("deal");
    afterAdvance(t);
  }

  const t = tRef.current;
  if (!t) return <StartScreen onStart={begin} />;
  if (t.status !== "playing") return <FinishScreen t={t} onRestart={begin} />;

  const h = t.hand!;
  const bb = h.bb;
  const pot = potSize(h);
  const hero = h.seats[t.heroSeat];
  const showdown = h.street === "complete";
  const la = heroToAct(t) ? legalActions(h) : null;
  const asBB = (c: number) => (c / bb).toFixed(c < bb * 10 ? 1 : 0);

  const visible = h.seats
    .map((s, i) => ({ s, i }))
    .filter(({ s, i }) => i !== t.heroSeat && (s.stack > 0 || s.totalCommitted > 0 || s.committed > 0));

  return (
    <section className="pb-4">
      {/* status bar */}
      <div className="card p-3 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-mono">
            Lv {t.levelShown + 1} · <span className="text-ink">{t.blinds.sb}/{t.blinds.bb}</span>
            {t.blinds.ante > 0 && <span className="text-muted"> (a{t.blinds.ante})</span>}
          </span>
          <span className="font-mono text-muted">{t.fieldRemaining}/{t.entrants} left</span>
        </div>
        <div className="flex items-center justify-between mt-1.5 text-xs text-muted">
          <span>Avg {asBB(avgStack(t))}bb</span>
          <span className="chip bg-surface2 border border-line text-ink">{t.message || "—"}</span>
          <span>1st ${t.payouts[0].toLocaleString()}</span>
        </div>
      </div>

      {/* opponents */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {visible.map(({ s, i }) => {
          const active = h.toAct === i && !showdown;
          const isWinner = showdown && (h.results?.payouts?.[i] || 0) > 0;
          const shown = h.results?.revealed?.[i];
          return (
            <div
              key={i}
              className={`card p-2 ${s.folded ? "opacity-40" : ""} ${
                isWinner ? "anim-win" : active ? "ring-2 ring-teal anim-pulse" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold truncate">{s.name}</span>
                {i === h.button && <span className="chip bg-gold text-base">D</span>}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-xs text-muted">
                  {s.allIn ? <span className="text-gold">ALL-IN</span> : `${asBB(s.stack)}bb`}
                </span>
                {s.committed > 0 && <span className="font-mono text-xs text-teal">{s.committed}</span>}
              </div>
              {shown && (
                <div className="flex gap-1 mt-1.5">
                  {shown.map((c, k) => (
                    <PlayingCard key={`${t.handNo}:${k}`} card={c} small flip delay={k * 60} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* board + pot */}
      <div className="card-raised felt p-4 mb-3">
        <div className="text-center eyebrow mb-2 text-teal/80">Pot {pot.toLocaleString()} · {asBB(pot)}bb</div>
        <div className="flex justify-center gap-1.5 min-h-[3.5rem] items-center">
          {h.board.length === 0 ? (
            <span className="text-emerald-200/50 text-sm">pre-flop</span>
          ) : (
            h.board.map((c, k) => <PlayingCard key={`${t.handNo}:${k}`} card={c} flip delay={k * 70} />)
          )}
        </div>
      </div>

      {/* hero */}
      <div
        className={`card p-3 mb-3 ${
          showdown && (h.results?.payouts?.[t.heroSeat] || 0) > 0
            ? "anim-win"
            : h.toAct === t.heroSeat && !showdown
              ? "ring-2 ring-teal anim-pulse"
              : ""
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">
            You {t.heroSeat === h.button && <span className="chip bg-gold text-base ml-1">D</span>}
          </span>
          <span className="font-mono text-sm">
            {hero.allIn ? <span className="text-gold">ALL-IN</span> : `${asBB(hero.stack)}bb`}
            {hero.committed > 0 && <span className="text-teal"> · bet {hero.committed}</span>}
          </span>
        </div>
        <div className="flex gap-2">
          {hero.hole.map((c, k) => (
            <PlayingCard key={`${t.handNo}:${k}`} card={c} hidden={hero.folded} deal delay={k * 90} />
          ))}
          {hero.folded && <span className="self-center text-muted text-sm ml-2">folded</span>}
        </div>
      </div>

      {/* feedback */}
      {lastGrade && <FeedbackCard g={lastGrade} />}

      {/* controls / next */}
      {showdown ? (
        <ResultBar t={t} onNext={deal} />
      ) : la ? (
        <Controls la={la} h={h} pot={pot} raiseTo={raiseTo} setRaiseTo={setRaiseTo} act={act} />
      ) : (
        <div className="text-center text-muted text-sm py-3">…opponents acting</div>
      )}
    </section>
  );
}

function Controls({
  la,
  h,
  pot,
  raiseTo,
  setRaiseTo,
  act,
}: {
  la: ReturnType<typeof legalActions>;
  h: HandState;
  pot: number;
  raiseTo: number;
  setRaiseTo: (n: number) => void;
  act: (a: Action) => void;
}) {
  const clamp = (n: number) => Math.max(la.minRaiseTo, Math.min(la.maxRaiseTo, Math.round(n)));
  const quick = (n: number) => setRaiseTo(clamp(n));
  const isAllIn = raiseTo >= la.maxRaiseTo;
  return (
    <div className="card-raised p-3">
      <div className="flex gap-2 mb-3">
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
      </div>
      {la.canRaise && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="range"
              min={la.minRaiseTo}
              max={la.maxRaiseTo}
              value={Math.min(Math.max(raiseTo, la.minRaiseTo), la.maxRaiseTo)}
              onChange={(e) => setRaiseTo(Number(e.target.value))}
              className="flex-1 accent-teal"
              aria-label="Raise size"
            />
            <span className="font-mono text-sm w-20 text-right tabular-nums">{raiseTo.toLocaleString()}</span>
          </div>
          <div className="flex gap-1.5 mb-2 text-xs">
            <button className="btn-ghost flex-1 py-1.5" onClick={() => quick(la.minRaiseTo)}>
              Min
            </button>
            <button className="btn-ghost flex-1 py-1.5" onClick={() => quick(h.currentBet + pot)}>
              Pot
            </button>
            <button className="btn-ghost flex-1 py-1.5" onClick={() => quick(la.maxRaiseTo)}>
              All-in
            </button>
          </div>
          <button className="btn-teal w-full" onClick={() => act({ type: "raise", to: raiseTo })}>
            {isAllIn ? `All-in ${raiseTo.toLocaleString()}` : `Raise to ${raiseTo.toLocaleString()}`}
          </button>
        </div>
      )}
    </div>
  );
}

function FeedbackCard({ g }: { g: Grade }) {
  const c =
    g.verdict === "good"
      ? "border-good text-good"
      : g.verdict === "mistake"
        ? "border-bad text-bad"
        : "border-gold text-gold";
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

function ResultBar({ t, onNext }: { t: TournamentState; onNext: () => void }) {
  const h = t.hand!;
  const net = h.seats[t.heroSeat].stack - t.prevStacks[t.heroSeat];
  const winners = h.results
    ? h.seats.filter((_, i) => (h.results!.payouts[i] || 0) > 0)
    : [];
  return (
    <div className="card-raised p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted">
          {winners.map((w) => w.name).join(", ")} won
        </span>
        <span className={`font-mono font-bold ${net >= 0 ? "text-good" : "text-bad"}`}>
          {net >= 0 ? "+" : ""}
          {net.toLocaleString()}
        </span>
      </div>
      <button className="btn-teal w-full" onClick={onNext}>
        Next hand →
      </button>
    </div>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <section>
      <p className="eyebrow">Flagship · interactive</p>
      <h1 className="text-2xl font-bold mt-1 mb-2">Full MTT Simulator</h1>
      <p className="text-sm text-muted mb-4">
        Play a 120-runner tournament hand by hand — from the first level to the final table — against
        modeled opponents. Every decision gets ICM-aware feedback, and you climb a real payout ladder.
      </p>
      <button className="btn-teal w-full" onClick={onStart}>
        Start tournament
      </button>
    </section>
  );
}

function FinishScreen({ t, onRestart }: { t: TournamentState; onRestart: () => void }) {
  const won = t.status === "won";
  useEffect(() => {
    play(won ? "win" : "bust");
  }, [won]);
  return (
    <section className="text-center pt-6">
      <div className="text-5xl mb-3 anim-pop">{won ? "🏆" : "🪦"}</div>
      <h1 className="text-2xl font-bold mb-1">{won ? "You won it!" : `Finished ${t.heroFinish} / ${t.entrants}`}</h1>
      <p className="text-muted mb-1">{t.cash > 0 ? `Cashed $${t.cash.toLocaleString()}` : "No cash this time"}</p>
      <p className="text-xs text-muted mb-6">{t.paidPlaces} places paid · 1st ${t.payouts[0].toLocaleString()}</p>
      <button className="btn-teal w-full" onClick={onRestart}>
        New tournament
      </button>
    </section>
  );
}
