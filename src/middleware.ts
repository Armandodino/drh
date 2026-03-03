import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedApiRoutes = [
  '/api/products',
  '/api/categories',
  '/api/orders',
  '/api/upload',
  '/api/settings',
];

// Routes that are public (no auth needed)
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/me',
  '/api/auth/logout',
  '/api/seed',
  '/api/health',
];

// Routes that need special handling
const methodProtection: Record<string, string[]> = {
  '/api/products': ['POST', 'PUT', 'DELETE'], // GET is public
  '/api/categories': ['POST', 'PUT', 'DELETE'], // GET is public
  '/api/orders': ['POST', 'PUT', 'DELETE'], // GET could be public for order tracking
  '/api/upload': ['POST'], // All methods need auth
  '/api/settings': ['GET', 'POST', 'PUT'], // All methods need auth
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Skip non-API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if this route needs authentication for this method
  let needsAuth = false;
  for (const [route, methods] of Object.entries(methodProtection)) {
    if (pathname.startsWith(route) && methods.includes(method)) {
      needsAuth = true;
      break;
    }
  }

  // If auth is not needed for this method, allow
  if (!needsAuth) {
    return NextResponse.next();
  }

  // Check for admin session
  const adminSession = request.cookies.get('admin_session')?.value;
  const adminId = request.cookies.get('admin_id')?.value;

  if (!adminSession || !adminId) {
    return NextResponse.json(
      { error: 'Authentification requise' },
      { status: 401 }
    );
  }

  // Validate session token format
  try {
    const decoded = Buffer.from(adminSession, 'base64').toString();
    const [tokenAdminId, timestamp] = decoded.split(':');
    
    if (tokenAdminId !== adminId) {
      return NextResponse.json(
        { error: 'Session invalide' },
        { status: 401 }
      );
    }

    // Check session age
    const sessionAge = Date.now() - parseInt(timestamp);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    if (sessionAge > maxAge) {
      return NextResponse.json(
        { error: 'Session expirée' },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Session invalide' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
