import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('admin_id')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const admin = await db.admin.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!admin) {
      // Clear invalid cookies
      const response = NextResponse.json(
        { error: 'Session invalide' },
        { status: 401 }
      );
      response.cookies.delete('admin_session');
      response.cookies.delete('admin_id');
      return response;
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
