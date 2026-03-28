import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const conges = await db.conge.findMany({
      orderBy: { dateDepart: 'desc' },
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

    // Transformer le résultat pour le frontend
    const formatted = conges.map(c => ({
      id: c.id,
      employe_id: c.employeId,
      nom: c.employe.nom,
      prenoms: c.employe.prenoms,
      matricule: c.employe.matricule,
      fonction: c.employe.fonction || 'Non défini',
      direction: c.employe.direction || 'Non défini',
      date_depart: c.dateDepart.toISOString(),
      date_retour: c.dateRetour.toISOString(),
      nombre_jours: c.nombreJours,
      type: c.type,
      motif: c.motif || '',
      statut: c.statut,
      annee: c.anneeConge || new Date(c.dateDepart).getFullYear()
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Erreur récupération congés:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const data = await request.json();

    const newConge = await db.conge.create({
      data: {
        employeId: data.employe_id,
        type: data.type || 'Annuel',
        dateDepart: new Date(data.date_depart),
        dateRetour: new Date(data.date_retour),
        nombreJours: data.nombre_jours,
        motif: data.motif,
        statut: data.statut || 'en_attente',
        anneeConge: data.annee || new Date(data.date_depart).getFullYear(),
      }
    });

    // Tracer l'action dans le journal d'activité
    await db.auditLog.create({
      data: {
        action: 'CREATION_CONGE',
        details: `Ajout d'un congé ${data.type || 'Annuel'} de ${data.nombre_jours} jours`,
        adminId: user.id
      }
    });

    return NextResponse.json(newConge, { status: 201 });
  } catch (error: any) {
    console.error('Erreur création congé:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
