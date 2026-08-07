import { useState } from "react";
import { getStats, resetProgress } from "../../lib/progress";
import { getLeaks, resetLeaks } from "../../lib/leaks";
import { getHistory, clearHistory } from "../../lib/history";
import { CHAPTERS } from "../../content/curriculum";

export function Progress({ notify }: { notify: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const [openRow, setOpenRow] = useState<number | null>(null);
  const s = getStats();
  const total = CHAPTERS.length;
  const pct = Math.round((s.xpInLevel / s.levelSize) * 100);
  const leaks = getLeaks();
  const history = getHistory();

  return (
    <section>
      <p className="eyebrow">Your game</p>
      <h1 className="text-2xl font-bold mt-1 mb-4">Progress</h1>

      {/* level bar */}
      <div className="card p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold">Level {s.level}</span>
          <span className="font-mono text-xs text-muted">
            {s.xpInLevel}/{s.levelSize} XP
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-surface2 overflow-hidden" role="progressbar" aria-valuenow={pct}>
          <div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        {[
          { k: "Streak", v: `${s.streak}🔥` },
          { k: "Total XP", v: s.xp },
          { k: "Chapters", v: `${s.doneCount}/${total}` },
        ].map((x) => (
          <div key={x.k} className="card p-3 text-center">
            <div className="eyebrow">{x.k}</div>
            <div className="text-lg font-bold mt-1 font-mono tabular-nums">{x.v}</div>
          </div>
        ))}
      </div>

      {/* weak spots — accuracy by concept, from graded sim + drill decisions */}
      <div className="card p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="eyebrow">Accuracy by concept</h2>
          <a href="#/drill" className="chip bg-teal text-base">🎯 Drill</a>
        </div>
        {leaks.length === 0 ? (
          <p className="text-sm text-muted">
            No decisions yet. Play the <span className="text-teal font-semibold">Simulator</span> or run a{" "}
            <a href="#/drill" className="text-teal font-semibold">Drill</a> — your weak spots surface here.
          </p>
        ) : (
          <div className="space-y-2.5">
            {leaks.map((l) => {
              const p = Math.round(l.accuracy * 100);
              const col = p >= 80 ? "bg-good" : p >= 60 ? "bg-gold" : "bg-bad";
              return (
                <div key={l.concept}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-ink">{l.concept}</span>
                    <span className="font-mono text-muted">{p}% · {l.seen} spots</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface2 overflow-hidden">
                    <div className={`h-full rounded-full ${col}`} style={{ width: `${p}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* recent decisions — autopsy of drills + simulator mistakes */}
      {history.length > 0 && (
        <div className="card p-4 mb-3">
          <h2 className="eyebrow mb-3">Recent decisions · tap to review</h2>
          <div className="space-y-1.5">
            {history.slice(0, 8).map((e, i) => {
              const dot = e.verdict === "good" ? "bg-good" : e.verdict === "mistake" ? "bg-bad" : "bg-gold";
              const open = openRow === i;
              return (
                <div key={i} className="rounded-lg border border-line bg-surface2/50">
                  <button
                    onClick={() => setOpenRow(open ? null : i)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-left focusable"
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                    <span className="font-mono text-xs text-ink w-10">{e.hand}</span>
                    <span className="text-xs text-muted truncate flex-1">
                      you {e.action}{e.action !== e.correct ? ` · line: ${e.correct}` : ""}
                    </span>
                    {e.equity != null && <span className="font-mono text-[11px] text-teal">{Math.round(e.equity * 100)}%</span>}
                    <span className="chip bg-surface border border-line text-[10px] text-muted">{e.concept.split(" ")[0]}</span>
                  </button>
                  {open && <div className="px-2.5 pb-2.5 text-xs text-muted">{e.label} — {e.note}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card p-4">
        <div className="text-sm text-muted mb-3">
          Play the <span className="text-teal font-semibold">Simulator</span> to apply what you learn — every
          decision earns ICM-aware feedback.
        </div>
        {confirm ? (
          <div className="flex gap-2">
            <button
              className="btn-ghost flex-1 !border-bad !text-bad"
              onClick={() => {
                resetProgress();
                resetLeaks();
                clearHistory();
                setConfirm(false);
                notify();
              }}
            >
              Really reset
            </button>
            <button className="btn-ghost flex-1" onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn-ghost w-full text-muted" onClick={() => setConfirm(true)}>
            Start over
          </button>
        )}
      </div>
    </section>
  );
}
