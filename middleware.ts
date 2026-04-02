import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-random-jwt-key'
);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect /workspace routes
  if (path.startsWith('/workspace')) {
    const sessionToken = request.cookies.get('workspace_session')?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      await jwtVerify(sessionToken, secret);
      return NextResponse.next();
    } catch (err) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('workspace_session');
      return response;
    }
  }

  // Redirect authenticated users from landing page to workspace
  if (path === '/') {
    const sessionToken = request.cookies.get('workspace_session')?.value;
    if (sessionToken) {
      try {
        await jwtVerify(sessionToken, secret);
        return NextResponse.redirect(new URL('/workspace', request.url));
      } catch (err) {
        // Token invalid, clear it
        const response = NextResponse.next();
        response.cookies.delete('workspace_session');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};