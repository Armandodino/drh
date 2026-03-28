import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET - Récupérer le journal d'activité (SUPER_ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 403 });
    }

    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Erreur récupération logs:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Créer une entrée de log
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const data = await request.json();

    const log = await db.auditLog.create({
      data: {
        action: data.action,
        details: data.details,
        adminId: user.id,
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error('Erreur création log:', error);
    return NextResponse.json({ message: 'Erreur' }, { status: 500 });
  }
}
