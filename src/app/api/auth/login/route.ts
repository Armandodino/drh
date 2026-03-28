import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'DRH_YOP_SECRET_2026';

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const { matricule, password } = await request.json();

    if (!matricule || !password) {
      return NextResponse.json(
        { message: 'Matricule et mot de passe requis' },
        { status: 400 }
      );
    }

    const user = await prisma.employe.findUnique({
      where: { matricule: matricule.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Identifiant introuvable' },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { message: 'Compte non configuré' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier les droits d'accès
    const allowedRoles = ['DEV', 'ADMIN_DRH', 'ADMIN', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { message: 'Droits insuffisants' },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      { id: user.id, matricule: user.matricule, role: user.role, nom: user.nom },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Détecter si la Gérante utilise le mot de passe par défaut
    const mustChangePassword = user.role === 'ADMIN' && password === 'Admin@2026';

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenoms: user.prenoms,
        matricule: user.matricule,
        role: user.role,
        direction: user.direction,
      },
      mustChangePassword
    });
  } catch (error) {
    console.error('Erreur login:', error);
    return NextResponse.json(
      { message: 'Erreur serveur', detail: String(error).substring(0, 200) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
