import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { Role } from '@prisma/client';

const ADMIN_ROUTES = ['/admin/users', '/api/users'];

const roleHierarchy: Record<Role, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  EDITOR: 60,
  AUTHOR: 40,
  VIEWER: 20,
};

function hasRole(userRole: Role, minRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[minRole];
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role as Role | undefined;

  // Public routes that are always accessible
  const isPublicRoute =
    nextUrl.pathname.startsWith('/blog') ||
    nextUrl.pathname.startsWith('/category') ||
    nextUrl.pathname.startsWith('/search') ||
    nextUrl.pathname === '/';

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Auth pages (login, register)
  const isAuthPage = nextUrl.pathname.startsWith('/auth');
  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/', nextUrl.origin));
    }
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!isLoggedIn) {
    const loginUrl = new URL('/auth/auth1/login', nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!userRole) {
    return NextResponse.redirect(new URL('/', nextUrl.origin));
  }

  // Admin users page → SUPER_ADMIN only
  if (nextUrl.pathname.startsWith('/admin/users')) {
    if (!hasRole(userRole, 'SUPER_ADMIN')) {
      return NextResponse.redirect(new URL('/admin', nextUrl.origin));
    }
  }

  // API users routes → SUPER_ADMIN only
  if (nextUrl.pathname.startsWith('/api/users')) {
    if (!hasRole(userRole, 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
  }

  // Admin posts page → AUTHOR and above
  if (nextUrl.pathname.startsWith('/admin')) {
    if (!hasRole(userRole, 'AUTHOR')) {
      return NextResponse.redirect(new URL('/', nextUrl.origin));
    }
  }

  // API posts method-based checks
  if (nextUrl.pathname.startsWith('/api/posts')) {
    if (req.method === 'POST' && !hasRole(userRole, 'AUTHOR')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    if ((req.method === 'DELETE' || req.method === 'PUT' || req.method === 'PATCH') && !hasRole(userRole, 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images|icons|fonts|og-default.png).*)',
  ],
};
