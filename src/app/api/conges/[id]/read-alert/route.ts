import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Droits insuffisants' }, { status: 403 });
    }

    const { id } = await props.params;

    const conge = await db.conge.update({
      where: { id: parseInt(id) },
      data: { alerteRetourLue: true }
    });

    return NextResponse.json(conge);
  } catch (error) {
    console.error('Erreur lecture alerte:', error);
    return NextResponse.json(
      { message: 'Erreur lors du traitement de la requête' },
      { status: 500 }
    );
  }
}
