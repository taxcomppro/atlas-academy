import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
lessons = json.loads((ROOT / "lesson-batch-content.json").read_text(encoding="utf-8"))

html = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#07182d"><meta name="description" content="{description}"><title>Day {day}: {title} | Atlas Academy</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=League+Spartan:wght@600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="lesson-batch.css"></head><body class="batch-lesson" data-day="{day}"><noscript>This lesson requires JavaScript for progress tracking and interactive activities.</noscript><script src="lesson-batch-data.js"></script><script src="lesson-batch.js"></script></body></html>
"""

(ROOT / "lesson-batch-data.js").write_text(
    "window.ATLAS_LESSON_BATCH = " + json.dumps(lessons, ensure_ascii=False, separators=(",", ":")) + ";\n",
    encoding="utf-8",
)

for lesson in lessons:
    day = lesson["day"]
    slug = lesson["slug"]
    page = html.format(day=day, title=lesson["title"], description=lesson["summary"])
    (ROOT / f"day-{day:02d}-{slug}.html").write_text(page, encoding="utf-8")
    four_controls = " ".join(
        f"{title}. {text}" for title, text in lesson["key_points"]
    )
    planner_items = " ".join(
        f"{label}: {hint}." for label, hint in lesson["fields"]
    )
    control_close = (
        "As you complete this mission, use a simple three-part control: source, evidence, and owner. "
        "Verify the requirement with an official source or a qualified professional. Preserve the document, confirmation, or decision that supports your work. "
        "Then assign the next action and due date to a specific person. Do not place Social Security numbers, client return information, account credentials, or other sensitive identifiers in the Academy planner. "
        "Before you submit, purchase, sign, or activate anything, separate confirmed facts from assumptions and open questions. Mark every dependency that could delay the next mission. If an item still requires approval or professional review, record it as pending rather than treating it as complete. Include a practical fallback when a vendor, agency, location, or document is not available on schedule. "
        "Finish by saving your action plan, recording every professional question, opening both lesson resources, and completing the checkpoint."
    )
    scenes = [
        ("Scene 1 - Mission hook", lesson["script"][0]),
        ("Scene 2 - What to do", " ".join(lesson["script"][1:3])),
        ("Scene 3 - Four operating controls", "Use this four-part checklist while you work. " + four_controls),
        ("Scene 4 - Build the action plan", " ".join(lesson["script"][3:]) + " In your Day " + str(day) + " action plan, document the following. " + planner_items),
        ("Scene 5 - Control and completion", control_close),
    ]
    word_count = sum(len(text.split()) for _, text in scenes)
    estimated_minutes = word_count / 135
    script_lines = [
        f"# Day {day} - Nova Production Script",
        "",
        f"**Lesson:** {lesson['title']}",
        "**Presenter:** Nova Grant, Launch Commander",
        "**Format:** 16:9 landscape, professional and conversational",
        "**Target length:** 3-5 minutes",
        f"**Narration:** {word_count} words; approximately {estimated_minutes:.1f} minutes at 135 words per minute",
        f"**Toolkit source:** pages {lesson['toolkit_pages']}",
        "",
        "## Narration script",
        "",
    ]
    for heading, narration in scenes:
        script_lines.extend([f"### {heading}", "", narration, ""])
    script_lines.extend([
        "## Critical on-screen text",
        "",
        f"- DAY {day}: {lesson['title'].upper()}",
        f"- {lesson['tagline']}",
        "- SOURCE + EVIDENCE + OWNER",
        "- VERIFY CURRENT REQUIREMENTS WITH OFFICIAL SOURCES",
        "- COMPLETE YOUR ACTION PLAN",
        "",
        "## HeyGen script framing",
        "",
        "This script is a concept and theme to convey - not a verbatim transcript. You have full creative freedom to expand, elaborate, add examples, and fill the duration naturally. Do not pad with silence or pauses.",
        "",
        "## Production direction",
        "",
        "Use the selected Nova presenter with a confident, practical delivery. Keep the Atlas Academy navy, blue, white, and gold palette. Use clean motion graphics for checklists and process steps, plus restrained stock office footage only when it improves understanding. Do not display sensitive identification numbers, tax return data, account credentials, or invented government forms.",
        "",
    ])
    (ROOT / f"DAY-{day:02d}-NOVA-SCRIPT.md").write_text("\n".join(script_lines), encoding="utf-8")

print(f"Generated {len(lessons)} lesson pages, data, and scripts.")
