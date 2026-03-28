import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les congés qui attendent une approbation
    const pendingConges = await db.conge.count({
      where: {
        statut: 'en_attente'
      }
    });

    return NextResponse.json({ count: pendingConges });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    return NextResponse.json({ count: 0 });
  }
}
