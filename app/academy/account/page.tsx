import Link from "next/link";
import Image from "next/image";
import { getDashboard, requireProfile } from "@/lib/academy";
import { updateAcademyAccount, uploadOfficeLogo } from "./actions";
import { ProfilePhotoForm } from "./profile-photo-form";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    error?: string;
    logoSaved?: string;
    logoError?: string;
  }>;
}) {
  const profile = await requireProfile();
  const data = await getDashboard(profile);
  const params = await searchParams;
  const canManageBusiness =
    data.membership?.role === "ERO" || data.membership?.role === "MANAGER";

  return (
    <main className="account-page">
      <div className="account-header">
        <Link href="/academy">← Academy Dashboard</Link>
        <p className="eyebrow">MANAGE ACCOUNT</p>
        <h1>Profile and business details</h1>
        <p>
          Keep the name shown on your Academy dashboard, training records, and
          certificates accurate.
        </p>
      </div>

      <div className="account-layout">
        <form action={updateAcademyAccount} className="account-form">
          {params.saved === "1" && (
            <div className="save-message">Your account details were saved.</div>
          )}
          {params.error && (
            <div className="error-message">
              Please review the highlighted account information.
            </div>
          )}

          <ProfilePhotoForm />

          <section>
            <p className="eyebrow">PERSONAL PROFILE</p>
            <h2>Your information</h2>
            <label>
              Full name
              <input
                name="fullName"
                defaultValue={profile.full_name}
                minLength={2}
                maxLength={100}
                autoComplete="name"
                required
              />
              <small>
                This name appears on your learning records and certificates.
              </small>
            </label>
            <label>
              Email address
              <input value={profile.email} readOnly aria-readonly="true" />
              <small>
                Email changes will be managed through Tax Compliance Pro after
                the final account connection.
              </small>
            </label>
          </section>

          <section>
            <p className="eyebrow">BUSINESS PROFILE</p>
            <h2>Office information</h2>
            <label>
              Business or office name
              <input
                name="businessName"
                defaultValue={data.membership?.organization_name || ""}
                minLength={2}
                maxLength={140}
                autoComplete="organization"
                readOnly={!canManageBusiness}
              />
              <small>
                {canManageBusiness
                  ? "This name appears on your ERO dashboard and staff invitations."
                  : "Only the ERO or an office manager can change this business name."}
              </small>
            </label>
          </section>

          <button className="gold account-save" type="submit">
            Save Account Changes
          </button>
        </form>

        {canManageBusiness && (
          <form action={uploadOfficeLogo} className="logo-upload-card">
            <p className="eyebrow">OFFICE BRANDING</p>
            <h3>Business logo</h3>
            {data.membership?.organization_logo_url ? (
              <div className="logo-preview">
                <Image
                  src={data.membership.organization_logo_url}
                  alt={`${data.membership.organization_name} logo`}
                  width={220}
                  height={120}
                  sizes="220px"
                />
              </div>
            ) : (
              <div className="logo-preview empty-logo">No office logo yet</div>
            )}
            {params.logoSaved === "1" && (
              <div className="save-message">Your office logo was saved.</div>
            )}
            {params.logoError && (
              <div className="error-message">
                Choose a PNG, JPG, or WebP logo smaller than 1 MB.
              </div>
            )}
            <label>
              Select logo file
              <input
                name="logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                required
              />
              <small>PNG, JPG, or WebP · maximum 1 MB</small>
            </label>
            <button className="outline-button upload-button" type="submit">
              Upload Logo
            </button>
            <small>
              The saved logo appears on this office&apos;s ERO and staff dashboards.
            </small>
          </form>
        )}

        <aside className="account-help">
          <p className="eyebrow">FINAL CONNECTION</p>
          <h3>One profile across both systems</h3>
          <p>
            In production, Tax Compliance Pro remains the primary member
            account. Approved changes will synchronize with Atlas Academy so the
            member does not maintain conflicting profiles.
          </p>
        </aside>
      </div>
    </main>
  );
}
