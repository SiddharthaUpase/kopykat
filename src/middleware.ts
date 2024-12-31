import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Add your custom logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Public paths that don't require authentication
        if (path === '/login' || path === '/register') {
          return true;
        }
        
        // Protected paths that require authentication
        if (path.startsWith('/(authenticated)') || path === '/generate' || path === '/posts' || path === '/calendar') {
          return !!token;
        }
        
        // Allow all other paths
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 