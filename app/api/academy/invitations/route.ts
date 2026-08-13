import crypto from "node:crypto";
import { requireProfile } from "@/lib/academy";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const profile = await requireProfile();
  const form = await request.formData();
  const fullName = String(form.get("fullName") || "").trim();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const licenseId = String(form.get("licenseId") || "");
  const locationId = String(form.get("locationId") || "");
  if (!fullName || !/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json({ error: "Enter a valid name and email." }, { status: 422 });
  }

  const sql = db();
  const [membership] = await sql`SELECT * FROM academy_memberships WHERE profile_id=${profile.id} AND role IN ('ERO','MANAGER') LIMIT 1`;
  if (!membership) return Response.json({ error: "ERO access required." }, { status: 403 });

  const [license] = await sql`SELECT lic.* FROM academy_licenses lic JOIN academy_products p ON p.id=lic.product_id WHERE lic.id=${licenseId} AND lic.organization_id=${membership.organization_id} AND lic.status='ACTIVE' AND p.product_key!='course:30-day-tax-office-launch' LIMIT 1`;
  if (!license) return Response.json({ error: "Select an eligible course license." }, { status: 422 });

  const [location] = locationId
    ? await sql`SELECT id FROM academy_locations WHERE id=${locationId} AND organization_id=${membership.organization_id} AND active=true`
    : await sql`SELECT id FROM academy_locations WHERE organization_id=${membership.organization_id} AND active=true ORDER BY created_at LIMIT 1`;
  if (!location) return Response.json({ error: "Select an active office location." }, { status: 422 });

  const [{ used }] = await sql`SELECT count(*)::int AS used FROM academy_assignments WHERE license_id=${license.id} AND status!='ACCESS_REVOKED'`;
  if (used >= license.seats_purchased) {
    return Response.json({ error: "No available staff seats for this course." }, { status: 409 });
  }

  const [version] = await sql`SELECT id FROM academy_training_versions WHERE product_id=${license.product_id} AND active=true LIMIT 1`;
  if (!version) return Response.json({ error: "This course is not ready for staff assignment." }, { status: 409 });

  const token = crypto.randomBytes(24).toString("base64url");
  const [invitation] = await sql`INSERT INTO academy_invitations (organization_id,license_id,invited_by_profile_id,full_name,email,token,expires_at,role,location_id) VALUES (${membership.organization_id},${license.id},${profile.id},${fullName},${email},${token},now()+interval '14 days','PREPARER',${location.id}) RETURNING id`;
  const [assignment] = await sql`INSERT INTO academy_assignments (license_id,training_version_id,invitation_id,status,location_id) VALUES (${license.id},${version.id},${invitation.id},'INVITATION_SENT',${location.id}) RETURNING id`;
  await sql`INSERT INTO academy_reminders (assignment_id,scheduled_for) VALUES (${assignment.id},now()+interval '3 days'),(${assignment.id},now()+interval '7 days')`;
  await sql`INSERT INTO academy_audit_logs (organization_id,actor_profile_id,action,entity_type,entity_id,metadata) VALUES (${membership.organization_id},${profile.id},'STAFF_INVITED','Invitation',${invitation.id},${JSON.stringify({ email, licenseId, locationId: location.id })}::jsonb)`;
  return Response.json({ accepted: true, inviteUrl: `${new URL(request.url).origin}/invite/${token}` });
}
