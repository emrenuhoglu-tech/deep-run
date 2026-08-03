import type { Card } from "../engine/cards";
import { RANKS } from "../engine/cards";

const SUIT_CH = ["♣", "♦", "♥", "♠"];

export function PlayingCard({
  card,
  hidden,
  small,
}: {
  card?: Card;
  hidden?: boolean;
  small?: boolean;
}) {
  const sz = small ? "w-7 h-10 text-xs" : "w-10 h-14 text-lg";
  if (hidden || !card) {
    return (
      <div
        className={`${sz} rounded-md border border-line bg-surface2 grid place-items-center`}
        aria-hidden
      >
        <div className="w-3 h-3 rounded-sm bg-teal/30" />
      </div>
    );
  }
  const red = card.s === 1 || card.s === 2;
  return (
    <div
      className={`${sz} rounded-md bg-white grid place-items-center font-bold leading-none ${red ? "text-red-600" : "text-neutral-900"}`}
      role="img"
      aria-label={`${RANKS[card.r].trim()} of ${["clubs", "diamonds", "hearts", "spades"][card.s]}`}
    >
      <div>
        {RANKS[card.r].trim()}
        {SUIT_CH[card.s]}
      </div>
    </div>
  );
}
