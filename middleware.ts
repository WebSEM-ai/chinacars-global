import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes — check for auth token
  if (pathname.startsWith('/admin')) {
    // Allow login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check for NextAuth session token
    const token = request.cookies.get('authjs.session-token')?.value
      || request.cookies.get('__Secure-authjs.session-token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  }

  // API routes — skip i18n
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Public routes — apply i18n
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\..*).*)', '/admin/:path*'],
};
