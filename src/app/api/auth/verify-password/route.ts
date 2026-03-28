import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const employe = await db.employe.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!employe || !employe.password) {
      return NextResponse.json({ valid: false });
    }

    const valid = await bcrypt.compare(password, employe.password);

    return NextResponse.json({ valid });
  } catch (error) {
    console.error('Erreur vérification mot de passe:', error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
