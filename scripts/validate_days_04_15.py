import json
import re
from pathlib import Path
from pypdf import PdfReader

root = Path(__file__).resolve().parents[1]
lessons = json.loads((root / "lesson-batch-content.json").read_text(encoding="utf-8"))
assert len(lessons) == 12
assert [lesson["day"] for lesson in lessons] == list(range(4, 16))

missing = []
bad_pdfs = []
for lesson in lessons:
    day = lesson["day"]
    title_slug = "-".join(word.capitalize() for word in lesson["slug"].split("-"))
    expected = [
        root / f"day-{day:02d}-{lesson['slug']}.html",
        root / f"DAY-{day:02d}-NOVA-SCRIPT.md",
        root / "downloads" / f"Day-{day:02d}-{title_slug}-Worksheet.pdf",
    ]
    missing.extend(str(path) for path in expected if not path.exists())
    pdf = expected[2]
    if pdf.exists():
        reader = PdfReader(str(pdf))
        if len(reader.pages) != 3:
            bad_pdfs.append((str(pdf), len(reader.pages)))
    script_text = expected[1].read_text(encoding="utf-8")
    narration = re.search(r"\*\*Narration:\*\* (\d+) words", script_text)
    assert narration, f"Missing narration count: {expected[1]}"
    assert 405 <= int(narration.group(1)) <= 675, f"Script outside 3-5 minute range: {expected[1]}"
    for title, _ in lesson["key_points"]:
        assert title in script_text, f"Missing key point '{title}' in {expected[1]}"
    for label, _ in lesson["fields"]:
        assert label in script_text, f"Missing action field '{label}' in {expected[1]}"

assert not missing, f"Missing files: {missing}"
assert not bad_pdfs, f"Unexpected page counts: {bad_pdfs}"
print(f"Validated {len(lessons)} lessons, scripts, and 36 worksheet pages.")
