# Copy rewrite — before → after

Every string on the site was drafted, then rewritten with the `human-rewrite`
skill for a Grade-10 reader. This file is the record: the draft on the left,
what shipped on the right, and a note where the meaning moved.

- **Audience** a 15-year-old revising for a weekly maths quiz.
- **Register** plain interface text, second person where it is natural, no
  marketing voice, no internal vocabulary.
- **Excluded from rewriting** mathematical notation, and the eight topic titles,
  which are fixed by `study_library/01_syllabus/quiz_scope.md`.
- **References** the Human Reference Index was consulted and returned
  `no_accepted_references` (112 candidates ranked, none accepted), so the
  rewrite proceeded without them.
- **Preservation checklist** 20 rows, built from the draft before rewriting;
  reproduced at the end of this file.

Strings live in `lib/copy.ts`. The shipped column is what that file contains.

---

## A. Site identity

| | draft | shipped |
|---|---|---|
| A1 brand | Maths Revision | *unchanged* |
| A2 title | Maths Revision | *unchanged* |
| A3 meta description | Interactive pages for the eight topics in the G10 maths quiz, with practice papers and revision sheets. | The eight topics in the G10 maths quiz: how each method works, questions with answers, and revision sheets. |

`Interactive pages` and `practice papers` were the site talking about itself.
The rewrite says what a reader gets instead.

## B. Home hero

| | draft | shipped |
|---|---|---|
| B1 pill | Eight topics | *unchanged* |
| B2 h1 | Eight topics. See each one move. | Eight topics. Know which move to make. |
| B3 subtitle | Each topic opens up into the method, a set of questions with answers, and a fifteen-minute revision sheet. Some also have a diagram you can drag. | Open any topic for the method, questions with answers, and a fifteen-minute sheet. Some come with a diagram you can pull apart. |
| B4 primary button | Start with Visual Proof | *unchanged* |
| B5 secondary button | Doubt Book | Open the Doubt Book |
| B6 section label | Topics | *unchanged* |

**B2 is a repair, not a restyle.** The draft's "see each one move" promised an
animation on all eight topics; seven have no diagram at all. The shipped line
keeps the count and drops the promise, and picks up the phrase the sheets
themselves turn on — deciding which move to make rather than grinding the
arithmetic. Checklist row 3's *some, not all* survives in B3.

## C. Navigation

| | draft | shipped |
|---|---|---|
| C1–C3 links | Topics · Doubt Book · Reference | *unchanged* |
| C4 back link | All topics | *unchanged* |

## D. Topic row and topic page

| | draft | shipped |
|---|---|---|
| D5 meta | 1 interactive | 1 diagram |
| D6 meta | no interactive yet | no diagram yet |
| D9 block heading | Interactive | Diagram |
| D10 block heading | The moves | *unchanged* |
| D11 block heading | Practise | *unchanged* |
| D18 link | Open the topic | Open this topic |

"Interactive" used as a noun is exactly the internal vocabulary the brief asks
to remove; a student calls it a diagram. "The moves" stays — it is the phrase
the sheets use, and it is plain English.

## E. Topic blurbs

Every identity and value is carried across unchanged (checklist row 20); what
changes is that each blurb becomes a sentence instead of a list of nouns.

| | draft | shipped |
|---|---|---|
| E1 visual-proof | (a+b)², (a−b)², a²−b² and Pythagoras, with draggable pieces. | Four squares, cut into pieces you can drag. Move them and (a+b)², (a−b)², a²−b² and Pythagoras fall out. |
| E2 ambiguous-case | The perpendicular height 12 sin 30° = 6 as the critical value: no triangle, exactly one, or two. | Drop the height — here 12 sin 30° = 6 — and compare it with the side you were given. That tells you whether there are two triangles, one, or none. |
| E3 3d-trigonometry | Finding the right-angled triangle hiding inside a cuboid, and the angle a diagonal makes with the base. | Find the right-angled triangle hiding inside the cuboid, then the angle its diagonal makes with the base. |
| E4 bearings | North lines at the point you measure from, three-figure bearings including reflex, and a two-leg journey. | Draw the north line at the point you are measuring from, then read clockwise. Three figures every time, even past 180°. |
| E5 triangle-area-and-rules | One dropped height derives ½ab sin C, the sine rule, and a² = b² + c² − 2bc cos A. | Drop one perpendicular and all three fall out: ½ab sin C, the sine rule, and a² = b² + c² − 2bc cos A. |
| E6 algebraic-proof | Consecutive odd numbers, two independent letters, place value as 10x + y, and reaching 2(…) or 2(…)+1. | Call an odd number 2n+1, reach for a second letter when the two are independent, and write a two-digit number as 10x + y. You are aiming to land on 2(…) or 2(…)+1. |
| E7 exponents | Common bases, equating indices, splitting a²ˣ⁺¹, and the disguised quadratic y = 3ˣ. | Get both sides onto one base, then match the powers. Split a²ˣ⁺¹ when you need to, and spot the quadratic hiding behind y = 3ˣ. |
| E8 logarithms | log₄32 = x as 4ˣ = 32, splitting log(100x⁴/y⁶), change of base, and rejecting invalid solutions. | Turn log₄32 = x back into 4ˣ = 32, split log(100x⁴/y⁶) apart, and change the base when they do not match. Then check which solutions you have to reject. |

## F. Interactive page titles

The draft ran the same `Topic — subtitle` shape eight times, and repeated the
topic title that is already on the row above it. The shipped titles say what
the diagram does.

| | draft | shipped |
|---|---|---|
| F1 visual-proof | Visual Proof — four area dissections | Four dissections you can drag |
| F2 ambiguous-case | Ambiguous Case — when does the triangle close? | How many triangles close? |
| F3 3d-trigonometry | 3D Trigonometry — the angle between a line and a plane | The triangle inside the cuboid |
| F4 bearings | Bearings — drawing the diagram | Drawing the bearing |
| F5 triangle-area-and-rules | Area, Sine Rule, Cosine Rule — the shared perpendicular | One perpendicular, three rules |
| F6 algebraic-proof | Algebraic Proof — 2n+1 and the forms you aim for | From 2n+1 to the form you want |
| F7 exponents | Exponents — get everything onto a common base | Onto a common base |
| F8 logarithms | Logarithms — index form, splitting, change of base | Index form, splitting, change of base |

## G. Doubt Book page

The four intro paragraphs are rewritten from `src/00_front.md`. Checklist rows
6–11 are all load-bearing here and all survive.

| | draft | shipped |
|---|---|---|
| G2 subtitle | Thirty fifteen-minute revision sheets | Thirty sheets, fifteen minutes each |
| G3 | Each sheet is one reading activity, about fifteen minutes, meant for the start of a lesson. You do not have to work through them in order, but within a strand each sheet assumes the one before it. | Each sheet takes about fifteen minutes and is meant for the start of a lesson. You can take them in any order, but inside a strand each sheet assumes the one before it. |
| G4 | Work down the page in order. When you reach a Pause, stop and write something on the ruled lines before you read on — even a guess. The explanation that follows will settle it. The pauses are the point of the sheet; skipping them turns a thinking activity into a reading activity. | Work down the page in order. At every Pause, stop and write something on the lines before you read on — a guess is fine. The explanation right after it will settle the matter. The pauses are the sheet: skip them and you are reading instead of thinking. |
| G5 | The last question on every sheet is different. It has no explanation after it, only a box to work in. Try it properly before you turn to Check after you try at the foot of the sheet. | The last question on each sheet is different. Nothing explains it — there is only a box. Have a real go before you look at Check after you try at the bottom. |
| G6 | Where something is left blank, that is the space meant for you. If you need more room, use the facing page. | Blank space is yours. If you run out of it, use the facing page. |
| G12 table header | Sheet | What it covers |

## H. Reference page

| | draft | shipped |
|---|---|---|
| H2 subtitle | The formula sheet you are given in the exam, and what each command word is asking you to do. | What you are handed in the exam, and what the question words are actually asking for. |
| H3 section heading | Formulas given to you | Formulas you are given |
| H4 section intro | This list is printed on page 2 of the exam paper. You do not have to memorise it — but you do have to know which one to reach for. | This is printed on page 2 of the paper. You do not have to learn it. You do have to know which line to reach for. |
| H6 section intro | The word a question opens with tells you what kind of answer earns the marks. | The word a question opens with tells you what kind of answer gets the marks. |
| H7 external link line | Past papers and mark schemes are on the Cambridge website. | *unchanged* |

## I. Empty states

| | draft | shipped |
|---|---|---|
| I1 | There is no diagram for this topic yet. The method, the practice questions and the revision sheets below are all ready. | No diagram for this one yet. The method, the questions and the sheets below are all here. |

## J. Footer

| | draft | shipped |
|---|---|---|
| J1 | Made from the class revision notes. | *unchanged* |

Fixed by the brief, and the site's only claim about where it came from.

## K. Standalone visualisation page

| | draft | shipped |
|---|---|---|
| K1 footer | These diagrams come from the handwritten notes, pages IMG_0256 and IMG_0257. Steps marked ⊕ are not written on the page. | The diagrams are from the class notes. The steps marked ⊕ are not — they finish an argument the notes leave hanging. |
| K2 badge | not written on the page | not in the notes |
| K3 why, card 2 | The notes draw this square and stop, so here is the algebra the picture is pointing at. | The notes draw this square and stop. Here is the algebra it is pointing at. |
| K4 why, card 3 | The notes draw this cut and stop, so here is the rearrangement the picture is pointing at. | The notes draw this cut and stop. Here is the rearrangement it is pointing at. |
| K5 why, card 4 | The notes stop after those two lines, so here are the last two steps. | The notes stop after those two lines. Here are the last two. |

K6–K11 (the four card leads and the two drag instructions) already described
the diagrams plainly and are unchanged.

---

## Note on two instructed changes

Both are drift against the draft, recorded here rather than quietly repaired:

1. **K1 loses its photo numbers.** `IMG_0256` and `IMG_0257` were the draft's
   evidence for where the diagrams came from. The handwritten material is off
   the site at the user's instruction, so the citation goes with it. The
   substantive negation — the ⊕ steps are additions, not something the notes
   contain — is kept in both K1 and K2.
2. **Provenance moves out of the hero.** The draft's hero claimed the class
   notes as a source; the brief puts that claim in exactly one place. It now
   appears only in the footer, J1, unchanged.

Neither is a style decision, and neither was made silently.

---

## Preservation checklist

| # | type | item (as the draft commits to it) | source span |
|---|---|---|---|
| 1 | quantity | eight topics | "Eight topics" (B1, B2) |
| 2 | claim | every topic gives the method, questions **with answers**, and a fifteen-minute revision sheet | "the method, a set of questions with answers, and a fifteen-minute revision sheet" (B3) |
| 3 | condition | the draggable diagram is on **some** topics, not all | "**Some** also have a diagram you can drag" (B3) |
| 4 | claim | Visual Proof is the one to start with | "Start with Visual Proof" (B4) |
| 5 | quantity | thirty sheets, fifteen minutes each | "Thirty fifteen-minute revision sheets" (G2) |
| 6 | claim | a sheet is meant for the start of a lesson | "meant for the start of a lesson" (G3) |
| 7 | negation + condition | order is **not** required overall, but **within a strand** each sheet assumes the one before it | "You do not have to work through them in order, but within a strand each sheet assumes the one before it" (G3) |
| 8 | claim | at a Pause you write **before** reading on, and a guess counts | "stop and write something on the ruled lines before you read on — even a guess" (G4) |
| 9 | causal | skipping the pauses converts a thinking activity into a reading activity | "skipping them turns a thinking activity into a reading activity" (G4) |
| 10 | claim + negation | the last question has **no** explanation, only a box; try it before turning to "Check after you try" | "no explanation after it, only a box to work in. Try it properly before you turn to Check after you try" (G5) |
| 11 | claim | blank space is the reader's; the facing page is the overflow | "that is the space meant for you. If you need more room, use the facing page" (G6) |
| 12 | evidence | the formula list is printed on page 2 of the exam paper | "printed on page 2 of the exam paper" (H4) |
| 13 | negation + claim | you need **not** memorise the list, but you **do** need to know which to reach for | "You do not have to memorise it — but you do have to know which one to reach for" (H4) |
| 14 | claim | the opening command word determines what kind of answer earns the marks | "tells you what kind of answer earns the marks" (H6) |
| 15 | claim | past papers and mark schemes live on the Cambridge website | "on the Cambridge website" (H7) |
| 16 | claim | where a topic has no diagram, the method, questions and sheets are nevertheless ready | "The method, the practice questions and the revision sheets below are all ready" (I1) |
| 17 | claim | provenance of the whole site: the class revision notes | "Made from the class revision notes." (J1) |
| 18 | negation | the ⊕ steps are **not** written in the notes — they are additions | "Steps marked ⊕ are not written on the page" (K1, K2) |
| 19 | claim | the notes draw the figure and stop; the algebra shown is what the picture points at | "The notes draw this square and stop, so here is the algebra the picture is pointing at" (K3) |
| 20 | maths (fixed) | every identity, value and expression in E1–E8 and K6–K9 | "12 sin 30° = 6", "a² = b² + c² − 2bc cos A", "log₄32 = x", "10x + y", "2(…)+1" … |
