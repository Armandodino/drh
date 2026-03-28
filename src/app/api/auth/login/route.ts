import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'DRH_YOP_SECURE_2026';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export async function POST(request: NextRequest) {
  try {
    const { matricule, password } = await request.json();

    if (!matricule || !password) {
      return NextResponse.json(
        { message: 'Matricule et mot de passe requis' },
        { status: 400 }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('Missing Supabase configuration');
      return NextResponse.json(
        { message: 'Configuration serveur manquante' },
        { status: 500 }
      );
    }

    // Fetch user from Supabase REST API
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/employes?matricule=eq.${matricule.toLowerCase()}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Supabase error:', await response.text());
      return NextResponse.json(
        { message: 'Erreur de connexion a la base de donnees' },
        { status: 500 }
      );
    }

    const users = await response.json();

    if (!users || users.length === 0) {
      return NextResponse.json(
        { message: 'Identifiant introuvable' },
        { status: 401 }
      );
    }

    const user = users[0];

    if (!user.password) {
      return NextResponse.json(
        { message: 'Compte non configure. Contactez l\'administrateur.' },
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

    const allowedRoles = ['DEV', 'ADMIN_DRH', 'ADMIN', 'DIRECTEUR'];
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
    });
  } catch (error) {
    console.error('Erreur login:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
