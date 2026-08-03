// Progress: completed chapters, XP, LOCAL-day activity streak, quiz stats. localStorage.
import { load, save, remove } from "./storage";

interface ProgressData {
  done: string[]; // completed chapter ids
  xp: number;
  days: string[]; // LOCAL ISO days with any activity
  quizDay?: string;
  quizAwarded?: number;
  quizOk?: number;
  quizTotal?: number;
}

const KEY = "progress";
const LEVEL_SIZE = 60; // xp per level

function localDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function today(): string {
  return localDay(new Date());
}
function read(): ProgressData {
  return load<ProgressData>(KEY, { done: [], xp: 0, days: [] });
}
function touchDay(p: ProgressData): void {
  const t = today();
  if (!p.days.includes(t)) p.days.push(t);
}

// Consecutive days of activity up to today (DST-safe walk).
function streak(days: string[]): number {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(localDay(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(localDay(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

// Complete a chapter. First time only awards XP. Returns whether it was the first time.
export function completeChapter(id: string, xp = 12): boolean {
  const p = read();
  const first = !p.done.includes(id);
  if (first) {
    p.done.push(id);
    p.xp += xp;
  }
  touchDay(p);
  save(KEY, p);
  return first;
}

export function addXp(n: number): void {
  const p = read();
  p.xp += n;
  touchDay(p);
  save(KEY, p);
}

export function isDone(id: string): boolean {
  return read().done.includes(id);
}

export function resetProgress(): void {
  remove(KEY);
}

export interface Stats {
  xp: number;
  level: number;
  xpInLevel: number;
  levelSize: number;
  doneCount: number;
  streak: number;
  practicedToday: boolean;
}

export function getStats(): Stats {
  const p = read();
  return {
    xp: p.xp,
    level: Math.floor(p.xp / LEVEL_SIZE) + 1,
    xpInLevel: p.xp % LEVEL_SIZE,
    levelSize: LEVEL_SIZE,
    doneCount: p.done.length,
    streak: streak(p.days),
    practicedToday: p.days.includes(today()),
  };
}
