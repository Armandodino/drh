import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'DRH_YOP_SECRET_2026';

export interface UserPayload {
  id: number;
  matricule: string;
  role: string;
  nom: string;
}

export function verifyToken(authHeader: string | null): UserPayload | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  
  try {
    const token = authHeader.substring(7);
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export function getUserFromRequest(request: NextRequest): UserPayload | null {
  const authHeader = request.headers.get('authorization');
  return verifyToken(authHeader);
}

export function isAdmin(user: UserPayload | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'ADMIN_DRH' || user?.role === 'DEV' || user?.role === 'SUPER_ADMIN';
}
