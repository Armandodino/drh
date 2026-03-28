import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const caller = getUserFromRequest(request);
  if (!caller) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }



  try {
    const { targetMatricule, currentPassword, newPassword } = await request.json();
    
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ message: 'Nouveau mot de passe de 6 caractères minimum requis' }, { status: 400 });
    }

    const matriculeToUpdate = targetMatricule || caller.matricule;
    
    // Only SUPER_ADMIN can edit others passwords
    if (matriculeToUpdate !== caller.matricule && caller.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Droits insuffisants pour modifier un autre compte' }, { status: 403 });
    }

    const targetUser = await db.employe.findUnique({
      where: { matricule: matriculeToUpdate }
    });

    if (!targetUser) {
       return NextResponse.json({ message: 'Utilisateur introuvable' }, { status: 404 });
    }

    // Verify current password if changing own password
    if (matriculeToUpdate === caller.matricule && targetUser.password) {
      if (!currentPassword) {
         return NextResponse.json({ message: 'Mot de passe actuel requis' }, { status: 400 });
      }
      const isValid = await bcrypt.compare(currentPassword, targetUser.password);
      if (!isValid) {
         return NextResponse.json({ message: 'Mot de passe actuel incorrect' }, { status: 401 });
      }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await db.employe.update({
      where: { matricule: matriculeToUpdate },
      data: { password: hashedNewPassword }
    });

    return NextResponse.json({ success: true, message: 'Mot de passe mis à jour avec succès' });

  } catch (error) {
    console.error('ERREUR CHANGE PASSWORD:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
