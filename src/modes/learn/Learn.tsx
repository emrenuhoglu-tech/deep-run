import { useState } from "react";
import { GROUPS, CHAPTERS } from "../../content/curriculum";
import { isDone } from "../../lib/progress";
import { LessonPlayer } from "./LessonPlayer";

export function Learn({ notify }: { notify: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (openId) {
    return (
      <LessonPlayer
        key={openId}
        chapterId={openId}
        onBack={() => setOpenId(null)}
        onOpen={(id) => setOpenId(id)}
        notify={notify}
      />
    );
  }

  const nextUp = CHAPTERS.find((c) => !isDone(c.id))?.id;

  return (
    <section>
      <p className="eyebrow">Curriculum · {CHAPTERS.length} chapters</p>
      <h1 className="text-2xl font-bold mt-1 mb-4">Learn tournament poker</h1>
      <div className="space-y-5">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <h2 className="eyebrow mb-2">{g.title}</h2>
            <div className="space-y-2">
              {g.chapters.map((c) => {
                const done = isDone(c.id);
                const isNext = c.id === nextUp;
                return (
                  <button
                    key={c.id}
                    onClick={() => setOpenId(c.id)}
                    className={`card w-full p-3 flex items-center gap-3 text-left focusable ${isNext ? "ring-2 ring-teal" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 shrink-0 rounded-lg grid place-items-center font-mono font-bold text-sm ${
                        done ? "bg-good text-base" : "bg-surface2 text-teal border border-line"
                      }`}
                    >
                      {done ? "✓" : c.gi}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[15px] truncate">{c.title}</div>
                      <div className="text-xs text-muted">{c.label}</div>
                    </div>
                    {isNext && <span className="chip bg-teal text-base">Next</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
