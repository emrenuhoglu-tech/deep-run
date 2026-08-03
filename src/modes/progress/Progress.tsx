import { useState } from "react";
import { getStats, resetProgress } from "../../lib/progress";
import { CHAPTERS } from "../../content/curriculum";

export function Progress({ notify }: { notify: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const s = getStats();
  const total = CHAPTERS.length;
  const pct = Math.round((s.xpInLevel / s.levelSize) * 100);

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
