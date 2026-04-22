import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory store for rate limiting (per-instance)
// Structure: Map<IP, { count: number, resetTime: number }>
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const SENSITIVE_ROUTES = ['/api/user']; // Routes requiring strict limiting (5/15min)
const SENSITIVE_LIMIT = 5;
const SENSITIVE_WINDOW = 15 * 60 * 1000;

const GLOBAL_LIMIT = 60; // 60 requests per minute for other APIs
const GLOBAL_WINDOW = 60 * 1000;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const now = Date.now();
    
    const isSensitive = SENSITIVE_ROUTES.some(route => pathname.startsWith(route));
    const limit = isSensitive ? SENSITIVE_LIMIT : GLOBAL_LIMIT;
    const window = isSensitive ? SENSITIVE_WINDOW : GLOBAL_WINDOW;
    
    const key = `${ip}:${pathname}`;
    const rateData = rateLimitStore.get(key);

    if (!rateData || now > rateData.resetTime) {
      // New window or expired window
      rateLimitStore.set(key, { count: 1, resetTime: now + window });
    } else {
      // Within window
      if (rateData.count >= limit) {
        return NextResponse.json(
          { 
            error: "Too many attempts. Please wait before trying again.", 
            retryAfter: Math.ceil((rateData.resetTime - now) / 1000) 
          },
          { status: 429 }
        );
      }
      rateData.count += 1;
    }
  }

  return NextResponse.next();
}

// Config to only run on API routes
export const config = {
  matcher: '/api/:path*',
};
