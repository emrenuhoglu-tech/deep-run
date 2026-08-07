import type { Card } from "../engine/cards";
import { RANKS } from "../engine/cards";

const SUIT_CH = ["♣", "♦", "♥", "♠"];
const SUIT_NAME = ["clubs", "diamonds", "hearts", "spades"];

export function PlayingCard({
  card,
  hidden,
  small,
  deal,
  flip,
  delay,
}: {
  card?: Card;
  hidden?: boolean;
  small?: boolean;
  /** slide-and-rotate entrance (hole cards) */
  deal?: boolean;
  /** flip-reveal entrance (board runout) */
  flip?: boolean;
  /** stagger, in ms */
  delay?: number;
}) {
  const sz = small ? "w-7 h-10" : "w-10 h-14";
  const anim = flip ? "anim-flip" : deal ? "anim-deal" : "";
  const style = delay ? { animationDelay: `${delay}ms` } : undefined;

  if (hidden || !card) {
    return (
      <div
        className={`${sz} rounded-md border border-line bg-surface2 grid place-items-center ${anim}`}
        style={style}
        aria-hidden
      >
        <div className="w-3.5 h-5 rounded-sm border border-teal/40 bg-teal/15" />
      </div>
    );
  }

  const red = card.s === 1 || card.s === 2;
  const rank = RANKS[card.r].trim();
  const suit = SUIT_CH[card.s];
  const rankSz = small ? "text-[9px]" : "text-[11px]";
  const suitSz = small ? "text-base" : "text-2xl";

  return (
    <div
      className={`relative ${sz} rounded-md bg-white shadow-sm select-none ${anim} ${
        red ? "text-red-600" : "text-neutral-900"
      }`}
      style={style}
      role="img"
      aria-label={`${rank} of ${SUIT_NAME[card.s]}`}
    >
      <span className={`absolute top-0.5 left-1 font-bold leading-none ${rankSz}`}>{rank}</span>
      <span className={`absolute inset-0 grid place-items-center leading-none ${suitSz}`}>{suit}</span>
      <span className={`absolute bottom-0.5 right-1 rotate-180 font-bold leading-none ${rankSz}`}>{rank}</span>
    </div>
  );
}
