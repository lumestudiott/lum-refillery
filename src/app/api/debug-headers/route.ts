import { NextResponse, type NextRequest } from 'next/server';

/** Temporary debug endpoint — returns request headers to diagnose middleware. */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    host: req.headers.get('host'),
    xForwardedHost: req.headers.get('x-forwarded-host'),
    hostname: req.nextUrl.hostname,
    url: req.url,
    allHeaders: Object.fromEntries(req.headers.entries()),
  });
}
