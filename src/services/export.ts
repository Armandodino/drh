import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const today = () => new Date().toLocaleDateString('fr-FR');
const stamp = () => new Date().toISOString().slice(0, 10);

// ─────────────────────────────────────────────
//  EXCEL EXPORTS
// ─────────────────────────────────────────────

/** Exporte la liste des agents */
export const exportAgentsExcel = (agents: any[]) => {
    const data = agents.map((a) => ({
        'Matricule': a.matricule,
        'Nom': a.nom,
        'Prénoms': a.prenoms,
        'Sexe': a.sexe || 'N/A',
        'Direction': a.direction,
        'Fonction': a.fonction || 'N/A',
        'Téléphone': a.telephone || 'N/A',
        'Email': a.email || 'N/A',
        'Solde Congés (j)': a.jours_conge_annuel ?? 30,
        'Statut': a.statut || 'actif',
        'Date Embauche': a.date_embauche || 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
        { wch: 12 }, { wch: 18 }, { wch: 22 }, { wch: 8 },
        { wch: 40 }, { wch: 25 }, { wch: 16 }, { wch: 28 },
        { wch: 14 }, { wch: 10 }, { wch: 14 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Agents');
    XLSX.writeFile(wb, `Liste_Agents_${stamp()}.xlsx`);
};

/** Exporte la liste des congés */
export const exportCongesExcel = (conges: any[], agents: any[]) => {
    const data = conges.map((c) => {
        const agent = agents.find((a) => a.id === c.employe_id);
        return {
            'ID': c.id,
            'Matricule': agent?.matricule || 'N/A',
            'Nom Agent': agent ? `${agent.nom} ${agent.prenoms}` : 'Inconnu',
            'Direction': agent?.direction || 'N/A',
            'Type de Congé': c.type,
            'Date Départ': c.date_depart,
            'Date Retour': c.date_retour,
            'Nb Jours': c.nombre_jours,
            'Motif': c.motif || '-',
            'Statut': c.statut,
        };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
        { wch: 6 }, { wch: 12 }, { wch: 24 }, { wch: 36 },
        { wch: 20 }, { wch: 13 }, { wch: 13 }, { wch: 9 },
        { wch: 28 }, { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Congés');
    XLSX.writeFile(wb, `Liste_Conges_${stamp()}.xlsx`);
};

/** Exporte un rapport de statistiques complet (agents + congés + résumé) */
export const exportStatsExcel = (agents: any[], conges: any[]) => {
    const wb = XLSX.utils.book_new();

    // ── Feuille 1 : Résumé ─────────────────────
    const totalAgents = agents.length;
    const enConge = conges.filter((c) => c.statut === 'Approuvé').length;
    const enAttente = conges.filter((c) => c.statut === 'En attente').length;
    const soldeTotal = agents.reduce((acc, a) => acc + (a.jours_conge_annuel ?? 30), 0);

    const resumeData = [
        { 'Indicateur': 'Total Agents', 'Valeur': totalAgents },
        { 'Indicateur': 'Agents en Congé (Approuvé)', 'Valeur': enConge },
        { 'Indicateur': 'Demandes en Attente', 'Valeur': enAttente },
        { 'Indicateur': 'Solde Congés Global (jours)', 'Valeur': soldeTotal },
        { 'Indicateur': 'Total Demandes de Congé', 'Valeur': conges.length },
        { 'Indicateur': 'Date du Rapport', 'Valeur': today() },
    ];
    const wsResume = XLSX.utils.json_to_sheet(resumeData);
    wsResume['!cols'] = [{ wch: 32 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsResume, 'Résumé');

    // ── Feuille 2 : Répartition par Direction ──
    const dirCount: Record<string, number> = {};
    agents.forEach((a) => {
        const dir = a.direction || 'Autres';
        dirCount[dir] = (dirCount[dir] || 0) + 1;
    });
    const dirData = Object.entries(dirCount)
        .sort((a, b) => b[1] - a[1])
        .map(([dir, count]) => ({
            'Direction': dir,
            'Nb Agents': count,
            '% du Total': `${((count / totalAgents) * 100).toFixed(1)}%`,
        }));
    const wsDir = XLSX.utils.json_to_sheet(dirData);
    wsDir['!cols'] = [{ wch: 46 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsDir, 'Par Direction');

    // ── Feuille 3 : Congés par Type ─────────────
    const typeCount: Record<string, number> = {};
    conges.forEach((c) => {
        typeCount[c.type] = (typeCount[c.type] || 0) + 1;
    });
    const typeData = Object.entries(typeCount).map(([type, count]) => ({
        'Type de Congé': type,
        'Nombre': count,
    }));
    const wsType = XLSX.utils.json_to_sheet(typeData);
    wsType['!cols'] = [{ wch: 28 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsType, 'Types de Congés');

    // ── Feuille 4 : Liste Agents ─────────────────
    const agentsData = agents.map((a) => ({
        'Matricule': a.matricule,
        'Nom': a.nom,
        'Prénoms': a.prenoms,
        'Direction': a.direction,
        'Fonction': a.fonction || 'N/A',
        'Solde (j)': a.jours_conge_annuel ?? 30,
        'Statut': a.statut || 'actif',
    }));
    const wsAgents = XLSX.utils.json_to_sheet(agentsData);
    wsAgents['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 22 }, { wch: 40 }, { wch: 24 }, { wch: 10 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsAgents, 'Agents');

    XLSX.writeFile(wb, `Rapport_Stats_DRH_${stamp()}.xlsx`);
};

// ─────────────────────────────────────────────
//  PDF EXPORT  ─ Rapport complet des statistiques
// ─────────────────────────────────────────────

const pdfHeader = (doc: InstanceType<typeof jsPDF>, title: string) => {
    doc.setFillColor(15, 30, 60);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 40, 210, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('COMMUNE DE YOPOUGON', 105, 14, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Direction des Ressources Humaines — Rapport Statistique', 105, 22, { align: 'center' });
    doc.setTextColor(180, 220, 255);
    doc.setFontSize(8);
    doc.text(`Édité le ${today()}`, 105, 30, { align: 'center' });

    doc.setTextColor(15, 30, 60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(title, 105, 55, { align: 'center' });
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.7);
    doc.line(40, 58, 170, 58);
};

const pdfFooter = (doc: InstanceType<typeof jsPDF>) => {
    const h = doc.internal.pageSize.height;
    doc.setFillColor(242, 245, 250);
    doc.rect(0, h - 16, 210, 16, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(130, 140, 160);
    doc.text('Rapport confidentiel — Système de Gestion du Personnel — Mairie de Yopougon', 105, h - 8, { align: 'center' });
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, 195, h - 8, { align: 'right' });
};

const statCard = (doc: InstanceType<typeof jsPDF>, x: number, y: number, w: number, h: number, label: string, value: string | number, color: [number, number, number]) => {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, w, h, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(String(value), x + w / 2, y + h / 2 + 2, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(label.toUpperCase(), x + w / 2, y + h - 5, { align: 'center' });
};

export const exportStatsPDF = (agents: any[], conges: any[]) => {
    const doc = new jsPDF();

    const totalAgents = agents.length;
    const enConge = conges.filter((c) => c.statut === 'Approuvé').length;
    const enAttente = conges.filter((c) => c.statut === 'En attente').length;
    const soldeTotal = agents.reduce((acc, a) => acc + (a.jours_conge_annuel ?? 30), 0);

    pdfHeader(doc, 'RAPPORT STATISTIQUE DU PERSONNEL');

    // ── Cartes de stats ─────────────────
    statCard(doc, 15, 65, 42, 28, 'Total Agents', totalAgents, [16, 185, 129]);
    statCard(doc, 62, 65, 42, 28, 'En Congé', enConge, [59, 130, 246]);
    statCard(doc, 109, 65, 42, 28, 'En Attente', enAttente, [245, 158, 11]);
    statCard(doc, 156, 65, 42, 28, 'Solde (jours)', soldeTotal, [139, 92, 246]);

    // ── Répartition par Direction ─────────────
    doc.setTextColor(15, 30, 60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Répartition par Direction', 15, 108);

    const dirCount: Record<string, number> = {};
    agents.forEach((a) => {
        const dir = a.direction || 'Autres';
        dirCount[dir] = (dirCount[dir] || 0) + 1;
    });
    const dirs = Object.entries(dirCount).sort((a, b) => b[1] - a[1]);

    let y = 115;
    dirs.forEach(([dir, count], i) => {
        const barW = totalAgents > 0 ? (count / totalAgents) * 120 : 0;
        const bg = i % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
        doc.setFillColor(...(bg as [number, number, number]));
        doc.rect(12, y - 3, 186, 8, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(50, 60, 80);
        const shortDir = dir.length > 42 ? dir.slice(0, 42) + '…' : dir;
        doc.text(shortDir, 14, y + 3);
        doc.setFillColor(16, 185, 129);
        doc.rect(140, y - 1, barW * 0.55, 5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 30, 60);
        doc.text(`${count}`, 192, y + 3, { align: 'right' });
        y += 9;
        if (y > 260) {
            pdfFooter(doc);
            doc.addPage();
            y = 20;
        }
    });

    // ── Congés par Type ────────────────────────
    y += 6;
    if (y > 240) { pdfFooter(doc); doc.addPage(); y = 20; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 30, 60);
    doc.text('Congés par Type', 15, y);
    y += 7;

    const typeCount: Record<string, number> = {};
    conges.forEach((c) => { typeCount[c.type] = (typeCount[c.type] || 0) + 1; });
    const types = Object.entries(typeCount).sort((a, b) => b[1] - a[1]);

    types.forEach(([type, count], i) => {
        const bg = i % 2 === 0 ? [240, 253, 244] : [255, 255, 255];
        doc.setFillColor(...(bg as [number, number, number]));
        doc.rect(12, y - 3, 186, 8, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(50, 60, 80);
        doc.text(type, 14, y + 3);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text(`${count} demande(s)`, 192, y + 3, { align: 'right' });
        y += 9;
    });

    pdfFooter(doc);
    doc.save(`Rapport_Stats_DRH_${stamp()}.pdf`);
};
