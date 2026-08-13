import Image from "next/image";
import Link from "next/link";
import { getDashboard, requireProfile } from "@/lib/academy";
import { EroDashboard } from "./ero-dashboard";
import { LearnerDashboard } from "./learner-dashboard";

export const dynamic = "force-dynamic";

export default async function Academy() {
  const profile = await requireProfile();
  const data = await getDashboard(profile);
  const isManager =
    data.membership?.role === "ERO" || data.membership?.role === "MANAGER";

  return (
    <main className="academy-shell">
      <div className="integration-notice">Connected securely through Tax Compliance Pro</div>
      <header className="academy-nav">
        <Image
          src="/assets/Atlas_Academy_Logo.png"
          alt="Atlas Academy"
          width={126}
          height={84}
          className="header-academy-logo"
        />
        <nav>
          <Link href="/academy">Dashboard</Link>
          <Link href="/academy/my-learning">My Learning</Link>
          {isManager && (
            <Link href="/academy#purchased-courses">Purchased Products</Link>
          )}
          <Link href="/academy/ecosystem">Training Ecosystem</Link>
          {isManager && <Link href="/academy/management">Training Management</Link>}
          <Link href="/academy/account">Manage Account</Link>
        </nav>
        <div className="user-chip">
          <span>
            <b>{profile.full_name}</b>
            <small>{profile.role}</small>
          </span>
          <Link href="/api/auth/sign-out">Sign out</Link>
        </div>
      </header>
      {!data.membership ? (
        <SetupCard />
      ) : isManager ? (
        <EroDashboard data={data} />
      ) : (
        <LearnerDashboard data={data} />
      )}
    </main>
  );
}

function SetupCard() {
  return (
    <section className="setup-state">
      <p className="eyebrow">PROFILE READY</p>
      <h1>Your Academy profile is connected.</h1>
      <p>
        Your Tax Compliance Pro profile is connected. Create your ERO Training
        Center to begin managing products, seats, and staff training.
      </p>
      <form action="/api/academy/demo/setup" method="post">
        <button className="gold">Create sample Training Center</button>
      </form>
    </section>
  );
}
