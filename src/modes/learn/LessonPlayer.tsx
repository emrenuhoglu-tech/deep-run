import { useMemo, useState } from "react";
import { chapterById, nextChapter } from "../../content/curriculum";
import { LessonBody } from "../../components/LessonBody";
import { completeChapter, addXp, isDone } from "../../lib/progress";
import { play } from "../../lib/sound";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Mode = "read" | "quiz" | "result";

export function LessonPlayer({
  chapterId,
  onBack,
  onOpen,
  notify,
}: {
  chapterId: string;
  onBack: () => void;
  onOpen: (id: string) => void;
  notify: () => void;
}) {
  const m = chapterById(chapterId);
  const [mode, setMode] = useState<Mode>("read");
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [awarded, setAwarded] = useState(0);
  const alreadyDone = m ? isDone(m.id) : false;

  const quiz = useMemo(
    () =>
      (m ? m.checks : []).map((c) => {
        const opts = shuffle([c.correct, ...c.wrong]);
        return { q: c.q, opts, correct: opts.indexOf(c.correct) };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chapterId],
  );

  if (!m) {
    return (
      <div className="p-6 text-center text-muted">
        Chapter not found.{" "}
        <button onClick={onBack} className="font-bold text-teal">
          ← Back
        </button>
      </div>
    );
  }
  const next = nextChapter(m.id);

  function grant(correct: number) {
    const first = completeChapter(m!.id, 12);
    let gained = first ? 12 : 0;
    if (first && correct > 0) {
      addXp(correct * 3);
      gained += correct * 3;
    }
    setAwarded(gained);
    notify();
    play(gained > 0 ? "levelup" : "good");
    setMode("result");
  }
  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const right = i === quiz[qi].correct;
    if (right) setCorrectCount((c) => c + 1);
    play(right ? "good" : "mistake");
  }
  function nextQuestion() {
    if (qi + 1 < quiz.length) {
      setQi(qi + 1);
      setPicked(null);
    } else grant(correctCount);
  }
  function startQuiz() {
    setQi(0);
    setPicked(null);
    setCorrectCount(0);
    setMode("quiz");
  }

  const header = (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-base/95 px-1 py-3 backdrop-blur">
      <button onClick={onBack} className="rounded-lg px-1 py-1 text-sm font-bold text-muted">
        ← Learn
      </button>
      <div className="min-w-0 flex-1">
        <div className="eyebrow">{m.group} · {m.label}</div>
        <div className="flex items-center gap-1.5">
          <span className="truncate font-bold text-ink">{m.title}</span>
          {alreadyDone && <span className="shrink-0 text-good">✓</span>}
        </div>
      </div>
    </div>
  );

  if (mode === "read") {
    return (
      <div className="flex min-h-full flex-col">
        {header}
        <div className="flex-1 space-y-3 py-4 pb-28">
          <LessonBody body={m.body} />
        </div>
        <div className="sticky bottom-16 bg-base/95 py-3 backdrop-blur">
          {quiz.length > 0 ? (
            <button onClick={startQuiz} className="btn-teal w-full py-3.5 text-base">
              {alreadyDone ? "Review — retake check" : "Check what you learned →"}
            </button>
          ) : (
            <button onClick={() => grant(0)} className="btn-teal w-full py-3.5 text-base">
              {alreadyDone ? "✓ Completed" : "Done · +12 XP"}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (mode === "quiz") {
    const q = quiz[qi];
    const answered = picked !== null;
    return (
      <div className="flex min-h-full flex-col">
        {header}
        <div className="flex-1 space-y-4 py-4">
          <div className="flex items-center gap-2 text-xs font-bold text-muted">
            <span>Q {qi + 1} / {quiz.length}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface2">
              <div className="h-full rounded-full bg-teal" style={{ width: `${((qi + (answered ? 1 : 0)) / quiz.length) * 100}%` }} />
            </div>
          </div>
          <p className="text-lg font-bold text-ink">{q.q}</p>
          <div className="flex flex-col gap-2.5">
            {q.opts.map((opt, i) => {
              const isCorrect = i === q.correct;
              let cls = "btn-choice";
              if (answered && isCorrect) cls = "btn-choice !border-good !text-good";
              else if (answered && i === picked && !isCorrect) cls = "btn-choice !border-bad !text-bad";
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  aria-disabled={answered}
                  className={cls + " justify-start px-4 py-3 text-left text-[15px]"}
                >
                  {answered && isCorrect ? "✓ " : answered && i === picked ? "✗ " : ""}
                  {opt}
                </button>
              );
            })}
          </div>
          {answered && (
            <button onClick={nextQuestion} className="btn-teal w-full py-3.5 text-base">
              {qi + 1 < quiz.length ? "Next →" : "Finish"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      {header}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="text-6xl anim-pop">{awarded > 0 ? "🎉" : "✓"}</div>
        {quiz.length > 0 && (
          <p className="text-lg font-bold text-ink">
            {correctCount} / {quiz.length} correct
          </p>
        )}
        <div className="chip bg-surface2 border border-line text-teal px-4 py-2 text-sm">
          {awarded > 0 ? `+${awarded} XP` : "Reviewed — already completed"}
        </div>
        <div className="w-full max-w-xs space-y-2 pt-2">
          {next ? (
            <button onClick={() => onOpen(next.id)} className="btn-teal w-full py-3.5 text-base">
              Next: {next.title} →
            </button>
          ) : (
            <button onClick={onBack} className="btn-teal w-full py-3.5 text-base">
              🏆 Course complete — back to lessons
            </button>
          )}
          <button onClick={onBack} className="btn-ghost w-full py-3">
            Back to lessons
          </button>
        </div>
      </div>
    </div>
  );
}
