import { NextRequest, NextResponse } from "next/server";

// NOTE: Middleware runs in the Edge Runtime which cannot use Node.js modules
// like 'pg' or 'crypto'. So we do a lightweight cookie-presence check here.
// Full session validation (DB lookup) happens in server components/route handlers
// via lib/session.ts -> auth.api.getSession().

const PROTECTED_PREFIXES = ["/academy", "/api/academy"];
// Better-Auth session cookie name
const SESSION_COOKIE = "better-auth.session_token";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Cookie presence check — sufficient for routing; pages do real validation
  const hasSession = req.cookies.has(SESSION_COOKIE);
  if (hasSession) return NextResponse.next();

  const signInUrl = new URL("/sign-in", req.url);
  signInUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|pdf|mp4|zip|webmanifest)).*)",
  ],
};
