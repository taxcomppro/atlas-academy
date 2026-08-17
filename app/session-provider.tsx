"use client";

// Thin wrapper so the root layout (a Server Component) can include
// the Better-Auth client SessionProvider for child client components.
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
