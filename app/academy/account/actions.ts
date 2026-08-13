"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { del, put } from "@vercel/blob";
import { requireProfile } from "@/lib/academy";
import { db } from "@/lib/db";

export async function updateAcademyAccount(formData: FormData) {
  const profile = await requireProfile();
  const fullName = String(formData.get("fullName") || "")
    .trim()
    .replace(/\s+/g, " ");
  const businessName = String(formData.get("businessName") || "")
    .trim()
    .replace(/\s+/g, " ");

  if (fullName.length < 2 || fullName.length > 100) {
    redirect("/academy/account?error=name");
  }
  if (businessName && (businessName.length < 2 || businessName.length > 140)) {
    redirect("/academy/account?error=business");
  }

  const sql = db();
  await sql`UPDATE academy_profiles SET full_name=${fullName},updated_at=now() WHERE id=${profile.id}`;

  const [membership] = await sql`SELECT m.organization_id,m.role,o.owner_profile_id
    FROM academy_memberships m
    JOIN academy_organizations o ON o.id=m.organization_id
    WHERE m.profile_id=${profile.id}
    ORDER BY m.joined_at
    LIMIT 1`;

  if (
    membership &&
    businessName &&
    (membership.role === "ERO" ||
      membership.role === "MANAGER" ||
      membership.owner_profile_id === profile.id)
  ) {
    await sql`UPDATE academy_organizations SET name=${businessName} WHERE id=${membership.organization_id}`;
    await sql`INSERT INTO academy_audit_logs
      (organization_id,actor_profile_id,action,entity_type,entity_id,metadata)
      VALUES (${membership.organization_id},${profile.id},'ACCOUNT_PROFILE_UPDATED','Profile',${profile.id},${JSON.stringify({ fullName, businessName })}::jsonb)`;
  }

  redirect("/academy/account?saved=1");
}

export async function uploadOfficeLogo(formData: FormData) {
  const profile = await requireProfile();
  const logo = formData.get("logo");
  if (!(logo instanceof File) || logo.size === 0) {
    redirect("/academy/account?logoError=missing");
  }

  const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
  if (!allowedTypes.has(logo.type) || logo.size > 1024 * 1024) {
    redirect("/academy/account?logoError=format");
  }

  const sql = db();
  const [membership] = await sql`SELECT m.organization_id,m.role,o.owner_profile_id,o.logo_url
    FROM academy_memberships m
    JOIN academy_organizations o ON o.id=m.organization_id
    WHERE m.profile_id=${profile.id}
    ORDER BY m.joined_at
    LIMIT 1`;

  if (
    !membership ||
    !(
      membership.role === "ERO" ||
      membership.role === "MANAGER" ||
      membership.owner_profile_id === profile.id
    )
  ) {
    redirect("/academy/account?logoError=permission");
  }

  const extension =
    logo.type === "image/png" ? "png" : logo.type === "image/webp" ? "webp" : "jpg";
  const uploaded = await put(
    `office-logos/${membership.organization_id}/logo.${extension}`,
    logo,
    { access: "public", addRandomSuffix: true },
  );

  await sql`UPDATE academy_organizations SET logo_url=${uploaded.url} WHERE id=${membership.organization_id}`;
  await sql`INSERT INTO academy_audit_logs
    (organization_id,actor_profile_id,action,entity_type,entity_id,metadata)
    VALUES (${membership.organization_id},${profile.id},'OFFICE_LOGO_UPDATED','Organization',${membership.organization_id},${JSON.stringify({ logoUrl: uploaded.url })}::jsonb)`;

  if (
    membership.logo_url &&
    String(membership.logo_url).includes("blob.vercel-storage.com")
  ) {
    await del(membership.logo_url).catch(() => undefined);
  }

  revalidatePath("/academy");
  revalidatePath("/academy/account");
  redirect("/academy/account?logoSaved=1");
}
