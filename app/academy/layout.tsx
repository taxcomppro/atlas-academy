import Image from "next/image";
import Link from "next/link";
import { AcademyNavClient } from "./nav-client";

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="academy-shell">
      {/* Top notice banner */}
      <div className="integration-notice">Atlas Academy · Connected through Tax Compliance Pro</div>

      {/* Shared Navbar */}
      <header className="academy-nav academy-nav--enhanced">
        <Link href="/academy" aria-label="Academy home">
          <Image
            src="/assets/Atlas_Academy_Logo.png"
            alt="Atlas Academy"
            width={100}
            height={67}
            className="header-academy-logo"
            priority
          />
        </Link>
        <AcademyNavClient />
      </header>

      {/* Page content */}
      {children}

      <style>{`
        .academy-nav--enhanced {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(16px, 4vw, 56px);
          height: 72px;
          background: var(--navy, #07182d);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
          gap: 20px;
        }
      `}</style>
    </div>
  );
}
