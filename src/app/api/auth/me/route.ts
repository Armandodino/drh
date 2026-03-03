import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    
    // Check for DRH agent session first
    const agentId = cookieStore.get('agent_id')?.value;
    const drhSession = cookieStore.get('drh_session')?.value;

    if (agentId && drhSession) {
      const agent = await db.agent.findUnique({
        where: { id: agentId },
        select: {
          id: true,
          matricule: true,
          nom: true,
          prenom: true,
          direction: true,
          service: true,
          soldeConges: true,
          role: true,
          active: true,
        },
      });

      if (agent && agent.active) {
        return NextResponse.json({ user: agent });
      }
    }

    // Check for admin session
    const adminId = cookieStore.get('admin_id')?.value;
    const adminSession = cookieStore.get('admin_session')?.value;

    if (adminId && adminSession) {
      const admin = await db.admin.findUnique({
        where: { id: adminId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (admin) {
        return NextResponse.json({ admin });
      }
    }

    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
