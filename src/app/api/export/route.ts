import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, isAdmin } from '@/lib/auth';
import * as XLSX from 'xlsx';

// GET - Exporter les données en Excel
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const type = request.nextUrl.searchParams.get('type') || 'agents';

    const wb = XLSX.utils.book_new();

    if (type === 'agents' || type === 'all') {
      const agents = await db.employe.findMany({
        where: { role: 'AGENT' },
        orderBy: { nom: 'asc' },
        select: {
          matricule: true,
          nom: true,
          prenoms: true,
          sexe: true,
          direction: true,
          fonction: true,
          telephone: true,
          email: true,
          statut: true,
          dateEmbauche: true,
          joursCongeAnnuel: true,
          joursPrisHistorique: true,
        },
      });

      const agentRows = agents.map(a => ({
        'Matricule': a.matricule,
        'Nom': a.nom,
        'Prénoms': a.prenoms,
        'Sexe': a.sexe,
        'Direction': a.direction,
        'Fonction': a.fonction || '',
        'Téléphone': a.telephone || '',
        'Email': a.email || '',
        'Statut': a.statut,
        'Date Embauche': a.dateEmbauche ? a.dateEmbauche.toISOString().split('T')[0] : '',
        'Jours Congé Annuel': a.joursCongeAnnuel,
        'Jours Pris Historique': a.joursPrisHistorique,
      }));

      const wsAgents = XLSX.utils.json_to_sheet(agentRows);
      XLSX.utils.book_append_sheet(wb, wsAgents, 'Agents');
    }

    if (type === 'conges' || type === 'all') {
      const conges = await db.conge.findMany({
        orderBy: { createdAt: 'desc' },
        include: { employe: { select: { nom: true, prenoms: true, matricule: true, direction: true } } },
      });

      const congeRows = conges.map(c => ({
        'Matricule': c.employe.matricule,
        'Nom': c.employe.nom,
        'Prénoms': c.employe.prenoms,
        'Direction': c.employe.direction,
        'Date Départ': c.dateDepart.toISOString().split('T')[0],
        'Date Retour': c.dateRetour.toISOString().split('T')[0],
        'Nombre Jours': c.nombreJours,
        'Type': c.type,
        'Statut': c.statut,
        'Motif': c.motif || '',
        'Date Création': c.createdAt.toISOString().split('T')[0],
      }));

      const wsConges = XLSX.utils.json_to_sheet(congeRows);
      XLSX.utils.book_append_sheet(wb, wsConges, 'Congés');
    }

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const filename = type === 'all' ? 'DRH_Yopougon_Export_Complet.xlsx' : `DRH_Yopougon_${type}.xlsx`;

    // Tracer l'exportation
    await db.auditLog.create({
      data: {
        action: 'EXPORT_DONNEES',
        details: `Exportation du fichier Excel: ${filename}`,
        adminId: user.id
      }
    });

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Erreur export:', error);
    return NextResponse.json({ message: 'Erreur export' }, { status: 500 });
  }
}
