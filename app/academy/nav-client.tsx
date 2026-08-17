"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { LogOut, User, ChevronDown, BookOpen, LayoutDashboard, Library, Settings, Users } from "lucide-react";

export function AcademyNavClient() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { href: "/academy", label: "Dashboard", icon: LayoutDashboard },
    { href: "/academy/my-learning", label: "My Learning", icon: BookOpen },
    { href: "/academy/ecosystem", label: "Training Ecosystem", icon: Library },
    { href: "/academy/management", label: "Management", icon: Users },
  ];

  async function handleSignOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.href = "/sign-in";
  }

  return (
    <div className="anav-right">
      {/* Nav links */}
      <nav className="anav-links">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`anav-link${pathname === href || (href !== "/academy" && pathname.startsWith(href)) ? " anav-link--active" : ""}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* User chip */}
      {user ? (
        <div className="anav-user" ref={dropRef}>
          <button className="anav-avatar-btn" onClick={() => setOpen(v => !v)}>
            <div className="anav-avatar">{initials}</div>
            <div className="anav-user-info">
              <span className="anav-user-name">{user.name || user.email}</span>
              <span className="anav-user-email">{user.email}</span>
            </div>
            <ChevronDown size={14} className={`anav-chevron${open ? " anav-chevron--open" : ""}`} />
          </button>

          {open && (
            <div className="anav-dropdown">
              <div className="anav-dropdown-header">
                <div className="anav-avatar anav-avatar--lg">{initials}</div>
                <div>
                  <p className="anav-dd-name">{user.name}</p>
                  <p className="anav-dd-email">{user.email}</p>
                </div>
              </div>
              <div className="anav-dropdown-divider" />
              <Link href="/academy/account" className="anav-dd-item" onClick={() => setOpen(false)}>
                <User size={14} /> Account Settings
              </Link>
              <div className="anav-dropdown-divider" />
              <button className="anav-dd-item anav-dd-item--danger" onClick={handleSignOut}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/sign-in" className="anav-signin-btn">Sign In</Link>
      )}

      <style>{`
        .anav-right { display: flex; align-items: center; gap: 8px; }
        .anav-links { display: flex; align-items: center; gap: 4px; margin-right: 8px; }
        .anav-link {
          text-decoration: none; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.7);
          padding: 7px 12px; border-radius: 8px; transition: all 0.15s; white-space: nowrap;
        }
        .anav-link:hover { color: #fff; background: rgba(255,255,255,0.08); }
        .anav-link--active { color: #f0c040; background: rgba(240,192,64,0.12); font-weight: 600; }

        .anav-user { position: relative; }
        .anav-avatar-btn {
          display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15); border-radius: 50px; padding: 5px 14px 5px 5px;
          cursor: pointer; transition: all 0.2s; color: #fff;
        }
        .anav-avatar-btn:hover { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.3); }
        .anav-avatar {
          width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg,#c8a84b,#d4a017);
          display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800;
          color: #07182d; flex-shrink: 0;
        }
        .anav-avatar--lg { width: 40px; height: 40px; font-size: 15px; }
        .anav-user-info { display: flex; flex-direction: column; text-align: left; }
        .anav-user-name { font-size: 13px; font-weight: 600; color: #fff; line-height: 1.2; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .anav-user-email { font-size: 10px; color: rgba(255,255,255,0.5); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .anav-chevron { color: rgba(255,255,255,0.5); transition: transform 0.2s; flex-shrink: 0; }
        .anav-chevron--open { transform: rotate(180deg); }

        .anav-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0; background: #fff; border-radius: 14px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25); min-width: 240px; z-index: 9999;
          border: 1px solid rgba(0,0,0,0.08); overflow: hidden;
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .anav-dropdown-header { display: flex; align-items: center; gap: 12px; padding: 16px; background: #f8fafc; }
        .anav-dropdown-header .anav-avatar { color: #07182d; }
        .anav-dd-name { font-size: 14px; font-weight: 700; color: #07182d; margin: 0 0 2px; }
        .anav-dd-email { font-size: 12px; color: #64748b; margin: 0; }
        .anav-dropdown-divider { height: 1px; background: #f1f5f9; margin: 0; }
        .anav-dd-item {
          display: flex; align-items: center; gap: 10px; padding: 12px 16px; font-size: 13px;
          font-weight: 500; color: #374151; text-decoration: none; cursor: pointer;
          background: none; border: none; width: 100%; transition: background 0.15s;
        }
        .anav-dd-item:hover { background: #f8fafc; color: #07182d; }
        .anav-dd-item--danger { color: #dc2626; }
        .anav-dd-item--danger:hover { background: #fef2f2; }

        .anav-signin-btn {
          padding: 8px 18px; background: linear-gradient(135deg,#c8a84b,#d4a017);
          border-radius: 8px; font-size: 13px; font-weight: 700; color: #07182d;
          text-decoration: none; transition: all 0.2s;
        }
        .anav-signin-btn:hover { opacity: 0.9; }

        @media (max-width: 900px) {
          .anav-links { display: none; }
          .anav-user-info { display: none; }
          .anav-chevron { display: none; }
          .anav-avatar-btn { padding: 5px; border-radius: 50%; }
        }
      `}</style>
    </div>
  );
}
