import json
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "downloads"
lessons = json.loads((ROOT / "lesson-batch-content.json").read_text(encoding="utf-8"))

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
    canvas.setStrokeColor(LINE); canvas.line(0.65*inch, 0.52*inch, 7.85*inch, 0.52*inch)
    canvas.setFont("Helvetica", 7); canvas.setFillColor(MUTED)
    canvas.drawString(0.65*inch, 0.34*inch, f"ATLAS ACADEMY | DAY {lesson['day']} | TOOLKIT-DERIVED WORKSHEET")
    canvas.drawRightString(7.85*inch, 0.34*inch, f"PAGE {doc.page}")
    canvas.restoreState()

def line_box(label, hint):
    content = [Paragraph(label, styles["CardTitle"]), Paragraph(hint, styles["SmallA"]), Spacer(1, 32)]
    table = Table([[content]], colWidths=[3.38*inch])
    table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),colors.white),("BOX",(0,0),(-1,-1),0.8,LINE),("LEFTPADDING",(0,0),(-1,-1),12),("RIGHTPADDING",(0,0),(-1,-1),12),("TOPPADDING",(0,0),(-1,-1),10),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
    return table

def build(lesson):
    filename = f"Day-{lesson['day']:02d}-" + "-".join(w.capitalize() for w in lesson["slug"].split("-")) + "-Worksheet.pdf"
    path = OUT / filename
    doc = SimpleDocTemplate(str(path), pagesize=letter, rightMargin=.65*inch, leftMargin=.65*inch, topMargin=.58*inch, bottomMargin=.68*inch, title=f"Day {lesson['day']} - {lesson['title']} Worksheet", author="Atlas Academy")
    story=[]
    banner=Table([[Paragraph(f"DAY {lesson['day']:02d} ACTION WORKSHEET",styles["Kicker"])],[Paragraph(lesson["title"],styles["TitleWhite"])],[Paragraph(lesson["tagline"],ParagraphStyle(name=f"sub{lesson['day']}",parent=styles["BodyA"],fontSize=10.5,leading=14,textColor=colors.HexColor("#D8EAF3"),alignment=TA_CENTER))]],colWidths=[7.2*inch],rowHeights=[.35*inch,.65*inch,.55*inch])
    banner.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),NAVY),("ALIGN",(0,0),(-1,-1),"CENTER"),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("BOX",(0,0),(-1,-1),0,NAVY)]))
    story.extend([banner,Spacer(1,18),Paragraph("MISSION BRIEF",styles["Kicker"]),Paragraph(lesson["summary"],styles["BodyA"]),Spacer(1,15),Paragraph("FOUR OPERATING PRINCIPLES",styles["Heading"])])
    cards=[]
    for title,text in lesson["key_points"]:
        cards.append([Paragraph(title,styles["CardTitle"]),Paragraph(text,styles["SmallA"])])
    card_table=Table([[cards[0],cards[1]],[cards[2],cards[3]]],colWidths=[3.5*inch,3.5*inch])
    card_table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),WASH),("BOX",(0,0),(-1,-1),.8,LINE),("INNERGRID",(0,0),(-1,-1),.8,LINE),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),12),("RIGHTPADDING",(0,0),(-1,-1),12),("TOPPADDING",(0,0),(-1,-1),11),("BOTTOMPADDING",(0,0),(-1,-1),11)]))
    story.extend([card_table,Spacer(1,16),Table([[Paragraph(f"TOOLKIT SOURCE: PAGES {lesson['toolkit_pages']}",styles["CardTitle"]),Paragraph("Verify current requirements with official sources and qualified professionals.",styles["SmallA"])]],colWidths=[2.2*inch,4.8*inch],style=TableStyle([("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#FFF8E5")),("BOX",(0,0),(-1,-1),.8,GOLD),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("LEFTPADDING",(0,0),(-1,-1),12),("RIGHTPADDING",(0,0),(-1,-1),12),("TOPPADDING",(0,0),(-1,-1),10),("BOTTOMPADDING",(0,0),(-1,-1),10)])),PageBreak(),Paragraph("ACTION PLAN",styles["Kicker"]),Paragraph(lesson["action_title"],styles["Heading"]),Paragraph(lesson["action_intro"],styles["BodyA"]),Spacer(1,14)])
    boxes=[line_box(label,hint) for label,hint in lesson["fields"]]
    for i in range(0,6,2):
        row=Table([[boxes[i],boxes[i+1]]],colWidths=[3.5*inch,3.5*inch])
        row.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),8)]))
        story.extend([row,Spacer(1,10)])
    story.extend([PageBreak(),Paragraph("PROFESSIONAL REVIEW",styles["Kicker"]),Paragraph(lesson["professional_prompt"],styles["Heading"]),Paragraph("Use this page to prepare focused questions for the appropriate government agency, attorney, tax professional, banker, insurer, landlord, technology professional, or vendor.",styles["BodyA"]),Spacer(1,12)])
    for n in range(1,5):
        q=Table([[Paragraph(f"{n}. QUESTION / ITEM TO VERIFY",styles["CardTitle"])],[Spacer(1,34)]],colWidths=[7*inch])
        q.setStyle(TableStyle([("BOX",(0,0),(-1,-1),.8,LINE),("BACKGROUND",(0,0),(0,0),WASH),("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
        story.extend([q,Spacer(1,6)])
    checklist=Table([["READY CHECK", "STATUS"],["Source requirements verified", "[  ]"],["Action-plan facts documented", "[  ]"],["Professional questions prepared", "[  ]"],["Source documents stored securely", "[  ]"],["Next owner and due date assigned", "[  ]"]],colWidths=[5.9*inch,1.1*inch])
    checklist.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),NAVY),("TEXTCOLOR",(0,0),(-1,0),colors.white),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("FONTNAME",(0,1),(-1,-1),"Helvetica"),("FONTSIZE",(0,0),(-1,-1),8.5),("GRID",(0,0),(-1,-1),.6,LINE),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,WASH]),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("LEFTPADDING",(0,0),(-1,-1),9),("RIGHTPADDING",(0,0),(-1,-1),9),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    story.extend([Spacer(1,10),checklist,Spacer(1,10),Paragraph("Do not place Social Security numbers, client return information, account credentials, or other sensitive identifiers in this worksheet.",styles["SmallA"])])
    doc.build(story,onFirstPage=lambda c,d:footer(c,d,lesson),onLaterPages=lambda c,d:footer(c,d,lesson))
    return path

for lesson in lessons:
    build(lesson)
print(f"Generated {len(lessons)} worksheets.")
