// Lesson narration via the browser's built-in Web Speech API — no assets, no
// network, no keys. Strips lesson markdown to prose and speaks it in chunks.

let queue: string[] = [];
let onDone: (() => void) | null = null;
let active = false;
let keepAlive: number | null = null;

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

// Reduce lesson markdown to readable prose.
export function narratable(md: string): string {
  return md
    .split("\n")
    .filter((l) => !/^\s*\|?[\s:|-]*\|[\s:|-]*$/.test(l)) // drop table separator rows
    .map((l) => {
      let s = l;
      if (/^\s*\|.*\|\s*$/.test(s)) s = s.replace(/\|/g, ", ").replace(/(^\s*,\s*)|(\s*,\s*$)/g, ""); // table row → "a, b, c"
      s = s.replace(/^#{1,6}\s*/, ""); // headings
      s = s.replace(/^\s*[-*]\s+/, ""); // bullets
      s = s.replace(/^\s*\d+\.\s+/, ""); // ordered
      s = s.replace(/^\s*>\s?/, ""); // blockquotes
      s = s.replace(/\*\*(.+?)\*\*/g, "$1"); // bold
      s = s.replace(/\*(.+?)\*/g, "$1"); // italic
      s = s.replace(/`([^`]+)`/g, "$1"); // inline code
      return s.trim();
    })
    .filter(Boolean)
    .join(". ")
    .replace(/([.!?])\s*\.\s+/g, "$1 "); // avoid doubled sentence stops
}

// Sentence-sized chunks so no single utterance trips the browser cutoff.
function chunk(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) || [text];
  const out: string[] = [];
  let buf = "";
  for (const p of parts) {
    if ((buf + p).length > 220) {
      if (buf.trim()) out.push(buf.trim());
      buf = p;
    } else buf += p;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function pickVoice(): SpeechSynthesisVoice | null {
  const vs = window.speechSynthesis.getVoices();
  return (
    vs.find((v) => /^en[-_]US/i.test(v.lang) && /google|natural|siri|premium/i.test(v.name)) ||
    vs.find((v) => /^en/i.test(v.lang)) ||
    vs[0] ||
    null
  );
}

function speakNext(): void {
  if (!queue.length) {
    clear();
    onDone?.();
    onDone = null;
    return;
  }
  const u = new SpeechSynthesisUtterance(queue.shift()!);
  const v = pickVoice();
  if (v) u.voice = v;
  u.rate = 1.0;
  u.pitch = 1.0;
  u.onend = speakNext;
  u.onerror = speakNext;
  window.speechSynthesis.speak(u);
}

function clear(): void {
  active = false;
  queue = [];
  if (keepAlive != null) {
    clearInterval(keepAlive);
    keepAlive = null;
  }
}

export function speak(md: string, done?: () => void): void {
  if (!speechSupported()) return;
  stop();
  queue = chunk(narratable(md));
  onDone = done ?? null;
  active = true;
  // Chrome pauses long synthesis after ~15s; resume() keeps it alive.
  keepAlive = window.setInterval(() => window.speechSynthesis.resume(), 8000);
  speakNext();
}

export function stop(): void {
  clear();
  onDone = null;
  if (speechSupported()) window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
  return active;
}
