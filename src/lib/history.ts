// A small ring buffer of graded decisions for review / autopsy. localStorage.
import { load, save, remove } from "./storage";

export type Verdict = "good" | "ok" | "mistake";
export type HandEntry = {
  concept: string;
  label: string;
  hand: string; // hero hand key, e.g. "AKs"
  action: string; // what the hero did
  correct: string; // the recommended bucket
  verdict: Verdict;
  note: string;
  equity?: number; // 0..1, if computed
};

const KEY = "history";
const CAP = 40;

export function recordHand(e: HandEntry): void {
  const l = load<HandEntry[]>(KEY, []);
  l.unshift(e);
  if (l.length > CAP) l.length = CAP;
  save(KEY, l);
}

export function getHistory(): HandEntry[] {
  return load<HandEntry[]>(KEY, []);
}

export function clearHistory(): void {
  remove(KEY);
}
