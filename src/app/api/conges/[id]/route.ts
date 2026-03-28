import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    
    const body = await request.json();
    const { statut } = body;

    if (!statut) {
      return NextResponse.json({ message: 'Statut requis' }, { status: 400 });
    }

    const updated = await db.conge.update({
      where: { id: parseInt(id) },
      data: {
        statut,
        dateApprobation: statut?.toLowerCase().includes('approuve') || statut?.toLowerCase().includes('valid') ? new Date() : null,
        approuvePar: user.id
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Erreur mise à jour congé:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
