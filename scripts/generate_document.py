#!/usr/bin/env python3
"""
Generate DRH Yopougon PDF documents (Cessation and Reprise certificates)
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
    """Generate a PDF document from data"""
    doc_type = data.get('type', 'cessation')
    document = data.get('document', data)
    
    # Create document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=2*cm,
        rightMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
        title=f"Certificat de {'Cessation' if doc_type == 'cessation' else 'Reprise'} de Service",
        author='DRH Yopougon',
        creator='DRH Yopougon',
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=11,
        alignment=TA_CENTER,
        spaceAfter=6,
    )
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=14,
        alignment=TA_CENTER,
        spaceBefore=20,
        spaceAfter=20,
    )
    
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=12,
        alignment=TA_JUSTIFY,
        spaceBefore=12,
        spaceAfter=12,
        leading=18,
    )
    
    right_style = ParagraphStyle(
        'RightStyle',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=11,
        alignment=TA_RIGHT,
        spaceAfter=6,
    )
    
    footer_style = ParagraphStyle(
        'FooterStyle',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=11,
        alignment=TA_CENTER,
        spaceBefore=30,
        spaceAfter=6,
    )
    
    signature_style = ParagraphStyle(
        'SignatureStyle',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=11,
        alignment=TA_RIGHT,
        spaceBefore=6,
        spaceAfter=3,
    )
    
    # Header
    header = document.get('header', {})
    story.append(Paragraph(header.get('republique', "REPUBLIQUE DE COTE D'IVOIRE"), header_style))
    story.append(Paragraph(f"<b>{header.get('devise', 'Union - Discipline - Travail')}</b>", header_style))
    story.append(Spacer(1, 30))
    story.append(Paragraph(header.get('date', 'Yopougon, le --/--/----'), right_style))
    story.append(Paragraph(header.get('numero', 'N°_____/MY/DRH/----'), right_style))
    story.append(Spacer(1, 20))
    
    # Title
    title = document.get('title', 'CERTIFICAT')
    story.append(Paragraph(f"<b>{title}</b>", title_style))
    story.append(Spacer(1, 20))
    
    # Body
    body = document.get('body', '')
    # Handle newlines
    body_paragraphs = body.split('\n\n')
    for para in body_paragraphs:
        if para.strip():
            story.append(Paragraph(para.strip().replace('\n', '<br/>'), body_style))
    
    # Footer
    footer = document.get('footer', {})
    story.append(Spacer(1, 30))
    story.append(Paragraph(footer.get('formule', 'Le présent certificat est établi pour servir et valoir ce que de droit.'), footer_style))
    story.append(Spacer(1, 40))
    
    # Signature
    signature = footer.get('signature', {})
    story.append(Paragraph(signature.get('qualite', 'P/Le Maire & P.O.'), signature_style))
    story.append(Paragraph(signature.get('titre', 'Le Directeur des Ressources Humaines'), signature_style))
    story.append(Spacer(1, 30))
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
