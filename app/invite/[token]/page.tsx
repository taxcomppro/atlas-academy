import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Invite({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [invitation] = await db()`SELECT i.full_name,i.email,i.status,i.expires_at,i.role,o.name,
      p.title AS product_title,loc.name AS location_name
    FROM academy_invitations i
    JOIN academy_organizations o ON o.id=i.organization_id
    JOIN academy_licenses l ON l.id=i.license_id
    JOIN academy_products p ON p.id=l.product_id
    LEFT JOIN academy_locations loc ON loc.id=i.location_id
    WHERE i.token=${token}`;
  if (!invitation) notFound();
  const isManager = invitation.role === "MANAGER";

  return (
    <main className="invite-page">
      <div className="invite-card">
        <p className="eyebrow">
          {isManager ? "COMPLIANCE MANAGER INVITATION" : "STAFF TRAINING INVITATION"}
        </p>
        <h1>{invitation.name} invited you to Atlas Academy.</h1>
        {isManager ? (
          <p>
            You have been invited to help manage staff training for <b>{invitation.location_name || "all office locations"}</b>.
            You will use your own Tax Compliance Pro profile to access the Academy.
          </p>
        ) : (
          <p>
            Your seat is for <b>{invitation.product_title}</b>. Every preparer must
            have an individual Tax Compliance Pro profile so training, assessments,
            acknowledgments, and certificates belong to the correct person.
          </p>
        )}
        <div className="tcp-flow-note">
          <strong>Final member flow</strong>
          <span>1. Create or sign in to your Tax Compliance Pro profile</span>
          <span>2. Return automatically to this Academy invitation</span>
          <span>{isManager ? "3. Open the Training Management dashboard" : "3. Begin the assigned product training"}</span>
        </div>
        <div className="invite-actions">
          <a className="gold" href="https://www.taxcomppro.com/register?next=/academy-access">Create Tax Compliance Pro Profile</a>
          <a className="ghost" href="https://www.taxcomppro.com/login?next=/academy-access">Sign In</a>
        </div>
      </div>
    </main>
  );
}
