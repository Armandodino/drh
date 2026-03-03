import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { matricule, password, email } = await request.json();

    // Support both matricule (DRH) and email (Store admin) login
    if (matricule && password) {
      // DRH Agent login
      const agent = await db.agent.findUnique({
        where: { matricule: matricule.toUpperCase().trim() },
      });

      if (!agent) {
        return NextResponse.json(
          { error: 'Matricule ou mot de passe incorrect' },
          { status: 401 }
        );
      }

      if (!agent.active) {
        return NextResponse.json(
          { error: 'Votre compte est désactivé' },
          { status: 401 }
        );
      }

      // Check password
      const isHashed = agent.password.startsWith('$2');
      let isValidPassword = false;

      if (isHashed) {
        isValidPassword = await bcrypt.compare(password, agent.password);
      } else {
        isValidPassword = agent.password === password;
        if (isValidPassword) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await db.agent.update({
            where: { id: agent.id },
            data: { password: hashedPassword },
          });
        }
      }

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Matricule ou mot de passe incorrect' },
          { status: 401 }
        );
      }

      // Set session cookie
      const cookieStore = await cookies();
      const sessionToken = Buffer.from(`agent:${agent.id}:${Date.now()}`).toString('base64');

      cookieStore.set('drh_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      cookieStore.set('agent_id', agent.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return NextResponse.json({
        user: {
          id: agent.id,
          matricule: agent.matricule,
          nom: agent.nom,
          prenom: agent.prenom,
          direction: agent.direction,
          service: agent.service,
          soldeConges: agent.soldeConges,
          role: agent.role,
        },
      });
    }

    // Store admin login (existing functionality)
    if (email && password) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Format d'email invalide" },
          { status: 400 }
        );
      }

      const admin = await db.admin.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!admin) {
        return NextResponse.json(
          { error: 'Identifiants incorrects' },
          { status: 401 }
        );
      }

      const isHashed = admin.password.startsWith('$2');
      let isValidPassword = false;

      if (isHashed) {
        isValidPassword = await bcrypt.compare(password, admin.password);
      } else {
        isValidPassword = admin.password === password;
        if (isValidPassword) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await db.admin.update({
            where: { id: admin.id },
            data: { password: hashedPassword },
          });
        }
      }

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Identifiants incorrects' },
          { status: 401 }
        );
      }

      const cookieStore = await cookies();
      const sessionToken = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64');

      cookieStore.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      cookieStore.set('admin_id', admin.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return NextResponse.json({
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      });
    }

    return NextResponse.json(
      { error: 'Identifiants requis' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
