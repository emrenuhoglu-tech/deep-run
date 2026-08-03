import { useEffect, useState } from "react";
import Simulator from "./modes/sim/Simulator";

const TABS = [
  { id: "learn", label: "Learn", icon: "📚" },
  { id: "sim", label: "Simulator", icon: "♠" },
  { id: "progress", label: "Progress", icon: "📈" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const MODULES = [
  { key: "fundamentals", n: 1, title: "Tournament Fundamentals", blurb: "Stages, stack in bb, M-ratio, and why chips ≠ money." },
  { key: "pushfold", n: 2, title: "Short-Stack Push/Fold", blurb: "Sub-20bb shove/fold with Nash ranges and fold equity." },
  { key: "icm", n: 3, title: "ICM & Final Table", blurb: "Pay jumps, ICM pressure, laddering and deals." },
  { key: "bubble", n: 4, title: "The Bubble", blurb: "Bully the scared, survive short, satellite bubbles." },
  { key: "deepstack", n: 5, title: "Deep-Stack Postflop", blurb: "50bb+ play: 3-bet pots, texture, sizing, pot control." },
];

function useHashTab(): TabId {
  const read = () => (location.hash.replace(/^#\/?/, "").split("/")[0] || "learn");
  const [raw, setRaw] = useState<string>(read());
  useEffect(() => {
    const on = () => setRaw(read());
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return (TABS.some((t) => t.id === raw) ? raw : "learn") as TabId;
}

export default function App() {
  const tab = useHashTab();
  return (
    <div className="min-h-full flex flex-col max-w-xl mx-auto">
      <Header />
      <main className="flex-1 px-4 pb-28 pt-4">
        {tab === "learn" && <Learn />}
        {tab === "sim" && <Simulator />}
        {tab === "progress" && <Progress />}
      </main>
      <TabBar tab={tab} />
    </div>
  );
}

function Header() {
  return (
    <header className="px-4 pt-5 pb-3 border-b border-line flex items-center justify-between">
      <div>
        <div className="text-xl font-bold tracking-tight">
          Deep&nbsp;Run <span className="text-teal">♠</span>
        </div>
        <div className="eyebrow mt-0.5">Tournament poker trainer</div>
      </div>
      <span className="chip bg-surface2 text-muted border border-line">v0.1</span>
    </header>
  );
}

function Learn() {
  return (
    <section>
      <p className="eyebrow">Curriculum · 5 modules</p>
      <h1 className="text-2xl font-bold mt-1 mb-4">Learn tournament poker</h1>
      <div className="flex flex-col gap-3">
        {MODULES.map((m) => (
          <div key={m.key} className="card p-4 flex items-start gap-3">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-surface2 border border-line grid place-items-center font-mono font-bold text-teal">
              {m.n}
            </div>
            <div className="min-w-0">
              <div className="font-semibold">{m.title}</div>
              <div className="text-sm text-muted mt-0.5">{m.blurb}</div>
            </div>
            <span className="chip bg-surface2 text-muted border border-line ml-auto self-center">soon</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted mt-4">
        Lessons are being authored (ICM, GTO/Nash push-fold, standard MTT theory) and will land here with quizzes.
      </p>
    </section>
  );
}

function Progress() {
  return (
    <section>
      <p className="eyebrow">Your game</p>
      <h1 className="text-2xl font-bold mt-1 mb-4">Progress</h1>
      <div className="grid grid-cols-3 gap-3">
        {[
          { k: "Level", v: "1" },
          { k: "XP", v: "0" },
          { k: "Best run", v: "—" },
        ].map((s) => (
          <div key={s.k} className="card p-3 text-center">
            <div className="eyebrow">{s.k}</div>
            <div className="text-xl font-bold mt-1 font-mono">{s.v}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted mt-4">Stats, streaks and completed modules will track here.</p>
    </section>
  );
}

function TabBar({ tab }: { tab: TabId }) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 border-t border-line bg-base/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-xl mx-auto grid grid-cols-3">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <a
              key={t.id}
              href={`#/${t.id}`}
              aria-current={active ? "page" : undefined}
              className={`focusable flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                active ? "text-teal" : "text-muted"
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
