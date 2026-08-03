export type Level = { sb: number; bb: number; ante: number };

// A standard escalating MTT structure (bb-ante era).
export const BLIND_SCHEDULE: Level[] = [
  { sb: 50, bb: 100, ante: 0 },
  { sb: 75, bb: 150, ante: 150 },
  { sb: 100, bb: 200, ante: 200 },
  { sb: 150, bb: 300, ante: 300 },
  { sb: 200, bb: 400, ante: 400 },
  { sb: 300, bb: 600, ante: 600 },
  { sb: 400, bb: 800, ante: 800 },
  { sb: 500, bb: 1000, ante: 1000 },
  { sb: 700, bb: 1400, ante: 1400 },
  { sb: 1000, bb: 2000, ante: 2000 },
  { sb: 1500, bb: 3000, ante: 3000 },
  { sb: 2000, bb: 4000, ante: 4000 },
  { sb: 3000, bb: 6000, ante: 6000 },
  { sb: 4000, bb: 8000, ante: 8000 },
  { sb: 5000, bb: 10000, ante: 10000 },
  { sb: 7500, bb: 15000, ante: 15000 },
  { sb: 10000, bb: 20000, ante: 20000 },
];

// Note: the "ante" here is a single big-blind ante (one player posts it for the
// table). The engine posts `ante` per seated player for simplicity, so we scale
// it down when building a hand — see tournament.ts.

export function levelAt(i: number): Level {
  return BLIND_SCHEDULE[Math.min(Math.max(0, i), BLIND_SCHEDULE.length - 1)];
}
