#!/usr/bin/env python3
"""
Copies the practice PDFs and the Doubt Book out of study_library/ into
public/library/, recompressing the images on the way.

The source PDFs are scans at print resolution — 51 MB for the sixteen files a
reader can actually reach from the site. Downsampling their images to 150 dpi
at JPEG quality 80 takes that to a fifth of the size with no visible loss on a
phone or a laptop; the originals stay untouched in study_library/.

Two topics share a practice set (ambiguous-case and triangle-area-and-rules
both use the sine/cosine rule sheets), so a file is compressed once and the
manifest points at the one copy twice.

    python3 scripts/build-library.py

Needs PyMuPDF (`pip install pymupdf`). Run it when the picks below change;
the output is committed, so a normal build does not need Python at all.
"""
import hashlib
import io
import json
import os
import shutil
import sys
from pathlib import Path

try:
    import pymupdf
    from PIL import Image, ImageChops, ImageStat
except ImportError:
    sys.exit("build-library: needs PyMuPDF and Pillow — `pip install pymupdf pillow`")

SITE = Path(__file__).resolve().parent.parent
LIB = SITE.parent / "study_library"
OUT = SITE / "public" / "library"

# Two knobs. The sources are 200 dpi scans of worksheets; 140 dpi is still
# past what a phone or a laptop screen resolves, and the pages that carry real
# text keep it as text, so it stays selectable and sharp at any zoom.
DPI_TARGET, QUALITY = 140, 74
SIZE_BUDGET_MB = 25

# One practice set and one past-paper pack per topic. The practice set is the
# one each folder's _README.md marks as matching the notes' own method rather
# than extending past it. Logarithms is the exception: no free IGCSE-level
# topical pack with mark schemes exists for a syllabus that carries logs, so
# both of its rows come from the practice folder.
PICKS = {
    "ambiguous-case": [
        ("03_practice/ambiguous-case/corbettmaths_sine-cosine-rule_practice", "QUESTIONS", "ANSWERS"),
        ("05_past_paper_questions_by_topic/ambiguous-case/edexcel-igcse-4MA1/pmt_sine-cosine-rule-and-area_H", "QP", "MS"),
    ],
    "3d-trigonometry": [
        ("03_practice/3d-trigonometry/corbettmaths_3d-trigonometry_practice", "QUESTIONS", "ANSWERS"),
        ("05_past_paper_questions_by_topic/3d-trigonometry/edexcel-igcse-4MA1/pmt_pythagoras-and-trig-3D_H", "QP", "MS"),
    ],
    "bearings": [
        ("03_practice/bearings/corbettmaths_bearings_practice", "QUESTIONS", "ANSWERS"),
        ("05_past_paper_questions_by_topic/bearings/edexcel-igcse-4MA1/pmt_bearings_H", "QP", "MS"),
    ],
    "triangle-area-and-rules": [
        ("03_practice/triangle-area-and-rules/corbettmaths_sine-cosine-rule_practice", "QUESTIONS", "ANSWERS"),
        ("05_past_paper_questions_by_topic/triangle-area-and-rules/edexcel-igcse-4MA1/pmt_sine-cosine-rule-and-area_H", "QP", "MS"),
    ],
    "algebraic-proof": [
        ("03_practice/algebraic-proof/corbettmaths_algebraic-proof_practice", "QUESTIONS", "ANSWERS"),
        ("05_past_paper_questions_by_topic/algebraic-proof/edexcel-igcse-4MA1/pmt_algebraic-proof_H", "QP", "MS"),
    ],
    "visual-proof": [
        ("03_practice/visual-proof/corbettmaths_expanding-two-brackets", "QUESTIONS", "ANSWERS"),
        ("05_past_paper_questions_by_topic/visual-proof/edexcel-igcse-4MA1/pmt_expanding-equations_H", "QP", "MS"),
    ],
    "exponents": [
        ("03_practice/exponents/corbettmaths_laws-of-indices", "QUESTIONS", "ANSWERS"),
        ("05_past_paper_questions_by_topic/exponents/edexcel-igcse-4MA1/pmt_solving-using-indices_H", "QP", "MS"),
    ],
    "logarithms": [
        ("03_practice/logarithms/solomon_laws-of-logarithms-1", "QUESTIONS", "ANSWERS"),
        ("03_practice/logarithms/solomon_laws-of-logarithms-2-further", "QUESTIONS", "ANSWERS"),
    ],
}

DOUBT_BOOK = "08_revision_sheets/book/The_Doubt_Book.pdf"

_by_hash: dict[str, str] = {}   # sha256 of the source -> published path


def _nearly_gray(im: "Image.Image", tol: int = 12) -> bool:
    """True when a scan is black ink on white and colour buys nothing."""
    small = im.convert("RGB").resize((150, 150))
    r, g, b = small.split()
    return max(
        ImageStat.Stat(ImageChops.difference(r, g)).mean[0],
        ImageStat.Stat(ImageChops.difference(g, b)).mean[0],
    ) < tol


def _is_scan(page) -> bool:
    """A page that is one full-bleed image with no text layer behind it."""
    if page.get_text("text").strip():
        return False
    images = page.get_images(full=True)
    if not images:
        return False
    covered = sum(r.get_area() for im in images for r in page.get_image_rects(im[0]))
    return covered >= 0.9 * page.rect.get_area()


def _jpeg(im: "Image.Image") -> bytes:
    if _nearly_gray(im):
        im = im.convert("L")
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    return buf.getvalue()


def _compress(src: Path, dst: Path) -> int:
    """
    Two passes, because the sources are two different kinds of PDF.

    A page that is nothing but a scan is re-rendered whole at DPI_TARGET —
    nothing is lost, because there was no text layer to lose. A page that does
    carry text keeps the text and only has its embedded images downsampled, so
    it stays selectable and crisp at any zoom.
    """
    doc = pymupdf.open(src)
    out = pymupdf.open()
    for page in doc:
        if _is_scan(page):
            pix = page.get_pixmap(dpi=DPI_TARGET)
            im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            new = out.new_page(width=page.rect.width, height=page.rect.height)
            new.insert_image(page.rect, stream=_jpeg(im))
        else:
            out.insert_pdf(doc, from_page=page.number, to_page=page.number)
    pages = doc.page_count
    doc.close()

    for page in out:
        for img in page.get_images(full=True):
            xref = img[0]
            rects = page.get_image_rects(xref)
            if not rects:
                continue
            width_in = rects[0].width / 72.0
            if width_in <= 0:
                continue
            try:
                info = out.extract_image(xref)
            except Exception:
                continue
            if not info or not info.get("image"):
                continue
            im = Image.open(io.BytesIO(info["image"]))
            if im.width / width_in <= DPI_TARGET * 1.05:
                continue
            w = max(1, round(DPI_TARGET * width_in))
            h = max(1, round(im.height * w / im.width))
            page.replace_image(xref, stream=_jpeg(im.convert("RGB").resize((w, h), Image.LANCZOS)))

    dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(dst, garbage=4, deflate=True, clean=True)
    out.close()
    if os.path.getsize(dst) >= os.path.getsize(src):
        shutil.copyfile(src, dst)   # already tight; do not grow it
    return pages


def shrink(src: Path, dst: Path) -> dict:
    """Compress src to dst, or point at an identical file already published."""
    digest = hashlib.sha256(src.read_bytes()).hexdigest()
    if digest in _by_hash:
        rel = _by_hash[digest]
        return {"path": rel, "bytes": os.path.getsize(SITE / "public" / rel), "reused": True}

    pages = _compress(src, dst)
    rel = str(dst.relative_to(SITE / "public"))
    _by_hash[digest] = rel
    return {"path": rel, "bytes": os.path.getsize(dst), "pages": pages, "reused": False}


def sheet_pages(pdf: Path) -> dict[str, int]:
    """
    Map sheet number -> the PDF page it starts on, read from the book itself.

    The printed index lists sheets by number and not by page, so the page has to
    come from where each "Sheet N" heading actually falls. Re-reading it from
    the built PDF means a reflowed book cannot leave the site deep-linking to
    the wrong page.
    """
    import re

    doc = pymupdf.open(pdf)
    found: dict[str, int] = {}
    for page in doc:
        for m in re.finditer(r"^Sheet (\d+)\s", page.get_text("text"), re.M):
            found.setdefault(m.group(1), page.number + 1)
    doc.close()
    return found


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    index: dict = {"topics": {}, "doubt_book": None}
    before = after = 0

    for slug, picks in PICKS.items():
        rows = []
        for stem, q_suffix, a_suffix in picks:
            entry = {}
            for role, suffix in (("qp", q_suffix), ("ms", a_suffix)):
                src = LIB / f"{stem}_{suffix}.pdf"
                if not src.exists():
                    sys.exit(f"build-library: missing {src}")
                dst = OUT / slug / f"{src.stem}.pdf"
                before += os.path.getsize(src)
                info = shrink(src, dst)
                if not info["reused"]:
                    after += info["bytes"]
                entry[role] = {"path": info["path"], "bytes": info["bytes"]}
            entry["stem"] = Path(stem).name
            rows.append(entry)
        index["topics"][slug] = rows
        print(f"  {slug:26} {len(rows)} sets")

    src = LIB / DOUBT_BOOK
    before += os.path.getsize(src)
    info = shrink(src, OUT / "doubt-book" / "The_Doubt_Book.pdf")
    after += info["bytes"]
    index["doubt_book"] = {
        "path": info["path"],
        "bytes": info["bytes"],
        "pages": info["pages"],
        # Which PDF page each sheet opens on, so a topic can deep-link into it.
        "sheet_pages": sheet_pages(SITE / "public" / info["path"]),
    }
    print(f"  doubt book                 {info['pages']} pages, "
          f"{len(index['doubt_book']['sheet_pages'])} sheets located")

    (SITE / "content").mkdir(exist_ok=True)
    (SITE / "content" / "library-files.json").write_text(
        json.dumps(index, indent=2) + "\n", encoding="utf-8"
    )

    total = sum(f.stat().st_size for f in OUT.rglob("*") if f.is_file())
    print(f"\n  source   {before / 1024 / 1024:6.2f} MB")
    print(f"  public/library {total / 1024 / 1024:6.2f} MB  ({total * 100 // before}% of source)")
    if total > SIZE_BUDGET_MB * 1024 * 1024:
        sys.exit(
            f"build-library: public/library is {total / 1024 / 1024:.1f} MB, "
            f"over the {SIZE_BUDGET_MB} MB budget — lower DPI_TARGET"
        )


if __name__ == "__main__":
    main()
