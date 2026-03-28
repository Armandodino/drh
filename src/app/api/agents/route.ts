import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, isAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET - Récupérer tous les agents
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const agents = await db.employe.findMany({
      orderBy: { nom: 'asc' },
      select: {
        id: true,
        matricule: true,
        nom: true,
        prenoms: true,
        sexe: true,
        direction: true,
        fonction: true,
        telephone: true,
        email: true,
        statut: true,
        joursCongeAnnuel: true,
        joursPrisHistorique: true,
        dateEmbauche: true,
        role: true,
      },
    });

    // Convert date to string for frontend
    const formatted = agents.map(a => ({
      ...a,
      dateEmbauche: a.dateEmbauche?.toISOString().split('T')[0] || null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Erreur récupération agents:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Créer un nouvel agent
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!isAdmin(user)) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const data = await request.json();
    
    // Vérifier si le matricule existe déjà
    const existing = await db.employe.findUnique({
      where: { matricule: data.matricule.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Ce matricule existe déjà' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe par défaut
    const hashedPassword = await bcrypt.hash('password123', 10);

    const agent = await db.employe.create({
      data: {
        matricule: data.matricule.toLowerCase(),
        nom: data.nom.toUpperCase(),
        prenoms: data.prenoms,
        sexe: data.sexe || 'M',
        direction: data.direction,
        fonction: data.fonction || null,
        telephone: data.telephone || null,
        email: data.email || null,
        dateEmbauche: data.date_embauche ? new Date(data.date_embauche) : null,
        joursPrisHistorique: data.jours_pris_historique || 0,
        password: hashedPassword,
        role: 'AGENT',
        statut: 'actif',
        joursCongeAnnuel: 30,
      },
    });

    return NextResponse.json({
      id: agent.id,
      message: 'Agent ajouté avec succès',
    });
  } catch (error) {
    console.error('Erreur création agent:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}
