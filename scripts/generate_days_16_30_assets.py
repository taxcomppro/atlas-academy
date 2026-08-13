import json
import sys
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "downloads"
lessons = json.load(sys.stdin)

NAVY = colors.HexColor("#07182D")
BLUE = colors.HexColor("#229BD6")
GOLD = colors.HexColor("#F2C445")
INK = colors.HexColor("#173247")
MUTED = colors.HexColor("#5D7282")
LINE = colors.HexColor("#D7E4EC")
WASH = colors.HexColor("#F2F7F9")
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleWhite", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=25, leading=27, textColor=colors.white, alignment=TA_CENTER, spaceAfter=10))
styles.add(ParagraphStyle(name="Kicker", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=BLUE, tracking=1.2, spaceAfter=7))
styles.add(ParagraphStyle(name="Heading", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=17, leading=20, textColor=NAVY, spaceAfter=8))
styles.add(ParagraphStyle(name="BodyA", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.2, leading=13.5, textColor=INK))
styles.add(ParagraphStyle(name="SmallA", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.8, leading=10.5, textColor=MUTED))
styles.add(ParagraphStyle(name="CardTitle", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=10.5, leading=12, textColor=NAVY, spaceAfter=4))

def footer(canvas, doc, lesson):
    canvas.saveState()
    canvas.setStrokeColor(LINE); canvas.line(.65*inch,.52*inch,7.85*inch,.52*inch)
    canvas.setFont("Helvetica",7); canvas.setFillColor(MUTED)
    canvas.drawString(.65*inch,.34*inch,f"ATLAS ACADEMY | DAY {lesson['day']} | TOOLKIT-DERIVED WORKSHEET")
    canvas.drawRightString(7.85*inch,.34*inch,f"PAGE {doc.page}")
    canvas.restoreState()

def line_box(label, hint):
    content=[Paragraph(label,styles["CardTitle"]),Paragraph(hint,styles["SmallA"]),Spacer(1,32)]
    table=Table([[content]],colWidths=[3.38*inch])
    table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),colors.white),("BOX",(0,0),(-1,-1),.8,LINE),("LEFTPADDING",(0,0),(-1,-1),12),("RIGHTPADDING",(0,0),(-1,-1),12),("TOPPADDING",(0,0),(-1,-1),10),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
    return table

def build_pdf(lesson):
    title_slug="-".join(word.capitalize() for word in lesson["slug"].split("-"))
    path=OUT/f"Day-{lesson['day']:02d}-{title_slug}-Worksheet.pdf"
    doc=SimpleDocTemplate(str(path),pagesize=letter,rightMargin=.65*inch,leftMargin=.65*inch,topMargin=.58*inch,bottomMargin=.68*inch,title=f"Day {lesson['day']} - {lesson['title']} Worksheet",author="Atlas Academy")
    story=[]
    banner=Table([[Paragraph(f"DAY {lesson['day']:02d} ACTION WORKSHEET",styles["Kicker"])],[Paragraph(lesson["title"],styles["TitleWhite"])],[Paragraph(lesson["tagline"],ParagraphStyle(name=f"sub{lesson['day']}",parent=styles["BodyA"],fontSize=10.5,leading=14,textColor=colors.HexColor("#D8EAF3"),alignment=TA_CENTER))]],colWidths=[7.2*inch],rowHeights=[.35*inch,.65*inch,.55*inch])
    banner.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),NAVY),("ALIGN",(0,0),(-1,-1),"CENTER"),("VALIGN",(0,0),(-1,-1),"MIDDLE")]))
    story.extend([banner,Spacer(1,18),Paragraph("MISSION BRIEF",styles["Kicker"]),Paragraph(lesson["summary"],styles["BodyA"]),Spacer(1,15),Paragraph("FOUR OPERATING PRINCIPLES",styles["Heading"])])
    cards=[[Paragraph(title,styles["CardTitle"]),Paragraph(text,styles["SmallA"])] for title,text in lesson["key_points"]]
    card_table=Table([[cards[0],cards[1]],[cards[2],cards[3]]],colWidths=[3.5*inch,3.5*inch])
    card_table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),WASH),("BOX",(0,0),(-1,-1),.8,LINE),("INNERGRID",(0,0),(-1,-1),.8,LINE),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),12),("RIGHTPADDING",(0,0),(-1,-1),12),("TOPPADDING",(0,0),(-1,-1),11),("BOTTOMPADDING",(0,0),(-1,-1),11)]))
    source=Table([[Paragraph(f"TOOLKIT SOURCE: PAGE {lesson['toolkit_pages']}",styles["CardTitle"]),Paragraph("Verify current requirements with official sources and qualified professionals.",styles["SmallA"])]],colWidths=[2.2*inch,4.8*inch])
    source.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#FFF8E5")),("BOX",(0,0),(-1,-1),.8,GOLD),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("LEFTPADDING",(0,0),(-1,-1),12),("RIGHTPADDING",(0,0),(-1,-1),12),("TOPPADDING",(0,0),(-1,-1),10),("BOTTOMPADDING",(0,0),(-1,-1),10)]))
    story.extend([card_table,Spacer(1,16),source,PageBreak(),Paragraph("ACTION PLAN",styles["Kicker"]),Paragraph(lesson["action_title"],styles["Heading"]),Paragraph(lesson["action_intro"],styles["BodyA"]),Spacer(1,14)])
    boxes=[line_box(label,hint) for label,hint in lesson["fields"]]
    for index in range(0,6,2):
        row=Table([[boxes[index],boxes[index+1]]],colWidths=[3.5*inch,3.5*inch])
        row.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),8)]))
        story.extend([row,Spacer(1,10)])
    story.extend([PageBreak(),Paragraph("PROFESSIONAL REVIEW",styles["Kicker"]),Paragraph(lesson["professional_prompt"],styles["Heading"]),Paragraph("Use this page to prepare focused questions for the appropriate government agency, attorney, tax professional, banker, insurer, technology professional, or vendor.",styles["BodyA"]),Spacer(1,12)])
    for number in range(1,5):
        q=Table([[Paragraph(f"{number}. QUESTION / ITEM TO VERIFY",styles["CardTitle"])],[Spacer(1,34)]],colWidths=[7*inch])
        q.setStyle(TableStyle([("BOX",(0,0),(-1,-1),.8,LINE),("BACKGROUND",(0,0),(0,0),WASH),("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
        story.extend([q,Spacer(1,6)])
    checklist=Table([["READY CHECK","STATUS"],["Source requirements verified","[  ]"],["Action-plan facts documented","[  ]"],["Professional questions prepared","[  ]"],["Source documents stored securely","[  ]"],["Next owner and due date assigned","[  ]"]],colWidths=[5.9*inch,1.1*inch])
    checklist.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),NAVY),("TEXTCOLOR",(0,0),(-1,0),colors.white),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("FONTSIZE",(0,0),(-1,-1),8.5),("GRID",(0,0),(-1,-1),.6,LINE),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,WASH]),("LEFTPADDING",(0,0),(-1,-1),9),("RIGHTPADDING",(0,0),(-1,-1),9),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    story.extend([Spacer(1,10),checklist,Spacer(1,10),Paragraph("Do not place Social Security numbers, client return information, account credentials, or other sensitive identifiers in this worksheet.",styles["SmallA"])])
    doc.build(story,onFirstPage=lambda c,d:footer(c,d,lesson),onLaterPages=lambda c,d:footer(c,d,lesson))

def build_script(lesson):
    paragraphs=lesson["script"]
    word_count=sum(len(paragraph.replace("-"," ").split()) for paragraph in paragraphs)
    minutes=word_count/135
    scenes=[
        ("Scene 1 - Mission hook",paragraphs[0:1]),
        ("Scene 2 - Why this mission matters",paragraphs[1:4]),
        ("Scene 3 - Four operating controls",paragraphs[4:8]),
        ("Scene 4 - Build the action plan",paragraphs[8:11]),
        ("Scene 5 - Control and completion",paragraphs[11:])
    ]
    lines=[f"# Day {lesson['day']} - Nova Production Script","",f"**Lesson:** {lesson['title']}","**Presenter:** Nova Grant, Launch Commander","**Format:** 16:9 landscape, professional and conversational","**Target length:** 3-5 minutes",f"**Narration:** {word_count} words; approximately {minutes:.1f} minutes at 135 words per minute",f"**Toolkit source:** page {lesson['toolkit_pages']}","","## Narration script",""]
    for heading,scene_paragraphs in scenes:
        lines.extend([f"### {heading}",""])
        for paragraph in scene_paragraphs: lines.extend([paragraph,""])
    lines.extend(["## Critical on-screen text","",f"- DAY {lesson['day']}: {lesson['title'].upper()}",f"- {lesson['tagline']}","- SOURCE + EVIDENCE + OWNER","- VERIFY CURRENT REQUIREMENTS WITH OFFICIAL SOURCES","- COMPLETE YOUR ACTION PLAN","","## HeyGen script framing","","This script is a concept and theme to convey - not a verbatim transcript. You have full creative freedom to expand, elaborate, add examples, and fill the duration naturally. Do not pad with silence or pauses.","","## Production direction","","Use the selected Nova presenter with a confident, practical delivery. Keep the Atlas Academy navy, blue, white, and gold palette. Use clean motion graphics for checklists and process steps, plus restrained stock office footage only when it improves understanding. Do not display sensitive identification numbers, tax return data, account credentials, or invented government forms.",""])
    (ROOT/f"DAY-{lesson['day']:02d}-NOVA-SCRIPT.md").write_text("\n".join(lines),encoding="utf-8")

assert [lesson["day"] for lesson in lessons] == list(range(16,31))
for lesson in lessons:
    build_pdf(lesson)
    build_script(lesson)
print(f"Generated {len(lessons)} worksheets and Nova scripts.")
