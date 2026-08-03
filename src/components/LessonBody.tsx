// Renders lesson markdown: ### subhead, - bullet, 1. ordered, > tip, **bold**,
// and GitHub-style | tables | (used for range/structure charts).
import type { ReactNode } from "react";

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold text-ink">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function Table({ rows }: { rows: string[] }) {
  const cells = rows
    .filter((r) => !/^\|?[\s:|-]+\|?$/.test(r)) // drop the |---| separator row
    .map((r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
  if (!cells.length) return null;
  const [head, ...body] = cells;
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} className="text-left font-semibold text-muted border-b border-line px-2 py-1.5 whitespace-nowrap">
                <Inline text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, r) => (
            <tr key={r}>
              {row.map((c, i) => (
                <td key={i} className="border-b border-line/60 px-2 py-1.5 align-top">
                  <Inline text={c} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LessonBody({ body }: { body: string }) {
  const lines = body.split("\n");
  const out: ReactNode[] = [];
  let bullets: string[] = [];
  let ordered: string[] = [];
  let table: string[] = [];

  const flush = (key: string) => {
    if (bullets.length) {
      const items = bullets.slice();
      bullets = [];
      out.push(
        <ul key={"u" + key} className="space-y-1.5 pl-1">
          {items.map((b, i) => (
            <li key={i} className="flex gap-2 text-[15px] leading-relaxed text-ink/90">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
              <span>
                <Inline text={b} />
              </span>
            </li>
          ))}
        </ul>,
      );
    }
    if (ordered.length) {
      const items = ordered.slice();
      ordered = [];
      out.push(
        <ol key={"o" + key} className="space-y-1.5">
          {items.map((b, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-ink/90">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-surface2 text-xs font-bold text-teal">
                {i + 1}
              </span>
              <span className="pt-0.5">
                <Inline text={b} />
              </span>
            </li>
          ))}
        </ol>,
      );
    }
    if (table.length) {
      const t = table.slice();
      table = [];
      out.push(<Table key={"t" + key} rows={t} />);
    }
  };

  lines.forEach((rawLine, i) => {
    const t = rawLine.trim();
    const key = "l" + i;
    if (t.startsWith("|")) {
      if (bullets.length || ordered.length) flush(key);
      table.push(t);
      return;
    }
    if (table.length) flush(key); // a non-table line ends a table
    if (!t) {
      flush(key);
      return;
    }
    if (t.startsWith("### ")) {
      flush(key);
      out.push(
        <h3 key={key} className="pt-2 text-[15px] font-bold text-ink">
          {t.slice(4)}
        </h3>,
      );
      return;
    }
    if (t.startsWith("> ")) {
      flush(key);
      out.push(
        <div key={key} className="rounded-lg border-l-2 border-gold bg-gold/10 px-3 py-2 text-[14px] leading-relaxed text-ink/90">
          <Inline text={t.slice(2)} />
        </div>,
      );
      return;
    }
    if (t.startsWith("- ")) {
      if (ordered.length) flush(key);
      bullets.push(t.slice(2));
      return;
    }
    const ordM = t.match(/^\d+\.\s+(.*)$/);
    if (ordM) {
      if (bullets.length) flush(key);
      ordered.push(ordM[1]);
      return;
    }
    flush(key);
    out.push(
      <p key={key} className="text-[15px] leading-relaxed text-ink/90">
        <Inline text={t} />
      </p>,
    );
  });
  flush("end");

  return <div className="space-y-3">{out}</div>;
}
