import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // IMPORTANT: Don't run middleware on auth API routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // Define public paths that don't require authentication
  const publicPaths = ['/', '/api/auth'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // If not authenticated and trying to access protected route
  if (!token && !isPublicPath) {
    const url = new URL('/', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // If authenticated and trying to access root, redirect to dashboard
  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (authentication routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/auth).*)',
  ],
};