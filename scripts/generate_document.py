#!/usr/bin/env python3
"""
Generate DRH Yopougon PDF documents (Cessation and Reprise certificates)
Based on official templates
"""

import sys
import json
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register fonts
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

def generate_document(output_path, data):
    """Generate a PDF document from data - exactly matching official format"""
    doc_type = data.get('type', 'cessation')
    document = data.get('document', data)
    
    # Create document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=2.5*cm,
        rightMargin=2.5*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
        title=f"Certificat de {'Cessation' if doc_type == 'cessation' else 'Reprise'} de Service",
        author='DRH Yopougon',
        creator='DRH Yopougon',
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles matching official format
    header_center = ParagraphStyle(
        'HeaderCenter',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=12,
        alignment=TA_CENTER,
        spaceAfter=2,
    )
    
    header_center_bold = ParagraphStyle(
        'HeaderCenterBold',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=12,
        alignment=TA_CENTER,
        spaceAfter=6,
    )
    
    date_style = ParagraphStyle(
        'DateStyle',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=12,
        alignment=TA_RIGHT,
        spaceAfter=2,
    )
    
    ref_style = ParagraphStyle(
        'RefStyle',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=12,
        alignment=TA_RIGHT,
        spaceAfter=20,
    )
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=14,
        alignment=TA_CENTER,
        spaceBefore=30,
        spaceAfter=30,
    )
    
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=12,
        alignment=TA_JUSTIFY,
        spaceBefore=0,
        spaceAfter=12,
        leading=18,
        firstLineIndent=0,
    )
    
    formule_style = ParagraphStyle(
        'FormuleStyle',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=12,
        alignment=TA_CENTER,
        spaceBefore=40,
        spaceAfter=0,
    )
    
    signature_style = ParagraphStyle(
        'SignatureStyle',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=12,
        alignment=TA_RIGHT,
        spaceBefore=40,
        spaceAfter=2,
    )
    
    # Get data
    header = document.get('header', {})
    
    # === HEADER ===
    # REPUBLIQUE DE COTE D'IVOIRE
    story.append(Paragraph("REPUBLIQUE DE COTE D'IVOIRE", header_center))
    
    # Union - Discipline - Travail (bold)
    story.append(Paragraph("<b>Union - Discipline - Travail</b>", header_center_bold))
    
    story.append(Spacer(1, 30))
    
    # Date (right aligned)
    story.append(Paragraph(header.get('date', 'Yopougon, le --/--/----'), date_style))
    
    # Reference number (right aligned)
    story.append(Paragraph(header.get('numero', 'N°_____/MY/DRH/----'), ref_style))
    
    # === TITLE ===
    title = document.get('title', 'CERTIFICAT')
    story.append(Paragraph(f"<b>{title}</b>", title_style))
    
    # === BODY ===
    body = document.get('body', '')
    
    # Split body into paragraphs and render each
    paragraphs = body.split('\n\n')
    for para in paragraphs:
        if para.strip():
            # Replace single newlines with spaces (for wrapping)
            text = para.strip().replace('\n', ' ')
            story.append(Paragraph(text, body_style))
    
    # === FORMULE ===
    story.append(Paragraph(
        "Le présent certificat est établi pour servir et valoir ce que de droit.",
        formule_style
    ))
    
    # === SIGNATURE ===
    signature = document.get('footer', {}).get('signature', {})
    
    story.append(Paragraph(signature.get('qualite', 'P/Le Maire &amp; P.O.'), signature_style))
    story.append(Paragraph(signature.get('titre', 'Le Directeur des Ressources Humaines'), signature_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph(f"<b>{signature.get('nom', 'SANOGO Amadou')}</b>", signature_style))
    
    # Build PDF
    doc.build(story)
    return output_path

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python generate_document.py <output_path> <json_data>", file=sys.stderr)
        sys.exit(1)
    
    output_path = sys.argv[1]
    json_data = sys.argv[2]
    
    try:
        data = json.loads(json_data)
        result = generate_document(output_path, data)
        print(json.dumps({'success': True, 'path': result}))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}), file=sys.stderr)
        sys.exit(1)
