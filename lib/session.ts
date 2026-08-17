// lib/session.ts — server-side session helper for atlas-academy
// Uses Better-Auth (same DB + secret as taxcomppro-web-main)
import { headers } from "next/headers";
import { auth } from "./auth";

export type AcademyUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  tier: string;
};

/**
 * Get the current Better-Auth session from the request headers.
 * Works server-side in Route Handlers, Server Components, and Server Actions.
 */
export async function getAcademySession(): Promise<AcademyUser | null> {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (!session?.user) return null;
    return {
      id:    session.user.id,
      email: session.user.email,
      name:  session.user.name ?? "",
      role:  (session.user as any).role ?? "MEMBER",
      tier:  (session.user as any).tier ?? "FREE",
    };
  } catch {
    return null;
  }
}

/**
 * Require a valid session — throws if not authenticated.
 */
export async function requireAcademySession(): Promise<AcademyUser> {
  const user = await getAcademySession();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
