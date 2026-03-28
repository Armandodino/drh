import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const choix = await db.choixConge.findMany({
      orderBy: { annee: 'desc' },
      include: {
        employe: {
          select: {
            nom: true,
            prenoms: true,
            matricule: true,
            fonction: true,
            direction: true
          }
        }
      }
    });

    const formatted = choix.map(c => ({
      id: c.id,
      employeId: c.employeId,
      nom: c.employe.nom,
      prenoms: c.employe.prenoms,
      matricule: c.employe.matricule,
      fonction: c.employe.fonction || 'Non défini',
      direction: c.employe.direction || 'Non défini',
      dateDepartSouhaitee: c.dateDepartSouhaitee.toISOString(),
      dateRetourSouhaitee: c.dateRetourSouhaitee.toISOString(),
      nombreJours: c.nombreJours,
      statut: c.statut,
      annee: c.annee
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Erreur récupération choix congés:', error);
    return NextResponse.json([], { status: 500 });
  }
}
