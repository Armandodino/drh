import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const pendingConges = await db.conge.count({
      where: { statut: 'en_attente' }
    });

    // Compute the fin_proche count identically to how fin-proche/route.ts computes it
    const activeConges = await db.conge.findMany({
      where: {
        statut: { in: ['approuve', 'validé', 'valide', 'en_cours', 'en cours', 'cours'] },
        alerteRetourLue: false
      },
      select: { dateRetour: true }
    });

    const now = new Date();
    const finProcheCount = activeConges.filter(c => {
      const retour = new Date(c.dateRetour);
      const diffDays = Math.ceil((retour.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length;

    return NextResponse.json({ count: pendingConges + finProcheCount });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    return NextResponse.json({ count: 0 });
  }
}
