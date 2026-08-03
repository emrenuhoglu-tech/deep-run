// Smoke test: run whole tournaments to completion with a bot-driven hero.
// Run: npx tsx src/engine/simcheck.ts
import { createTournament, startNextHand, heroAct, nextHand, heroToAct, handOver } from "./tournament";
import { botAction } from "./opponent";

let fails = 0;
let wins = 0;
const finishes: number[] = [];

for (let trial = 0; trial < 30; trial++) {
  const t = createTournament({ entrants: 40, handsPerLevel: 6 });
  startNextHand(t);
  let guard = 0;
  while (t.status === "playing") {
    if (++guard > 50000) {
      console.log("FAIL: tournament did not terminate (trial", trial, ")");
      fails++;
      break;
    }
    if (handOver(t)) {
      nextHand(t);
    } else if (heroToAct(t)) {
      heroAct(t, botAction(t.hand!, t.heroSeat));
    } else {
      console.log("FAIL: stalled with a bot to act (trial", trial, ")");
      fails++;
      break;
    }
  }
  if (t.status === "busted" || t.status === "won") {
    const f = t.heroFinish ?? -1;
    if (f < 1 || f > 40) {
      console.log("FAIL: bad finish", f);
      fails++;
    }
    if (t.status === "won" && f !== 1) {
      console.log("FAIL: won but finish != 1");
      fails++;
    }
    if (t.status === "won") wins++;
    finishes.push(f);
  }
}

const avgFinish = finishes.reduce((a, b) => a + b, 0) / (finishes.length || 1);
console.log(
  fails === 0
    ? `SIM OK: 30/30 tournaments completed. wins=${wins}, avg finish=${avgFinish.toFixed(1)}/40`
    : `SIM FAIL: ${fails} problem(s)`,
);
if (fails > 0) process.exit(1);
