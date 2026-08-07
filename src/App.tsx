import { useEffect, useState } from "react";
import Simulator from "./modes/sim/Simulator";
import { Learn } from "./modes/learn/Learn";
import { Drill } from "./modes/drill/Drill";
import { Progress } from "./modes/progress/Progress";
import { getStats } from "./lib/progress";
import { soundEnabled, setSoundEnabled, play } from "./lib/sound";

const TABS = [
  { id: "learn", label: "Learn", icon: "📚" },
  { id: "drill", label: "Drill", icon: "🎯" },
  { id: "sim", label: "Sim", icon: "♠" },
  { id: "progress", label: "Progress", icon: "📈" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function useHashTab(): TabId {
  const read = () => location.hash.replace(/^#\/?/, "").split("/")[0] || "learn";
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
  const [, setStatsTick] = useState(0);
  const notify = () => setStatsTick((x) => x + 1);
  return (
    <div className="min-h-full flex flex-col max-w-xl mx-auto">
      <Header />
      <main className="flex-1 px-4 pb-28 pt-4">
        {tab === "learn" && <Learn notify={notify} />}
        {tab === "drill" && <Drill notify={notify} />}
        {tab === "sim" && <Simulator />}
        {tab === "progress" && <Progress notify={notify} />}
      </main>
      <TabBar tab={tab} />
    </div>
  );
}

function Header() {
  const s = getStats();
  const [muted, setMuted] = useState(!soundEnabled());
  const toggleSound = () => {
    const next = muted;
    setSoundEnabled(next);
    setMuted(!next);
    if (next) play("tap");
  };
  return (
    <header className="px-4 pt-5 pb-3 border-b border-line flex items-center justify-between">
      <div>
        <div className="text-xl font-bold tracking-tight">
          Deep&nbsp;Run <span className="text-teal">♠</span>
        </div>
        <div className="eyebrow mt-0.5">Tournament poker trainer</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSound}
          aria-label={muted ? "Unmute sound" : "Mute sound"}
          aria-pressed={!muted}
          className="focusable chip bg-surface2 border border-line grid place-items-center w-8 h-8 text-base"
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <a
          href="#/progress"
          className="focusable chip bg-surface2 border border-line font-mono text-xs flex items-center gap-2 px-2.5 py-1.5"
        >
          <span className="text-gold">{s.streak}🔥</span>
          <span className="text-teal">Lv{s.level}</span>
          <span className="text-muted">{s.xp}xp</span>
        </a>
      </div>
    </header>
  );
}

function TabBar({ tab }: { tab: TabId }) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 border-t border-line bg-base/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-xl mx-auto grid grid-cols-4">
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
