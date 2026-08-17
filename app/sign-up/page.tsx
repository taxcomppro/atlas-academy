"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn, signUp, useSession } from "@/lib/auth-client";
import { Loader2, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  const redirect = searchParams.get("redirect") || "/academy";

  useEffect(() => {
    if (!isPending && session?.user) router.replace(redirect);
  }, [session, isPending, router, redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signUp.email({ name, email, password });
      if ((res as any)?.error) {
        setError((res as any).error.message || "Could not create account.");
      } else {
        // Auto sign-in after registration
        await signIn.email({ email, password });
        router.replace(redirect);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoad(true);
    await signIn.social({ provider: "google", callbackURL: redirect });
  }

  return (
    <div className="academy-auth-page">
      <div className="academy-auth-card">
        <div className="academy-auth-logo">
          <Image src="/assets/Atlas_Academy_Logo.png" alt="Atlas Academy" width={110} height={73} priority />
        </div>

        <h1 className="academy-auth-title">Create your account</h1>
        <p className="academy-auth-sub">Join Atlas Academy — it&apos;s free to start</p>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoad || loading}
          className="academy-auth-google"
        >
          {googleLoad ? (
            <Loader2 className="auth-spinner" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2045c0-.638-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2583h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.6152z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1818l-2.9087-2.2582c-.8064.54-1.8368.8573-3.0477.8573-2.3427 0-4.3282-1.5818-5.0364-3.7091H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
              <path d="M3.9636 10.71c-.18-.54-.2827-1.1168-.2827-1.71s.1027-1.17.2827-1.71V4.9582H.9573C.3477 6.1718 0 7.5477 0 9s.3477 2.8282.9573 4.0418L3.9636 10.71z" fill="#FBBC05"/>
              <path d="M9 3.5791c1.3214 0 2.5077.4541 3.4405 1.346l2.5818-2.5818C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9636 7.29C4.6718 5.1627 6.6573 3.5791 9 3.5791z" fill="#EA4335"/>
            </svg>
          )}
          Sign up with Google
        </button>

        <div className="academy-auth-divider"><span>or create account with email</span></div>

        {error && (
          <div className="academy-auth-error">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        {success && (
          <div className="academy-auth-success">
            <CheckCircle size={14} /> Account created! Signing you in…
          </div>
        )}

        <form onSubmit={handleSubmit} className="academy-auth-form">
          <div className="academy-auth-field">
            <label htmlFor="signup-name">Full name</label>
            <div className="academy-input-wrap">
              <User size={15} className="academy-input-icon" />
              <input id="signup-name" type="text" autoComplete="name" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          </div>

          <div className="academy-auth-field">
            <label htmlFor="signup-email">Email address</label>
            <div className="academy-input-wrap">
              <Mail size={15} className="academy-input-icon" />
              <input id="signup-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="academy-auth-field">
            <label htmlFor="signup-password">Password</label>
            <div className="academy-input-wrap">
              <Lock size={15} className="academy-input-icon" />
              <input id="signup-password" type={showPw ? "text" : "password"} autoComplete="new-password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required />
              <button type="button" className="academy-pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading || googleLoad} className="academy-auth-submit">
            {loading ? <Loader2 className="auth-spinner" /> : "Create Account"}
          </button>
        </form>

        <p className="academy-auth-switch">
          Already have an account?{" "}
          <Link href="/sign-in">Sign in</Link>
        </p>
        <p className="academy-auth-switch" style={{ marginTop: 6 }}>
          <Link href="/" style={{ opacity: 0.5 }}>← Back to Academy home</Link>
        </p>
      </div>

      <style>{`
        .academy-auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#07182d 0%,#0e2a50 100%); padding:24px; font-family:'Inter',sans-serif; }
        .academy-auth-card { background:#fff; border-radius:20px; padding:44px 40px; width:100%; max-width:420px; box-shadow:0 24px 80px rgba(0,0,0,0.35); }
        .academy-auth-logo { text-align:center; margin-bottom:28px; }
        .academy-auth-title { font-family:'Space Grotesk',sans-serif; font-size:1.6rem; font-weight:700; color:#07182d; margin:0 0 6px; text-align:center; }
        .academy-auth-sub { color:#64748b; font-size:0.9rem; text-align:center; margin:0 0 24px; }
        .academy-auth-google { width:100%; display:flex; align-items:center; justify-content:center; gap:10px; padding:12px; border:1.5px solid #e2e8f0; border-radius:12px; background:#fff; font-size:0.9rem; font-weight:600; color:#07182d; cursor:pointer; transition:all 0.2s; }
        .academy-auth-google:hover { background:#f8fafc; border-color:#cbd5e1; }
        .academy-auth-google:disabled { opacity:0.6; cursor:not-allowed; }
        .academy-auth-divider { display:flex; align-items:center; gap:12px; margin:20px 0; color:#94a3b8; font-size:0.8rem; }
        .academy-auth-divider::before,.academy-auth-divider::after { content:''; flex:1; height:1px; background:#e2e8f0; }
        .academy-auth-error { display:flex; align-items:center; gap:7px; background:#fef2f2; border:1px solid #fecaca; color:#dc2626; padding:10px 14px; border-radius:10px; font-size:0.85rem; margin-bottom:14px; }
        .academy-auth-success { display:flex; align-items:center; gap:7px; background:#f0fdf4; border:1px solid #bbf7d0; color:#16a34a; padding:10px 14px; border-radius:10px; font-size:0.85rem; margin-bottom:14px; }
        .academy-auth-form { display:flex; flex-direction:column; gap:16px; }
        .academy-auth-field { display:flex; flex-direction:column; gap:6px; }
        .academy-auth-field label { font-size:0.85rem; font-weight:600; color:#374151; }
        .academy-input-wrap { position:relative; }
        .academy-input-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none; }
        .academy-input-wrap input { width:100%; padding:11px 40px 11px 38px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:0.9rem; color:#07182d; background:#f8fafc; outline:none; transition:border 0.2s; box-sizing:border-box; }
        .academy-input-wrap input:focus { border-color:#c8a84b; background:#fff; }
        .academy-pw-toggle { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; cursor:pointer; padding:2px; }
        .academy-auth-submit { width:100%; padding:13px; background:linear-gradient(135deg,#c8a84b,#d4a017); border:none; border-radius:12px; font-size:0.95rem; font-weight:700; color:#07182d; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s; margin-top:4px; }
        .academy-auth-submit:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(200,168,75,0.4); }
        .academy-auth-submit:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .academy-auth-switch { text-align:center; font-size:0.85rem; color:#64748b; margin:18px 0 0; }
        .academy-auth-switch a { color:#c8a84b; font-weight:600; text-decoration:none; }
        .academy-auth-switch a:hover { text-decoration:underline; }
        .auth-spinner { width:16px; height:16px; animation:spin 1s linear infinite; }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
