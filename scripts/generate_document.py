#!/usr/bin/env python3
"""
Génération de certificats de cessation et reprise de service
Format exact selon les modèles fournis par la Mairie de Yopougon
"""

import sys
import os
import json
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register fonts
pdfmetrics.registerFont(TTFont('Times', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('TimesBold', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

def generate_certificate(data, output_path, doc_type):
    """
    Génère un certificat de cessation ou reprise de service

    data: dict contenant les informations de l'agent et du congé
    output_path: chemin du fichier PDF de sortie
    doc_type: 'cessation' ou 'reprise'
    """

    # Créer le document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=2*cm,
        rightMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    # Styles
    styles = getSampleStyleSheet()

    # Style pour l'en-tête (centré)
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Normal'],
        fontName='Times',
        fontSize=12,
        alignment=TA_CENTER,
        spaceAfter=0,
    )

    # Style pour la devise (centré, italique)
    devise_style = ParagraphStyle(
        'Devise',
        parent=styles['Normal'],
        fontName='Times',
        fontSize=11,
        alignment=TA_CENTER,
        spaceAfter=12,
    )

    # Style pour la date et référence (aligné à droite)
    right_style = ParagraphStyle(
        'Right',
        parent=styles['Normal'],
        fontName='Times',
        fontSize=12,
        alignment=TA_RIGHT,
        spaceAfter=6,
    )

    # Style pour le titre (centré, gras, souligné)
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Normal'],
        fontName='Times',
        fontSize=14,
        alignment=TA_CENTER,
        spaceBefore=20,
        spaceAfter=20,
    )

    # Style pour le corps du texte (justifié)
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Times',
        fontSize=12,
        alignment=TA_JUSTIFY,
        spaceAfter=12,
        leading=18,
    )

    # Style pour la signature (aligné à droite)
    signature_style = ParagraphStyle(
        'Signature',
        parent=styles['Normal'],
        fontName='Times',
        fontSize=12,
        alignment=TA_CENTER,
        spaceBefore=30,
    )

    # Construire le contenu
    story = []

    # En-tête de la République
    story.append(Paragraph("REPUBLIQUE DE COTE D'IVOIRE", header_style))
    story.append(Paragraph("<i>Union - Discipline - Travail</i>", devise_style))

    # Date et référence (alignés à droite)
    story.append(Paragraph(f"Yopougon, le {data['dateDocument']}", right_style))
    story.append(Paragraph(f"N°_________/MY/DRH/{data['anneeRef']}", right_style))

    story.append(Spacer(1, 20))

    # Titre du certificat
    if doc_type == 'cessation':
        story.append(Paragraph("<b><u>CERTIFICAT DE CESSATION DE SERVICE</u></b>", title_style))
    else:
        story.append(Paragraph("<b><u>CERTIFICAT DE REPRISE DE SERVICE</u></b>", title_style))

    story.append(Spacer(1, 10))

    # Corps du document
    if doc_type == 'cessation':
        # Texte pour cessation
        body_text = (
            f"Monsieur {data['nom']} {data['prenom']} (Mle {data['matricule']}) {data['poste']}, "
            f"en service à la {data['direction']} de la Mairie de Yopougon, "
            f"bénéficiaire d'un congé annuel de {data['nombreJours']} jours "
            f"au titre de l'année {data['anneeConge']}, est autorisé à jouir de son congé "
            f"à compter du {data['dateDebut']}."
        )
        story.append(Paragraph(body_text, body_style))

        # Deuxième paragraphe
        reprise_text = (
            f"A l'issue de son congé, l'intéressé(e) reprendra le service à son poste habituel "
            f"le {data['dateFin']}."
        )
        story.append(Paragraph(reprise_text, body_style))
    else:
        # Texte pour reprise
        body_text = (
            f"Monsieur {data['nom']} {data['prenom']} (Mle {data['matricule']}) {data['poste']}, "
            f"en service à la {data['direction']} de la Mairie de Yopougon, "
            f"bénéficiaire d'un congé au titre de l'année {data['anneeConge']}, "
            f"a effectivement repris le service le {data['dateReprise']}."
        )
        story.append(Paragraph(body_text, body_style))

    # Conclusion
    story.append(Paragraph("Le présent certificat est établi pour servir et valoir ce que de droit.", body_style))

    story.append(Spacer(1, 40))

    # Signature
    story.append(Paragraph("P/Le Maire & P.O.", signature_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Le Directeur des Ressources Humaines</b>", signature_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph(f"<b>{data['signataireNom']}</b>", signature_style))

    # Générer le PDF
    doc.build(story)

    return output_path


def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_document.py <json_data>")
        sys.exit(1)

    # Parser les données JSON
    json_data = sys.argv[1]
    data = json.loads(json_data)

    # Chemin de sortie
    output_path = data.get('outputPath', '/tmp/certificat.pdf')
    doc_type = data.get('type', 'cessation')

    # Formater les dates
    def format_date(date_str):
        """Convertir YYYY-MM-DD en DD/MM/YYYY"""
        parts = date_str.split('-')
        if len(parts) == 3:
            return f"{parts[2]}/{parts[1]}/{parts[0]}"
        return date_str

    # Préparer les données pour le certificat
    cert_data = {
        'dateDocument': data.get('dateDocument', '03/03/2026'),
        'anneeRef': data.get('anneeRef', '2026'),
        'nom': data.get('nom', 'Coulibaly'),
        'prenom': data.get('prenom', 'Drissa'),
        'matricule': data.get('matricule', '989-A'),
        'poste': data.get('poste', 'INFORMATICIEN'),
        'direction': data.get('direction', 'DIRECTION DU SERVICE INFORMATIQUE'),
        'nombreJours': data.get('nombreJours', 31),
        'anneeConge': data.get('anneeConge', 2025),
        'dateDebut': format_date(data.get('dateDebut', '2026-08-02')),
        'dateFin': format_date(data.get('dateFin', '2026-09-01')),
        'dateReprise': format_date(data.get('dateReprise', data.get('dateFin', '2026-09-01'))),
        'signataireNom': data.get('signataireNom', 'SANOGO Amadou'),
    }

    # Générer le certificat
    result = generate_certificate(cert_data, output_path, doc_type)

    # Retourner le résultat
    print(json.dumps({'success': True, 'path': result}))


if __name__ == '__main__':
    main()
