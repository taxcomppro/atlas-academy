"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/academy";
import { db } from "@/lib/db";

async function requireManager() {
  const profile = await requireProfile();
  const sql = db();
  const [membership] = await sql`SELECT * FROM academy_memberships WHERE profile_id=${profile.id} AND role IN ('ERO','MANAGER') LIMIT 1`;
  if (!membership) throw new Error("ERO_ACCESS_REQUIRED");
  return { profile, membership, sql };
}

export async function createOfficeLocation(formData: FormData) {
  const { profile, membership, sql } = await requireManager();
  const name = String(formData.get("name") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim().toUpperCase();
  if (name.length < 2) redirect("/academy/management?error=location");
  const [location] = await sql`INSERT INTO academy_locations (organization_id,name,city,state) VALUES (${membership.organization_id},${name},${city || null},${state || null}) ON CONFLICT (organization_id,name) DO UPDATE SET city=EXCLUDED.city,state=EXCLUDED.state,active=true RETURNING id`;
  await sql`INSERT INTO academy_audit_logs (organization_id,actor_profile_id,action,entity_type,entity_id) VALUES (${membership.organization_id},${profile.id},'OFFICE_LOCATION_SAVED','Location',${location.id})`;
  revalidatePath("/academy/management");
  redirect("/academy/management?saved=location");
}

export async function inviteComplianceManager(formData: FormData) {
  const { profile, membership, sql } = await requireManager();
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const locationId = String(formData.get("locationId") || "");
  if (!fullName || !/^\S+@\S+\.\S+$/.test(email)) redirect("/academy/management?error=manager");
  const [license] = await sql`SELECT id FROM academy_licenses WHERE organization_id=${membership.organization_id} AND status='ACTIVE' ORDER BY created_at LIMIT 1`;
  if (!license) redirect("/academy/management?error=license");
  const [location] = await sql`SELECT id FROM academy_locations WHERE id=${locationId} AND organization_id=${membership.organization_id} AND active=true`;
  if (!location) redirect("/academy/management?error=location");
  const token = crypto.randomBytes(24).toString("base64url");
  const [invitation] = await sql`INSERT INTO academy_invitations (organization_id,license_id,invited_by_profile_id,full_name,email,token,expires_at,role,location_id) VALUES (${membership.organization_id},${license.id},${profile.id},${fullName},${email},${token},now()+interval '14 days','MANAGER',${location.id}) RETURNING id`;
  await sql`INSERT INTO academy_audit_logs (organization_id,actor_profile_id,action,entity_type,entity_id,metadata) VALUES (${membership.organization_id},${profile.id},'COMPLIANCE_MANAGER_INVITED','Invitation',${invitation.id},${JSON.stringify({ email, locationId })}::jsonb)`;
  redirect(`/academy/management?managerInvite=${encodeURIComponent(`/invite/${token}`)}`);
}

export async function revokeSeat(formData: FormData) {
  const { profile, membership, sql } = await requireManager();
  const assignmentId = String(formData.get("assignmentId") || "");
  const [assignment] = await sql`SELECT a.id,a.status,a.invitation_id FROM academy_assignments a JOIN academy_licenses lic ON lic.id=a.license_id WHERE a.id=${assignmentId} AND lic.organization_id=${membership.organization_id}`;
  if (!assignment || assignment.status === "TRAINING_COMPLETED") redirect("/academy/management?error=revoke");
  await sql`UPDATE academy_assignments SET status='ACCESS_REVOKED' WHERE id=${assignment.id}`;
  await sql`UPDATE academy_invitations SET status='REVOKED' WHERE id=${assignment.invitation_id} AND status='SENT'`;
  await sql`UPDATE academy_reminders SET status='CANCELLED' WHERE assignment_id=${assignment.id} AND status IN ('SCHEDULED','READY')`;
  await sql`INSERT INTO academy_audit_logs (organization_id,actor_profile_id,action,entity_type,entity_id) VALUES (${membership.organization_id},${profile.id},'SEAT_ACCESS_REVOKED','Assignment',${assignment.id})`;
  revalidatePath("/academy");
  revalidatePath("/academy/management");
  redirect("/academy/management?saved=revoke");
}

export async function logReminder(formData: FormData) {
  const { profile, membership, sql } = await requireManager();
  const assignmentId = String(formData.get("assignmentId") || "");
  const [assignment] = await sql`SELECT a.id FROM academy_assignments a JOIN academy_licenses lic ON lic.id=a.license_id WHERE a.id=${assignmentId} AND lic.organization_id=${membership.organization_id} AND a.status NOT IN ('TRAINING_COMPLETED','ACCESS_REVOKED')`;
  if (!assignment) redirect("/academy/management?error=reminder");
  const [reminder] = await sql`INSERT INTO academy_reminders (assignment_id,scheduled_for,status,sent_at) VALUES (${assignment.id},now(),'SENT',now()) RETURNING id`;
  await sql`INSERT INTO academy_audit_logs (organization_id,actor_profile_id,action,entity_type,entity_id) VALUES (${membership.organization_id},${profile.id},'TRAINING_REMINDER_RECORDED','Reminder',${reminder.id})`;
  revalidatePath("/academy/management");
  redirect("/academy/management?saved=reminder");
}
