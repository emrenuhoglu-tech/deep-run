// Procedural sound effects via the Web Audio API — no asset files, no network.
// A tiny synth (enveloped tones + filtered noise), gated by a persisted mute flag.
import { load, save } from "./storage";

let ctx: AudioContext | null = null;
let enabled = load<boolean>("sound", true);

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function soundEnabled(): boolean {
  return enabled;
}
export function setSoundEnabled(on: boolean): void {
  enabled = on;
  save("sound", on);
  if (on) context(); // warm up / resume inside the user gesture that toggled it
}

// A single enveloped oscillator note.
function tone(
  freq: number,
  dur: number,
  opts: { type?: OscillatorType; gain?: number; delay?: number; slideTo?: number } = {},
): void {
  const c = context();
  if (!c) return;
  const t0 = c.currentTime + (opts.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(freq, t0);
  if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(opts.slideTo, t0 + dur);
  const peak = opts.gain ?? 0.2;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// A short filtered-noise burst — card flicks and chip clicks.
function noise(dur: number, opts: { gain?: number; delay?: number; hp?: number; lp?: number } = {}): void {
  const c = context();
  if (!c) return;
  const t0 = c.currentTime + (opts.delay ?? 0);
  const n = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n); // decaying white noise
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.setValueAtTime(opts.gain ?? 0.15, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let node: AudioNode = src;
  if (opts.hp) {
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = opts.hp;
    node.connect(hp);
    node = hp;
  }
  if (opts.lp) {
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = opts.lp;
    node.connect(lp);
    node = lp;
  }
  node.connect(g).connect(c.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

const SFX = {
  deal: () => noise(0.09, { gain: 0.12, hp: 1200, lp: 6500 }),
  chip: () => {
    noise(0.05, { gain: 0.13, hp: 2200 });
    tone(240, 0.05, { type: "square", gain: 0.05, delay: 0.02 });
  },
  check: () => tone(170, 0.09, { type: "sine", gain: 0.16, slideTo: 120 }),
  fold: () => noise(0.16, { gain: 0.1, lp: 1400 }),
  good: () => {
    tone(660, 0.12, { type: "sine", gain: 0.16 });
    tone(990, 0.16, { type: "sine", gain: 0.13, delay: 0.09 });
  },
  mistake: () => tone(200, 0.24, { type: "sawtooth", gain: 0.11, slideTo: 130 }),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, { type: "triangle", gain: 0.14, delay: i * 0.08 })),
  bust: () => [392, 311, 233].forEach((f, i) => tone(f, 0.32, { type: "triangle", gain: 0.13, delay: i * 0.12 })),
  levelup: () => [659, 880, 1319].forEach((f, i) => tone(f, 0.26, { type: "triangle", gain: 0.13, delay: i * 0.07 })),
  tap: () => tone(440, 0.03, { type: "square", gain: 0.05 }),
};

export type Sfx = keyof typeof SFX;

export function play(name: Sfx): void {
  if (!enabled) return;
  try {
    SFX[name]();
  } catch {
    // audio unavailable in this environment — ignore
  }
}
