import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Clear all session cookies
    cookieStore.delete('drh_session');
    cookieStore.delete('agent_id');
    cookieStore.delete('admin_session');
    cookieStore.delete('admin_id');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
