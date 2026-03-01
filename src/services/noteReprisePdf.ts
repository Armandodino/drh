/**
 * Générateur de Note de Reprise de Service
 * DRH Mairie de Yopougon
 */

interface NoteRepriseData {
  nom: string;
  prenoms: string;
  matricule: string;
  fonction: string;
  direction: string;
  date_depart: string;
  date_retour: string;
  nombre_jours: number;
  type_conge: string;
  annee: number;
  numero_note: string;
  date_note: string;
}

// Formater une date en français
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

// Générer le contenu HTML de la note de reprise
const generateNoteRepriseHTML = (data: NoteRepriseData): string => {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Note de Reprise de Service - ${data.nom} ${data.prenoms}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 14pt;
      line-height: 1.6;
      color: #000;
      max-width: 21cm;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
    }
    .republique {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .mairie {
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .direction {
      font-size: 12pt;
      font-weight: bold;
    }
    .title {
      text-align: center;
      margin: 30px 0;
    }
    .note-title {
      font-size: 18pt;
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 10px;
      color: #166534;
    }
    .numero {
      font-size: 14pt;
      font-weight: bold;
    }
    .content {
      text-align: justify;
      margin: 20px 0;
    }
    .article {
      margin: 15px 0;
      text-indent: 0;
    }
    .article-num {
      font-weight: bold;
    }
    .signature {
      margin-top: 60px;
      text-align: right;
      padding-right: 50px;
    }
    .signature-place {
      margin-bottom: 10px;
    }
    .signature-title {
      font-weight: bold;
      margin-top: 60px;
    }
    .footer {
      margin-top: 40px;
      font-size: 11pt;
      color: #333;
      border-top: 1px solid #ccc;
      padding-top: 10px;
    }
    .important {
      background: #f0fdf4;
      border: 2px solid #166534;
      padding: 15px;
      margin: 20px 0;
      text-align: center;
    }
    .highlight {
      font-weight: bold;
      color: #166534;
    }
    .success-box {
      background: #dcfce7;
      border: 2px solid #166534;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
      border-radius: 10px;
    }
    .success-icon {
      font-size: 40pt;
      color: #166534;
    }
  </style>
</head>
<body>
  <div class="header">
    <p class="republique">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
    <p style="font-size: 10pt; color: #666;">Union - Discipline - Travail</p>
    <p class="mairie">MAIRIE DE YOPOUGON</p>
    <p class="direction">DIRECTION DES RESSOURCES HUMAINES</p>
  </div>

  <div class="title">
    <p class="note-title">NOTE DE REPRISE DE SERVICE</p>
    <p class="numero">N° ${data.numero_note}/DRH/MY/${data.annee}</p>
  </div>

  <div class="success-box">
    <p class="success-icon">✓</p>
    <p style="font-size: 14pt; font-weight: bold; color: #166534;">
      CERTIFICAT DE REPRISE DE SERVICE
    </p>
  </div>

  <div class="content">
    <p class="article">
      Je soussigné(e), <span class="highlight">Le Directeur des Ressources Humaines</span> de la Mairie de Yopougon,
    </p>

    <p class="article">
      <span class="article-num">CERTIFIE</span> que :
    </p>

    <p class="article">
      <span class="highlight">${data.nom} ${data.prenoms}</span>, 
      <span class="highlight">${data.fonction}</span>, 
      matricule <span class="highlight">${data.matricule}</span>, 
      affecté(e) à la <span class="highlight">${data.direction}</span>,
    </p>

    <p class="article">
      A bénéficié d'un congé ${data.type_conge.toLowerCase()} du 
      <span class="highlight">${formatDate(data.date_depart)}</span> 
      au <span class="highlight">${formatDate(data.date_retour)}</span>, 
      soit une durée de <span class="highlight">${data.nombre_jours} jours</span>.
    </p>

    <p class="article">
      <span class="article-num">ATTESTE</span> que l'intéressé(e) a <span class="highlight">REPRI SES FONCTIONS</span> 
      ce jour, conformément aux dispositions réglementaires en vigueur.
    </p>

    <p class="article">
      La présente note est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.
    </p>
  </div>

  <div class="important">
    <p style="font-size: 12pt; font-weight: bold; color: #166534;">
      ✓ REPRISE DE SERVICE EFFECTUÉE
    </p>
    <p style="font-size: 10pt; color: #333;">
      Le ${formatDate(data.date_retour)} à Yopougon
    </p>
  </div>

  <div class="signature">
    <p class="signature-place">Fait à Yopougon, le ${data.date_note}</p>
    <p class="signature-title">LE DIRECTEUR DES RESSOURCES HUMAINES</p>
  </div>

  <div class="footer">
    <p><strong>Transmission :</strong></p>
    <p>• Intéressé(e) • Direction des Ressources Humaines • Dossier administratif • Classement</p>
  </div>
</body>
</html>
  `;
};

// Ouvrir le PDF dans une nouvelle fenêtre pour impression
export const generateNoteReprise = (congeData: any): void => {
  const now = new Date();
  const annee = now.getFullYear();
  const numero = String(now.getTime()).slice(-6);
  
  const data: NoteRepriseData = {
    nom: congeData.nom || '',
    prenoms: congeData.prenoms || '',
    matricule: congeData.matricule || '',
    fonction: congeData.fonction || 'Agent',
    direction: congeData.direction || 'Non spécifiée',
    date_depart: congeData.date_depart,
    date_retour: congeData.date_retour,
    nombre_jours: congeData.nombre_jours,
    type_conge: congeData.type || 'Annuel',
    annee,
    numero_note: numero,
    date_note: formatDate(now.toISOString().split('T')[0])
  };

  const html = generateNoteRepriseHTML(data);
  
  // Ouvrir dans une nouvelle fenêtre pour impression
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

export default generateNoteReprise;
