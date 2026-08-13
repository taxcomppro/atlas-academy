import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type PurchaseGrant = {
  eventId: string;
  tcpUserId: string;
  email: string;
  fullName: string;
  businessName?: string;
  productKey: string;
  productTitle: string;
  productType: "COURSE" | "TOOLKIT" | "TRAINING" | "BUNDLE";
  staffSeats: number;
};

function authorized(request: Request) {
  const expected = process.env.TCP_ACADEMY_INTEGRATION_TOKEN;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || !supplied) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}

function isGrant(value: unknown): value is PurchaseGrant {
  if (!value || typeof value !== "object") return false;
  const grant = value as Partial<PurchaseGrant>;
  return Boolean(
    grant.eventId &&
      grant.tcpUserId &&
      /^\S+@\S+\.\S+$/.test(grant.email ?? "") &&
      grant.fullName &&
      grant.productKey &&
      grant.productTitle &&
      ["COURSE", "TOOLKIT", "TRAINING", "BUNDLE"].includes(grant.productType ?? "") &&
      Number.isInteger(grant.staffSeats) &&
      (grant.staffSeats ?? -1) >= 0
  );
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isGrant(body)) {
    return NextResponse.json({ error: "Invalid purchase grant" }, { status: 422 });
  }

  const sql = db();
  const email = body.email.trim().toLowerCase();

  const existing = await sql`
    SELECT id FROM academy_licenses WHERE stripe_session_id=${body.eventId} LIMIT 1
  `;
  if (existing[0]) {
    return NextResponse.json({ success: true, duplicate: true, licenseId: existing[0].id });
  }

  let [profile] = await sql`
    SELECT * FROM academy_profiles
    WHERE tcp_user_id=${body.tcpUserId} OR lower(email)=lower(${email})
    ORDER BY CASE WHEN tcp_user_id=${body.tcpUserId} THEN 0 ELSE 1 END
    LIMIT 1
  `;

  if (!profile) {
    [profile] = await sql`
      INSERT INTO academy_profiles (clerk_user_id,tcp_user_id,email,full_name,role)
      VALUES (${`tcp:${body.tcpUserId}`},${body.tcpUserId},${email},${body.fullName},'ERO')
      RETURNING *
    `;
  } else {
    [profile] = await sql`
      UPDATE academy_profiles
      SET tcp_user_id=${body.tcpUserId},email=${email},full_name=${body.fullName},
          role=CASE WHEN role='LEARNER' THEN 'ERO' ELSE role END,updated_at=now()
      WHERE id=${profile.id}
      RETURNING *
    `;
  }

  let [organization] = await sql`
    SELECT o.* FROM academy_organizations o
    JOIN academy_memberships m ON m.organization_id=o.id
    WHERE m.profile_id=${profile.id} AND m.role='ERO'
    ORDER BY m.joined_at LIMIT 1
  `;
  if (!organization) {
    [organization] = await sql`
      INSERT INTO academy_organizations (name,owner_profile_id)
      VALUES (${body.businessName?.trim() || `${body.fullName}'s Tax Office`},${profile.id})
      RETURNING *
    `;
    await sql`
      INSERT INTO academy_memberships (organization_id,profile_id,role)
      VALUES (${organization.id},${profile.id},'ERO') ON CONFLICT DO NOTHING
    `;
    await sql`
      INSERT INTO academy_locations (organization_id,name)
      VALUES (${organization.id},'Main Office') ON CONFLICT (organization_id,name) DO NOTHING
    `;
  }

  const [product] = await sql`
    INSERT INTO academy_products (product_key,title,product_type,active)
    VALUES (${body.productKey},${body.productTitle},${body.productType},true)
    ON CONFLICT (product_key) DO UPDATE
      SET title=EXCLUDED.title,product_type=EXCLUDED.product_type,active=true
    RETURNING id
  `;

  const [license] = await sql`
    INSERT INTO academy_licenses
      (organization_id,product_id,purchaser_profile_id,stripe_session_id,seats_purchased,status)
    VALUES
      (${organization.id},${product.id},${profile.id},${body.eventId},${body.staffSeats},'ACTIVE')
    RETURNING id
  `;

  await sql`
    INSERT INTO academy_audit_logs
      (organization_id,actor_profile_id,action,entity_type,entity_id,metadata)
    VALUES
      (${organization.id},${profile.id},'TCP_PURCHASE_GRANTED','License',${license.id},
       ${JSON.stringify({ tcpUserId: body.tcpUserId, productKey: body.productKey, staffSeats: body.staffSeats })}::jsonb)
  `;

  return NextResponse.json({ success: true, duplicate: false, licenseId: license.id }, { status: 201 });
}
