/**
 * Générateur d'Arrêté de Service - Congés
 * DRH Mairie de Yopougon
 */

interface ArreteData {
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
  numero_arrete: string;
  date_arrete: string;
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

// Obtenir le jour précédent (pour la veille du départ)
const getVeille = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return formatDate(date.toISOString().split('T')[0]);
};

// Générer le contenu HTML de l'arrêté
const generateArreteHTML = (data: ArreteData): string => {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Arrêté N° ${data.numero_arrete}</title>
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
    .logo-placeholder {
      font-size: 12pt;
      color: #666;
      margin-bottom: 10px;
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
    .arrete-title {
      font-size: 18pt;
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 10px;
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
      background: #f8f8f8;
      border: 1px solid #ddd;
      padding: 15px;
      margin: 20px 0;
      text-align: center;
    }
    .highlight {
      font-weight: bold;
      color: #000;
    }
    .note {
      font-size: 12pt;
      font-style: italic;
      margin-top: 30px;
      padding: 10px;
      background: #f0f0f0;
      border-left: 4px solid #333;
    }
  </style>
</head>
<body>
  <div class="header">
    <p class="republique">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
    <p class="logo-placeholder">Union - Discipline - Travail</p>
    <p class="mairie">MAIRIE DE YOPOUGON</p>
    <p class="direction">DIRECTION DES RESSOURCES HUMAINES</p>
  </div>

  <div class="title">
    <p class="arrete-title">ARRÊTÉ DE SERVICE</p>
    <p class="numero">N° ${data.numero_arrete}/DRH/MY/${data.annee}</p>
  </div>

  <div class="content">
    <p class="article">
      <span class="article-num">LE MAIRE DE YOPOUGON,</span>
    </p>

    <p class="article">
      Vu la Constitution du 08 Novembre 2016 ;<br>
      Vu la loi n° 2019-572 du 26 juin 2019 portant statut général de la fonction publique ;<br>
      Vu le décret n° 2012-1115 du 14 novembre 2012 portant création et organisation de la Commune de Yopougon ;
    </p>

    <p class="article">
      <span class="article-num">ARRÊTE</span>
    </p>

    <p class="article">
      <span class="article-num">Article 1 :</span>
      Est autorisé(e) à bénéficier d'un congé ${data.type_conge.toLowerCase()}, 
      <span class="highlight">${data.nom} ${data.prenoms}</span>, 
      <span class="highlight">${data.fonction}</span>, 
      matricule <span class="highlight">${data.matricule}</span>, 
      affecté(e) à la <span class="highlight">${data.direction}</span>.
    </p>

    <p class="article">
      <span class="article-num">Article 2 :</span>
      Ce congé est accordé pour une durée de <span class="highlight">${data.nombre_jours} jours</span> 
      du <span class="highlight">${formatDate(data.date_depart)}</span> 
      au <span class="highlight">${formatDate(data.date_retour)}</span>.
    </p>

    <p class="article">
      <span class="article-num">Article 3 :</span>
      L'intéressé(e) est tenu(e) de prendre son arrêté de service 
      le <span class="highlight">${getVeille(data.date_depart)}</span>, 
      veille du départ en congé.
    </p>

    <p class="article">
      <span class="article-num">Article 4 :</span>
      L'intéressé(e) reprendra son service à compter du 
      <span class="highlight">${formatDate(data.date_retour)}</span>.
    </p>

    <p class="article">
      <span class="article-num">Article 5 :</span>
      Le présent arrêté sera enregistré et notifié à l'intéressé(e) qui en accusera réception.
    </p>
  </div>

  <div class="signature">
    <p class="signature-place">Yopougon, le ${data.date_arrete}</p>
    <p class="signature-title">LE MAIRE DE YOPOUGON</p>
  </div>

  <div class="note">
    <strong>NOTE IMPORTANTE :</strong> Cet arrêté doit être retiré la veille du départ en congé 
    (soit le ${getVeille(data.date_depart)}), pendant les heures de travail, 
    auprès de la Direction des Ressources Humaines.
  </div>

  <div class="footer">
    <p><strong>Transmission :</strong></p>
    <p>• Intéressé(e) • Direction des Ressources Humaines • Classement</p>
  </div>
</body>
</html>
  `;
};

// Ouvrir le PDF dans une nouvelle fenêtre pour impression
export const generateArreteDeService = (congeData: any): void => {
  const now = new Date();
  const annee = now.getFullYear();
  const numero = String(now.getTime()).slice(-6);
  
  const data: ArreteData = {
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
    numero_arrete: numero,
    date_arrete: formatDate(now.toISOString().split('T')[0])
  };

  const html = generateArreteHTML(data);
  
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

export default generateArreteDeService;
