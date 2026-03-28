import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, isAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const targetEmployee = await db.employe.findUnique({ where: { id: parseInt(id) } });
    if (!targetEmployee) {
      return NextResponse.json({ message: 'Agent introuvable' }, { status: 404 });
    }

    const updatedAgent = await db.employe.update({
      where: { id: parseInt(id) },
      data: {
        nom: data.nom?.toUpperCase() || targetEmployee.nom,
        prenoms: data.prenoms || targetEmployee.prenoms,
        sexe: data.sexe || targetEmployee.sexe,
        direction: data.direction || targetEmployee.direction,
        fonction: data.fonction || targetEmployee.fonction,
        telephone: data.telephone || targetEmployee.telephone,
        email: data.email || targetEmployee.email,
        dateEmbauche: data.dateEmbauche ? new Date(data.dateEmbauche) : targetEmployee.dateEmbauche,
      },
    });

    await db.auditLog.create({
      data: {
        action: 'MODIFICATION_AGENT',
        details: `Mise à jour du profil de ${updatedAgent.nom} ${updatedAgent.prenoms} (${updatedAgent.matricule})`,
        adminId: user.id
      }
    });

    return NextResponse.json({ message: 'Agent mis à jour avec succès', agent: updatedAgent });
  } catch (error: any) {
    console.error('Erreur modification agent:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ message: 'Mot de passe requis pour la suppression' }, { status: 400 });
    }

    // Vérifier le mot de passe de l'administrateur
    const adminUser = await db.employe.findUnique({ where: { id: user.id } });
    if (!adminUser || !adminUser.password) {
      return NextResponse.json({ message: 'Compte administrateur invalide' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, adminUser.password);
    if (!isValid) {
      return NextResponse.json({ message: 'Mot de passe incorrect' }, { status: 403 });
    }

    const targetEmployee = await db.employe.findUnique({ where: { id: parseInt(id) } });
    if (!targetEmployee) {
      return NextResponse.json({ message: 'Agent introuvable' }, { status: 404 });
    }

    if (targetEmployee.role === 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Impossible de supprimer un Super Admin' }, { status: 403 });
    }

    await db.employe.delete({
      where: { id: parseInt(id) },
    });

    await db.auditLog.create({
      data: {
        action: 'SUPPRESSION_AGENT',
        details: `Suppression définitive de ${targetEmployee.nom} ${targetEmployee.prenoms} (${targetEmployee.matricule})`,
        adminId: user.id
      }
    });

    return NextResponse.json({ message: 'Agent supprimé avec succès' });
  } catch (error: any) {
    console.error('Erreur suppression agent:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
