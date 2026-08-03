// Single source: content/curriculum.md. Two levels:
//   "# Module Title"        → a module group
//   "## Chapter N — Title"   → a chapter (rendered as markdown in LessonBody)
// A chapter may end with check questions used to gate "Done":
//   @check Question? | Correct | Wrong | Wrong
import raw from "./curriculum.md?raw";

export interface Check {
  q: string;
  correct: string;
  wrong: string[];
}
export interface Chapter {
  id: string;
  gi: number; // global index (1-based)
  group: string;
  label: string; // "Chapter 1"
  title: string;
  body: string;
  checks: Check[];
}
export interface Group {
  title: string;
  chapters: Chapter[];
}

function extract(part: string): { body: string; checks: Check[] } {
  const checks: Check[] = [];
  const body = part
    .slice(part.indexOf("\n") + 1)
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      if (t.startsWith("@check ")) {
        const p = t.slice(7).split("|").map((s) => s.trim()).filter(Boolean);
        if (p.length >= 3) checks.push({ q: p[0], correct: p[1], wrong: p.slice(2) });
        return false;
      }
      return true;
    })
    .join("\n")
    .replace(/^\s*---\s*$/gm, "")
    .trim();
  return { body, checks };
}

function parse(): Group[] {
  const groups: Group[] = [];
  let gi = 0;
  for (const block of raw.split(/\n(?=# )/)) {
    const head = block.match(/^#\s+(.+)$/m);
    if (!head) continue;
    const gtitle = head[1].trim();
    const after = block.slice(block.indexOf("\n") + 1);
    const chapters: Chapter[] = [];
    for (const cp of after.split(/\n(?=## )/)) {
      const ch = cp.match(/^##\s+(.+)$/m);
      if (!ch) continue;
      const heading = ch[1].trim();
      const seg = heading.split(/\s+—\s+/);
      const label = seg.length > 1 ? seg[0].trim() : heading;
      const title = seg.length > 1 ? seg.slice(1).join(" — ").trim() : heading;
      const { body, checks } = extract(cp);
      gi += 1;
      chapters.push({ id: "c" + gi, gi, group: gtitle, label, title, body, checks });
    }
    if (chapters.length) groups.push({ title: gtitle, chapters });
  }
  return groups;
}

export const GROUPS: Group[] = parse();
export const CHAPTERS: Chapter[] = GROUPS.flatMap((g) => g.chapters);

export function chapterById(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}
export function nextChapter(id: string): Chapter | undefined {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  return i >= 0 ? CHAPTERS[i + 1] : undefined;
}
