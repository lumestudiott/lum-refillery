import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Simplified middleware — maintenance rewrite ONLY.
 * Clerk auth is temporarily removed to isolate the rewrite issue.
 */
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const { pathname } = req.nextUrl;

  // Debug: always set a header so we can verify middleware runs
  const isMatch = host.includes('lumerefillery.com');

  // Maintenance rewrite for production domain
  if (
    isMatch &&
    !pathname.startsWith('/maintenance') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/favicon') &&
    !pathname.startsWith('/videos') &&
    !pathname.startsWith('/images')
  ) {
    const response = NextResponse.rewrite(new URL('/maintenance', req.url));
    response.headers.set('x-maint-debug', `host=${host},match=true,rewrite=yes`);
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('x-maint-debug', `host=${host},match=${isMatch},rewrite=no`);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:css|js|png|jpg|svg|ico|woff2?|ttf|otf)).*)'],
};
