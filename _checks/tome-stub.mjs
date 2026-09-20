/**
 * A read-only stand-in for Tome's backend on :8765, so its own /library page
 * renders its real shelf for the side-by-side screenshot. Serves one endpoint
 * with invented data; touches nothing in the reference project.
 */
import { createServer } from "node:http";

const library = {
  books: [
    { id: "bk_1", title: "Stewart — Calculus: Early Transcendentals", n_pages: 1368,
      n_concepts: 42, n_built: 17, cover_url: null, last_touched_at: "2026-09-18T09:12:00Z" },
    { id: "bk_2", title: "Griffiths — Introduction to Electrodynamics", n_pages: 620,
      n_concepts: 28, n_built: 6, cover_url: null, last_touched_at: "2026-09-11T17:40:00Z" },
    { id: "bk_3", title: "Strang — Linear Algebra and Its Applications", n_pages: 487,
      n_concepts: 21, n_built: 0, cover_url: null, last_touched_at: null },
  ],
  continue_lesson: {
    packet_id: "pk_9", concept_id: "cn_14",
    concept_title: "The Chain Rule", textbook_title: "Stewart — Calculus: Early Transcendentals",
    completion_pct: 60,
  },
};

createServer((req, res) => {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("content-type", "application/json");
  if (req.url.startsWith("/api/library")) return res.end(JSON.stringify(library));
  res.statusCode = 404;
  res.end("{}");
}).listen(8765, () => console.log("stub backend on :8765"));
