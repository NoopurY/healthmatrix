import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT, SESSION_COOKIE } from '@/lib/auth';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/upload', '/reports'];

// Auth routes that should redirect to dashboard if already logged in
const authRoutes = ['/login', '/signup'];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtected = protectedRoutes.some(route => path.startsWith(route));
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));

  // Get session cookie
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  
  // Verify token
  const session = token ? await verifyJWT(token) : null;

  // 1. Redirect to login if accessing protected route without session
  if (isProtected && !session) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(url);
  }

  // 2. Redirect to dashboard if accessing login/signup with active session
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

// Config to match all routes except static assets and internal APIs
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
