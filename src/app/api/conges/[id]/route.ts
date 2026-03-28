import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    
    const body = await request.json();
    const { statut, password } = body;

    // --- SECURE ACTION --- 
    // Wait, the user was verified above but we need the password. Let's fetch the user password from DB.
    if (!password) {
      return NextResponse.json({ message: 'Mot de passe de confirmation requis' }, { status: 400 });
    }

    const adminUser = await db.employe.findUnique({ where: { id: user.id } });
    if (!adminUser || !adminUser.password) {
      return NextResponse.json({ message: 'Compte administrateur invalide' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, adminUser.password);
    if (!isValid) {
      return NextResponse.json({ message: 'Mot de passe incorrect' }, { status: 403 });
    }

    if (!statut) {
      return NextResponse.json({ message: 'Statut requis' }, { status: 400 });
    }

    const updated = await db.conge.update({
      where: { id: parseInt(id) },
      data: {
        statut,
        dateApprobation: statut?.toLowerCase().includes('approuve') || statut?.toLowerCase().includes('valid') ? new Date() : null,
        approuvePar: user.id
      },
      include: { employe: true }
    });

    // Tracer l'action dans le journal d'activité
    await db.auditLog.create({
      data: {
        action: statut?.toLowerCase().includes('approuve') ? 'VALIDATION_CONGE' : 'ANNULATION_CONGE',
        details: `Modification statut du congé de ${updated.employe.nom} ${updated.employe.prenoms} : ${statut}`,
        adminId: user.id
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Erreur mise à jour congé:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    
    const body = await request.json();
    const { password } = body;

    // --- SECURE ACTION --- 
    if (!password) {
      return NextResponse.json({ message: 'Mot de passe de confirmation requis' }, { status: 400 });
    }

    const adminUser = await db.employe.findUnique({ where: { id: user.id } });
    if (!adminUser || !adminUser.password) {
      return NextResponse.json({ message: 'Compte administrateur invalide' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, adminUser.password);
    if (!isValid) {
      return NextResponse.json({ message: 'Mot de passe incorrect' }, { status: 403 });
    }

    const congeASupprimer = await db.conge.findUnique({
      where: { id: parseInt(id) },
      include: { employe: true }
    });

    if (!congeASupprimer) {
      return NextResponse.json({ message: 'Congé introuvable' }, { status: 404 });
    }

    await db.conge.delete({
      where: { id: parseInt(id) }
    });

    // Tracer l'action dans le journal d'activité
    await db.auditLog.create({
      data: {
        action: 'SUPPRESSION_CONGE',
        details: `Suppression de la demande de congé de ${congeASupprimer.employe.nom} ${congeASupprimer.employe.prenoms}`,
        adminId: user.id
      }
    });

    return NextResponse.json({ success: true, message: 'Congé supprimé avec succès' });
  } catch (error: any) {
    console.error('Erreur suppression congé:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
