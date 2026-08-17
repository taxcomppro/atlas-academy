// tcp-session.ts — DEPRECATED
// This file has been replaced by lib/session.ts which uses Better-Auth.
// Re-exported for backward compatibility with any remaining code that imports from here.
export { getAcademySession, requireAcademySession, type AcademyUser as TcpIdentity } from "./session";
