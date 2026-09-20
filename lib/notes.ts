/**
 * The 18 source photographs, grouped the way the notes themselves are: by
 * document, then by the topic the sheet belongs to.
 *
 * Captions and topic assignment come from
 * study_library/notes_transcription/_photo_index.md (the "Primary sheet
 * contents" column) and study_library/01_syllabus/quiz_scope.md. Two sheets
 * carry two topics each — IMG_0251 (3D Trig pointers and the Bearings sketch)
 * and IMG_0260 (the Exponents heading, with a cosine-rule sheet visible in the
 * left margin) — so they are listed under both, and `shared` says so.
 */

export type NotePhoto = {
  /** File stem, e.g. `IMG_0249`. */
  id: string;
  /** One line describing what the sheet shows. */
  caption: string;
  /** Set when the same sheet is also listed under another topic. */
  shared?: string;
};

export type NoteTopicGroup = {
  slug: string;
  title: string;
  photos: NotePhoto[];
};

export type NoteDocumentGroup = {
  id: string;
  title: string;
  topics: NoteTopicGroup[];
};

export const noteGroups: NoteDocumentGroup[] = [
  {
    id: "essential-math",
    title: "G10 UWCE Essential Math",
    topics: [
      {
        slug: "ambiguous-case",
        title: "Ambiguous Case",
        photos: [
          {
            id: "IMG_0249",
            caption:
              "Document heading; ① Ambiguous Case; sine-rule worked example giving 38.7° and 141.3°.",
          },
          {
            id: "IMG_0250",
            caption:
              "Continued: BC = 6/sin x, and the no-triangle / one-triangle / two-triangle conditions.",
          },
        ],
      },
      {
        slug: "3d-trigonometry",
        title: "3D Trigonometry",
        photos: [
          {
            id: "IMG_0251",
            caption:
              "② 3D Trig — two starred pointers: find the right-angled triangle, and the angle between a line and a plane.",
            shared: "Bearings",
          },
        ],
      },
      {
        slug: "bearings",
        title: "Bearings",
        photos: [
          {
            id: "IMG_0251",
            caption:
              "③ Bearings — the sketch: 8 km and 11 km from A, 19° and 41° from north, and a reflex 341°.",
            shared: "3D Trigonometry",
          },
        ],
      },
      {
        slug: "triangle-area-and-rules",
        title: "Area of a Triangle, Sine Rule, Cosine Rule",
        photos: [
          {
            id: "IMG_0258",
            caption:
              "A = ½ab sin C derived from ½bh; the sine-rule setup sin A = h/b, sin B = h/a. No heading on the sheet.",
          },
          {
            id: "IMG_0259",
            caption:
              "The full cosine-rule derivation to a² = b² + c² − 2bc cos A. No heading on the sheet.",
          },
          {
            id: "IMG_0260",
            caption:
              "In the left margin, a second sheet in blue pen: the cosine rule applied to an obtuse angle, cos B = −11/24.",
            shared: "Exponents",
          },
        ],
      },
    ],
  },
  {
    id: "math-plus",
    title: "Math Plus",
    topics: [
      {
        slug: "algebraic-proof",
        title: "Algebraic Proof",
        photos: [
          {
            id: "IMG_0252",
            caption:
              "Document heading; ① Algebraic Proof; Scenario 1 — the sum of two consecutive odd numbers is even.",
          },
          {
            id: "IMG_0253",
            caption:
              "★ Exemplar: a two-digit number 10x + y minus its reverse, including the borrow-10 step.",
          },
          {
            id: "IMG_0254",
            caption:
              "Scenario 2 — a product of two odd numbers is odd; Scenario 3 — a difference of odd squares is a multiple of 8.",
          },
          {
            id: "IMG_0255",
            caption:
              "The end of the exemplar, reaching 99. The leading digit of the first term is outside the frame.",
          },
        ],
      },
      {
        slug: "visual-proof",
        title: "Visual Proof",
        photos: [
          {
            id: "IMG_0256",
            caption: "② Visual Proof; the area squares for (a+b)² and (a−b)².",
          },
          {
            id: "IMG_0257",
            caption:
              "a² − b² = (a+b)(a−b) by dissection; Pythagoras from four triangles in a square of side a+b.",
          },
        ],
      },
      {
        slug: "exponents",
        title: "Exponents",
        photos: [
          {
            id: "IMG_0260",
            caption:
              "★ Important questions to cover, with “Exponents” circled; 9^(x+1) + 1 = 10 × 3^x.",
            shared: "Area of a Triangle, Sine Rule, Cosine Rule",
          },
          {
            id: "IMG_0261",
            caption:
              "16^(x−1) = 6^(4x) solved in terms of log 2 and log 3, giving x = −log 2 / log 3.",
          },
          {
            id: "IMG_0262",
            caption:
              "2^(4x+1) × 5^(3x−1) = 2^(3x−2) × 5^(2x+1), collected to 10^x = 25/8.",
          },
          {
            id: "IMG_0263",
            caption:
              "Simultaneous exponentials reduced to 3x + 3y = −2 and 3x − y − 2 = −2.",
          },
          {
            id: "IMG_0264",
            caption:
              "64 × 4^y = 16^x giving y = 2x − 3, substituted into 3^y = 4 × 3^(x−2) − 1.",
          },
        ],
      },
      {
        slug: "logarithms",
        title: "Logarithms",
        photos: [
          {
            id: "IMG_0265",
            caption:
              "Change of base on two equations; ★ simplification — given log₂a = x, express log₈a.",
          },
          {
            id: "IMG_0266",
            caption:
              "④ Logarithms: exact values, the splitting laws, and solving — rejecting invalid roots, substitution.",
          },
        ],
      },
    ],
  },
];

/** Distinct photographs across every group. */
export const notePhotoCount = new Set(
  noteGroups.flatMap((d) => d.topics.flatMap((t) => t.photos.map((p) => p.id))),
).size;
