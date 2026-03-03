import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// Verify admin authentication
export async function verifyAdmin(request: NextRequest): Promise<{ success: true; admin: { id: string; email: string; name: string; role: string } } | { success: false; error: string }> {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!adminId || !sessionToken) {
      return { success: false, error: 'Non authentifié' };
    }

    // Verify session token format
    const decoded = Buffer.from(sessionToken, 'base64').toString();
    const [tokenAdminId, timestamp] = decoded.split(':');
    
    if (tokenAdminId !== adminId) {
      return { success: false, error: 'Session invalide' };
    }

    // Check session age (max 7 days)
    const sessionAge = Date.now() - parseInt(timestamp);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    if (sessionAge > maxAge) {
      return { success: false, error: 'Session expirée' };
    }

    const admin = await db.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!admin) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    return { success: true, admin };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { success: false, error: 'Erreur d\'authentification' };
  }
}

// Middleware wrapper for API routes
export function withAuth(
  handler: (request: NextRequest, context: unknown, admin: { id: string; email: string; name: string; role: string }) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: unknown) => {
    const authResult = await verifyAdmin(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    return handler(request, context, authResult.admin);
  };
}

// Rate limiting (in-memory, for production use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

export function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; resetTime: number } {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);

  if (!attempts || now - attempts.lastAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    return { allowed: false, remainingAttempts: 0, resetTime: attempts.lastAttempt + RATE_LIMIT_WINDOW };
  }

  attempts.count++;
  attempts.lastAttempt = now;
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - attempts.count, resetTime: attempts.lastAttempt + RATE_LIMIT_WINDOW };
}

export function resetRateLimit(identifier: string) {
  loginAttempts.delete(identifier);
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s+()-]{8,20}$/;
  return phoneRegex.test(phone);
}
