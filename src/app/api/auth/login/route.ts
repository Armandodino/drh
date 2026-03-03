import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
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

    // Check if password is hashed (starts with $2a$, $2b$, or $2y$)
    const isHashed = admin.password.startsWith('$2');
    
    let isValidPassword = false;
    
    if (isHashed) {
      // Compare with hashed password
      isValidPassword = await bcrypt.compare(password, admin.password);
    } else {
      // Plain text comparison (for migration)
      isValidPassword = admin.password === password;
      
      // Hash and update the password for next time
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

    // Set a secure session cookie
    const cookieStore = await cookies();
    const sessionToken = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64');
    
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    // Store session with admin ID for verification
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
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
