import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/conges - Get all conges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const statut = searchParams.get('statut');

    const where: Record<string, unknown> = {};
    
    if (agentId) {
      where.agentId = agentId;
    }
    
    if (statut) {
      where.statut = statut;
    }

    const conges = await db.conge.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            matricule: true,
            nom: true,
            prenom: true,
            direction: true,
            service: true,
            fonction: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ conges });
  } catch (error) {
    console.error('Get conges error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des congés' },
      { status: 500 }
    );
  }
}

// POST /api/conges - Create a new conge
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const { agentId, type, dateDebut, dateFin, motif, nbJours } = data;

    if (!agentId || !type || !dateDebut || !dateFin) {
      return NextResponse.json(
        { error: 'Agent, type, date début et date fin sont requis' },
        { status: 400 }
      );
    }

    // Calculate days if not provided
    let calculatedDays = nbJours;
    if (!calculatedDays) {
      const start = new Date(dateDebut);
      const end = new Date(dateFin);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    const conge = await db.conge.create({
      data: {
        agentId,
        type,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        nbJours: calculatedDays,
        motif,
        statut: 'en_attente',
      },
      include: {
        agent: true,
      },
    });

    return NextResponse.json({ conge });
  } catch (error) {
    console.error('Create conge error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du congé' },
      { status: 500 }
    );
  }
}
