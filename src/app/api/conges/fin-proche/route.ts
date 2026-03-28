import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les congés qui sont "approuve", "valid", "en_cours", "en cours" et dont l'alerte n'est pas lue
    const conges = await db.conge.findMany({
      where: {
        statut: {
          in: ['approuve', 'validé', 'valide', 'en_cours', 'en cours', 'cours']
        },
        alerteRetourLue: false
      },
      include: {
        employe: {
          select: {
            nom: true,
            prenoms: true,
            direction: true
          }
        }
      }
    });

    const now = new Date();
    
    // Filtrer manuellement pour ceux qui se terminent ou commencent bientôt
    const finProche = conges.filter(c => {
      const retour = new Date(c.dateRetour);
      const diffDays = Math.ceil((retour.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      // Congés qui se terminent dans les 5 prochains jours
      return diffDays <= 7 && diffDays >= 0;
    });

    const formatted = finProche.map(c => ({
      id: c.id,
      nom: c.employe.nom,
      prenoms: c.employe.prenoms,
      direction: c.employe.direction,
      date_retour: c.dateRetour.toISOString(),
      nombre_jours: c.nombreJours,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Erreur récupération congés fin proche:', error);
    return NextResponse.json([], { status: 500 });
  }
}
