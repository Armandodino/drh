import { jsPDF } from 'jspdf';

const addHeader = (doc) => {
  // Fond sombre en en-tête
  doc.setFillColor(15, 30, 60);
  doc.rect(0, 0, 210, 42, 'F');

  // Ligne décorative verte
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 42, 210, 2, 'F');

  // Texte de l'en-tête
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('COMMUNE DE YOPOUGON', 105, 16, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Direction des Ressources Humaines', 105, 24, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(200, 220, 255);
  doc.text('04 BP 14 Abidjan 04  |  Tél : 22 42 00 00', 105, 32, { align: 'center' });

  // Réinitialiser la couleur
  doc.setTextColor(0, 0, 0);
};

const addFooter = (doc) => {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(240, 242, 247);
  doc.rect(0, pageHeight - 20, 210, 20, 'F');
  doc.setFontSize(7);
  doc.setTextColor(120, 130, 150);
  doc.text('Document officiel généré par le Système de Gestion du Personnel - Mairie de Yopougon', 105, pageHeight - 12, { align: 'center' });
  doc.text(`Date d'édition : ${new Date().toLocaleDateString('fr-FR')}`, 105, pageHeight - 7, { align: 'center' });
};

const addInfoRow = (doc, label, value, y) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(80, 90, 110);
  doc.text(label, 20, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 20, 20);
  doc.text(String(value || 'N/A'), 75, y);
};

export const generateArretService = (docData) => {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString('fr-FR');

  addHeader(doc);

  // Titre du document
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 30, 60);
  doc.text("NOTE D'ARRÊT DE SERVICE", 105, 60, { align: 'center' });

  // Ligne sous le titre
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.8);
  doc.line(50, 63, 160, 63);

  // Référence et date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 110, 130);
  doc.text(`Réf. : DRH-ARRET-${docData.id || '000'} | Yopougon, le ${today}`, 105, 70, { align: 'center' });

  // Section agent
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 78, 180, 60, 3, 3, 'F');
  doc.setDrawColor(220, 230, 245);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, 78, 180, 60, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(16, 185, 129);
  doc.text('▌ INFORMATIONS DE L\'AGENT', 22, 87);

  addInfoRow(doc, 'Nom & Prénoms :', docData.agentName, 96);
  addInfoRow(doc, 'Matricule :', docData.agent?.matricule, 104);
  addInfoRow(doc, 'Direction :', docData.agentDirection || docData.agent?.direction, 112);
  addInfoRow(doc, 'Fonction :', docData.agent?.fonction, 120);
  addInfoRow(doc, 'Sexe :', docData.agent?.sexe, 128);

  // Section congé
  doc.setFillColor(255, 251, 240);
  doc.roundedRect(15, 145, 180, 45, 3, 3, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, 145, 180, 45, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(245, 158, 11);
  doc.text('▌ DÉTAILS DE L\'ARRÊT', 22, 154);

  addInfoRow(doc, 'Type de congé :', docData.type, 162);
  addInfoRow(doc, 'Date d\'arrêt :', docData.date_depart, 170);
  addInfoRow(doc, 'Durée :', `${docData.nombre_jours} jour(s)`, 178);
  if (docData.motif) addInfoRow(doc, 'Motif :', docData.motif, 186);

  // Corps du document
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 50, 70);
  const body = `La présente note certifie que l'agent ${docData.agentName}, en service à la ${docData.agentDirection || docData.agent?.direction || 'Direction concernée'}, a cessé ses fonctions à compter du ${docData.date_depart} pour une durée de ${docData.nombre_jours} jour(s) au titre d'un congé de type "${docData.type}".`;
  const lines = doc.splitTextToSize(body, 170);
  doc.text(lines, 20, 205);

  // Zone signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 30, 60);
  doc.text(`Fait à Yopougon, le ${today}`, 130, 235, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Le Directeur des Ressources Humaines', 130, 242, { align: 'center' });

  doc.setDrawColor(180, 190, 210);
  doc.setLineWidth(0.3);
  doc.line(95, 265, 170, 265);
  doc.setFontSize(8);
  doc.setTextColor(130, 140, 160);
  doc.text('Signature et Cachet', 132, 270, { align: 'center' });

  addFooter(doc);
  doc.save(`Note_Arret_${(docData.agentName || 'Agent').replace(/\s+/g, '_')}_${docData.id || ''}.pdf`);
};

export const generateRepriseService = (docData) => {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString('fr-FR');

  addHeader(doc);

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 30, 60);
  doc.text('NOTE DE REPRISE DE SERVICE', 105, 60, { align: 'center' });

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.8);
  doc.line(45, 63, 165, 63);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 110, 130);
  doc.text(`Réf. : DRH-REPRISE-${docData.id || '000'} | Yopougon, le ${today}`, 105, 70, { align: 'center' });

  // Section agent
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 78, 180, 60, 3, 3, 'F');
  doc.setDrawColor(220, 230, 245);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, 78, 180, 60, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(59, 130, 246);
  doc.text('▌ INFORMATIONS DE L\'AGENT', 22, 87);

  addInfoRow(doc, 'Nom & Prénoms :', docData.agentName, 96);
  addInfoRow(doc, 'Matricule :', docData.agent?.matricule, 104);
  addInfoRow(doc, 'Direction :', docData.agentDirection || docData.agent?.direction, 112);
  addInfoRow(doc, 'Fonction :', docData.agent?.fonction, 120);
  addInfoRow(doc, 'Sexe :', docData.agent?.sexe, 128);

  // Section reprise
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(15, 145, 180, 45, 3, 3, 'F');
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, 145, 180, 45, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(16, 185, 129);
  doc.text('▌ DÉTAILS DE LA REPRISE', 22, 154);

  addInfoRow(doc, 'Congé initial :', docData.type, 162);
  addInfoRow(doc, 'Date de départ :', docData.date_depart, 170);
  addInfoRow(doc, 'Date de reprise :', docData.date_retour, 178);
  addInfoRow(doc, 'Durée totale :', `${docData.nombre_jours} jour(s)`, 186);

  // Corps
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 50, 70);
  const body = `La présente note certifie que l'agent ${docData.agentName}, en service à la ${docData.agentDirection || docData.agent?.direction || 'Direction concernée'}, a repris ses fonctions à compter du ${docData.date_retour} à l'issue de son congé de type "${docData.type}" d'une durée de ${docData.nombre_jours} jour(s).`;
  const lines = doc.splitTextToSize(body, 170);
  doc.text(lines, 20, 205);

  // Signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 30, 60);
  doc.text(`Fait à Yopougon, le ${today}`, 130, 235, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Le Directeur des Ressources Humaines', 130, 242, { align: 'center' });

  doc.setDrawColor(180, 190, 210);
  doc.setLineWidth(0.3);
  doc.line(95, 265, 170, 265);
  doc.setFontSize(8);
  doc.setTextColor(130, 140, 160);
  doc.text('Signature et Cachet', 132, 270, { align: 'center' });

  addFooter(doc);
  doc.save(`Note_Reprise_${(docData.agentName || 'Agent').replace(/\s+/g, '_')}_${docData.id || ''}.pdf`);
};