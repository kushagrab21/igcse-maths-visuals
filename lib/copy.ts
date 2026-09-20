/**
 * Every string a reader sees, in one place.
 *
 * These are the rewritten versions. The drafts they came from, and the
 * reasoning for each change, are in COPY_REWRITE.md — edit here and record the
 * change there. Mathematical notation and the eight topic titles are fixed and
 * were not rewritten.
 */

export const site = {
  brand: "Maths Revision",
  title: "Maths Revision",
  description:
    "The eight topics in the G10 maths quiz: how each method works, questions with answers, and revision sheets.",
  footer: "Made from the class revision notes.",
} as const;

export const home = {
  pill: "Eight topics",
  heading: "Eight topics. Know which move to make.",
  subtitle:
    "Open any topic for the method, questions with answers, and a fifteen-minute sheet. Every one comes with a diagram you can pull apart.",
  primaryCta: "Start with Visual Proof",
  secondaryCta: "Open the Doubt Book",
  sectionLabel: "Topics",
  searchPlaceholder: "Search topics",
  searchEmpty: (q: string) => `Nothing matches “${q}”.`,
} as const;

export const nav = {
  topics: "Topics",
  doubtBook: "Doubt Book",
  reference: "Reference",
  back: "All topics",
} as const;

export const topic = {
  diagram: "Diagram",
  moves: "The moves",
  practise: "Practise",
  doubtBook: "Doubt Book",
  questions: "Questions",
  answers: "Answers",
  comingSoon: "coming soon",
  ready: "Ready",
  notReady: "Coming soon",
  open: "Open this topic",
  noDiagram:
    "No diagram for this one yet. The method, the questions and the sheets below are all here.",
  /** Row meta: "Essential Math · 2 sheets · 1 diagram". */
  meta: (document: string, sheets: number, hasDiagram: boolean) =>
    [
      document,
      sheets === 1 ? "1 sheet" : `${sheets} sheets`,
      hasDiagram ? "1 diagram" : "no diagram yet",
    ].join(" · "),
  sheetRange: (ids: string[]) =>
    ids.length === 1 ? `Sheet ${ids[0]}` : `Sheets ${ids[0]}–${ids[ids.length - 1]}`,
} as const;

export const doubtBook = {
  heading: "The Doubt Book",
  subtitle: "Thirty sheets, fifteen minutes each",
  intro: [
    "Each sheet takes about fifteen minutes and is meant for the start of a lesson. You can take them in any order, but inside a strand each sheet assumes the one before it.",
    "Work down the page in order. At every Pause, stop and write something on the lines before you read on — a guess is fine. The explanation right after it will settle the matter. The pauses are the sheet: skip them and you are reading instead of thinking.",
    "The last question on each sheet is different. Nothing explains it — there is only a box. Have a real go before you look at Check after you try at the bottom.",
    "Blank space is yours. If you run out of it, use the facing page.",
  ],
  download: "Download the book",
  indexLabel: "All thirty sheets",
  columns: {
    number: "No.",
    strand: "Strand",
    title: "What it covers",
    topic: "Topic",
  },
} as const;

export const reference = {
  heading: "Reference",
  subtitle:
    "What you are handed in the exam, and what the question words are actually asking for.",
  formulae: {
    heading: "Formulas you are given",
    intro:
      "This is printed on page 2 of the paper. You do not have to learn it. You do have to know which line to reach for.",
  },
  commandWords: {
    heading: "Command words",
    intro:
      "The word a question opens with tells you what kind of answer gets the marks.",
  },
  external: {
    line: "Past papers and mark schemes are on the Cambridge website.",
    label: "Cambridge past papers",
    href: "https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-mathematics-0580/past-papers/",
  },
} as const;

/**
 * Per-topic strings. `title` is fixed by the quiz scope and was not rewritten;
 * `blurb` and `vizTitle` were.
 */
export const topics = {
  "ambiguous-case": {
    blurb:
      "Drop the height — here 12 sin 30° = 6 — and compare it with the side you were given. That tells you whether there are two triangles, one, or none.",
    vizTitle: "How many triangles close?",
  },
  "3d-trigonometry": {
    blurb:
      "Find the right-angled triangle hiding inside the cuboid, then the angle its diagonal makes with the base.",
    vizTitle: "The triangle inside the cuboid",
  },
  bearings: {
    blurb:
      "Draw the north line at the point you are measuring from, then read clockwise. Three figures every time, even past 180°.",
    vizTitle: "Drawing the bearing",
  },
  "triangle-area-and-rules": {
    blurb:
      "Drop one perpendicular and all three fall out: ½ab sin C, the sine rule, and a² = b² + c² − 2bc cos A.",
    vizTitle: "One perpendicular, three rules",
  },
  "algebraic-proof": {
    blurb:
      "Call an odd number 2n+1, reach for a second letter when the two are independent, and write a two-digit number as 10x + y. You are aiming to land on 2(…) or 2(…)+1.",
    vizTitle: "From 2n+1 to the form you want",
  },
  "visual-proof": {
    blurb:
      "Four squares, cut into pieces you can drag. Move them and (a+b)², (a−b)², a²−b² and Pythagoras fall out.",
    vizTitle: "Four dissections you can drag",
  },
  exponents: {
    blurb:
      "Get both sides onto one base, then match the powers. Split a²ˣ⁺¹ when you need to, and spot the quadratic hiding behind y = 3ˣ.",
    vizTitle: "Onto a common base",
  },
  logarithms: {
    blurb:
      "Turn log₄32 = x back into 4ˣ = 32, split log(100x⁴/y⁶) apart, and change the base when they do not match. Then check which solutions you have to reject.",
    vizTitle: "Index form, splitting, change of base",
  },
} as const;

export type TopicSlug = keyof typeof topics;
