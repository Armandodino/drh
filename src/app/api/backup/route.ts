import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

// GET - Sauvegarde complète de la base de données en JSON
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const [agents, conges, choixConges, notifications, auditLogs] = await Promise.all([
      db.employe.findMany({ orderBy: { id: 'asc' } }),
      db.conge.findMany({ orderBy: { id: 'asc' } }),
      db.choixConge.findMany({ orderBy: { id: 'asc' } }),
      db.notification.findMany({ orderBy: { id: 'asc' } }),
      db.auditLog.findMany({ orderBy: { id: 'asc' } }),
    ]);

    const backup = {
      metadata: {
        application: 'DRH Yopougon',
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        exportBy: user.matricule,
        counts: {
          agents: agents.length,
          conges: conges.length,
          choixConges: choixConges.length,
          notifications: notifications.length,
          auditLogs: auditLogs.length,
        },
      },
      data: {
        agents,
        conges,
        choixConges,
        notifications,
        auditLogs,
      },
    };

    const json = JSON.stringify(backup, null, 2);
    const date = new Date().toISOString().split('T')[0];

    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="DRH_Yopougon_Backup_${date}.json"`,
      },
    });
  } catch (error) {
    console.error('Erreur backup:', error);
    return NextResponse.json({ message: 'Erreur backup' }, { status: 500 });
  }
}
