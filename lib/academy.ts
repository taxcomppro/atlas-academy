// lib/academy.ts
// Uses Better-Auth session + Prisma $queryRaw for academy-specific SQL tables
// (academy_profiles, academy_memberships, etc. are not in the Prisma schema —
//  we query them with $queryRawUnsafe for now)
import { prisma } from "./prisma";
import { requireAcademySession, type AcademyUser } from "./session";

export type AcademyProfile = {
  id: string;
  clerk_user_id: string;
  tcp_user_id: string | null;
  email: string;
  full_name: string;
  role: "ERO" | "PREPARER" | "LEARNER" | "MANAGER" | "ADMIN";
};

// ---------------------------------------------------------------------------
// Internal helper: run raw SQL against the shared Neon DB via Prisma
// ---------------------------------------------------------------------------
async function sql<T = any>(query: string, ...values: any[]): Promise<T[]> {
  return prisma.$queryRawUnsafe(query, ...values) as Promise<T[]>;
}

// ---------------------------------------------------------------------------
// requireProfile — get-or-create academy profile for a Better-Auth user
// ---------------------------------------------------------------------------
export async function requireProfile(): Promise<AcademyProfile> {
  const user = await requireAcademySession();
  const email = user.email.trim().toLowerCase();
  const fullName = user.name || user.email.split("@")[0];
  const betterAuthId = user.id;

  // Try to find existing profile by Better-Auth user id or email
  const existing = await sql<AcademyProfile>(
    `SELECT * FROM academy_profiles
     WHERE clerk_user_id = $1 OR lower(email) = lower($2)
     ORDER BY CASE WHEN clerk_user_id = $1 THEN 0 ELSE 1 END
     LIMIT 1`,
    betterAuthId, email
  );

  if (existing[0]) return existing[0];

  // Create new profile
  const created = await sql<AcademyProfile>(
    `INSERT INTO academy_profiles (clerk_user_id, tcp_user_id, email, full_name, role)
     VALUES ($1, NULL, $2, $3, 'LEARNER')
     RETURNING *`,
    betterAuthId, email, fullName
  );
  const profile = created[0];

  // Check for pending invitations
  const invite = (await sql(
    `SELECT * FROM academy_invitations
     WHERE lower(email) = lower($1) AND status = 'SENT' AND expires_at > now()
     ORDER BY created_at DESC LIMIT 1`,
    email
  ))[0];

  if (invite) {
    const inviteRole = invite.role === "MANAGER" ? "MANAGER" : "PREPARER";
    await sql(
      `UPDATE academy_profiles SET role = $1 WHERE id = $2`,
      inviteRole, profile.id
    );
    await sql(
      `INSERT INTO academy_memberships (organization_id, profile_id, role, location_id)
       VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
      invite.organization_id, profile.id, inviteRole, invite.location_id
    );
    await sql(
      `UPDATE academy_invitations SET status = 'ACCEPTED', accepted_at = now() WHERE id = $1`,
      invite.id
    );
    if (inviteRole === "PREPARER") {
      await sql(
        `UPDATE academy_assignments SET profile_id = $1, status = 'REGISTERED' WHERE invitation_id = $2`,
        profile.id, invite.id
      );
    }
    profile.role = inviteRole as AcademyProfile["role"];
  }

  return profile;
}

// ---------------------------------------------------------------------------
// getTrainingManagement — ERO/Manager dashboard
// ---------------------------------------------------------------------------
export async function getTrainingManagement(profile: AcademyProfile) {
  const [membership] = await sql(
    `SELECT m.*, o.name AS organization_name
     FROM academy_memberships m
     JOIN academy_organizations o ON o.id = m.organization_id
     WHERE m.profile_id = $1 AND m.role IN ('ERO','MANAGER')
     LIMIT 1`,
    profile.id
  );
  if (!membership) throw new Error("ERO_ACCESS_REQUIRED");

  const [locations, managers, assignments, versions, reminders] = await Promise.all([
    sql(`SELECT id, name, city, state, active, created_at FROM academy_locations WHERE organization_id = $1 ORDER BY name`, membership.organization_id),
    sql(`SELECT m.id, m.role, p.full_name, p.email, l.name AS location_name, m.joined_at FROM academy_memberships m JOIN academy_profiles p ON p.id = m.profile_id LEFT JOIN academy_locations l ON l.id = m.location_id WHERE m.organization_id = $1 AND m.role IN ('ERO','MANAGER') ORDER BY m.role, m.joined_at`, membership.organization_id),
    sql(`SELECT a.id, a.status, a.assigned_at, a.completed_at, i.full_name, i.email, p.title AS product_title, tv.version_key, l.name AS location_name, COALESCE(v.watched_percent,0) AS watched_percent, c.certificate_number FROM academy_assignments a JOIN academy_licenses lic ON lic.id = a.license_id JOIN academy_products p ON p.id = lic.product_id JOIN academy_training_versions tv ON tv.id = a.training_version_id LEFT JOIN academy_invitations i ON i.id = a.invitation_id LEFT JOIN academy_locations l ON l.id = a.location_id LEFT JOIN academy_video_progress v ON v.assignment_id = a.id LEFT JOIN academy_certificates c ON c.assignment_id = a.id WHERE lic.organization_id = $1 ORDER BY a.assigned_at DESC`, membership.organization_id),
    sql(`SELECT tv.id, tv.version_key, tv.title, tv.active, tv.created_at, p.title AS product_title, (SELECT count(*)::int FROM academy_assignments a WHERE a.training_version_id = tv.id) AS assignments FROM academy_training_versions tv JOIN academy_products p ON p.id = tv.product_id WHERE EXISTS (SELECT 1 FROM academy_licenses lic WHERE lic.organization_id = $1 AND lic.product_id = p.id) ORDER BY tv.created_at DESC`, membership.organization_id),
    sql(`SELECT r.id, r.status, r.scheduled_for, r.sent_at, i.full_name, i.email, p.title AS product_title FROM academy_reminders r JOIN academy_assignments a ON a.id = r.assignment_id JOIN academy_licenses lic ON lic.id = a.license_id JOIN academy_products p ON p.id = lic.product_id LEFT JOIN academy_invitations i ON i.id = a.invitation_id WHERE lic.organization_id = $1 ORDER BY r.scheduled_for DESC LIMIT 30`, membership.organization_id),
  ]);

  return { membership, locations, managers, assignments, versions, reminders };
}

// ---------------------------------------------------------------------------
// getDashboard — learner / ERO dashboard
// ---------------------------------------------------------------------------
export async function getDashboard(profile: AcademyProfile) {
  const [membership] = await sql(
    `SELECT m.*, o.name AS organization_name, o.owner_profile_id, o.logo_url AS organization_logo_url
     FROM academy_memberships m
     JOIN academy_organizations o ON o.id = m.organization_id
     WHERE m.profile_id = $1
     ORDER BY m.joined_at LIMIT 1`,
    profile.id
  );
  if (!membership) return { profile, membership: null };

  if (membership.role === "ERO" || membership.role === "MANAGER") {
    const licenses = await sql(
      `SELECT l.*, p.title, p.product_key, tv.id AS training_version_id, tv.title AS training_title, tv.version_key
       FROM academy_licenses l JOIN academy_products p ON p.id = l.product_id
       LEFT JOIN academy_training_versions tv ON tv.product_id = p.id AND tv.active = true
       WHERE l.organization_id = $1 AND l.status = 'ACTIVE'
       ORDER BY l.created_at DESC`,
      membership.organization_id
    );
    const license = licenses[0];
    const staff = licenses.length ? await sql(
      `SELECT a.id, a.status, a.assigned_at, a.completed_at, i.full_name, i.email, i.status AS invitation_status, p.title AS product_title, loc.name AS location_name, COALESCE(v.watched_percent,0) AS watched_percent, COALESCE((SELECT aa.score FROM academy_assessment_attempts aa WHERE aa.assignment_id = a.id AND aa.completed_at IS NOT NULL ORDER BY aa.attempt_number DESC LIMIT 1),0) AS score, (SELECT count(*)::int FROM academy_assessment_attempts aa WHERE aa.assignment_id = a.id AND aa.completed_at IS NOT NULL) AS attempts, CASE WHEN ack.id IS NULL THEN 'Pending' ELSE 'Signed' END AS acknowledgement_status, CASE WHEN c.id IS NULL THEN 'Pending' ELSE 'Issued' END AS certificate_status, c.certificate_number FROM academy_assignments a JOIN academy_licenses lic ON lic.id = a.license_id JOIN academy_products p ON p.id = lic.product_id LEFT JOIN academy_invitations i ON i.id = a.invitation_id LEFT JOIN academy_locations loc ON loc.id = a.location_id LEFT JOIN academy_video_progress v ON v.assignment_id = a.id LEFT JOIN academy_acknowledgements ack ON ack.assignment_id = a.id LEFT JOIN academy_certificates c ON c.assignment_id = a.id WHERE lic.organization_id = $1 ORDER BY a.assigned_at DESC`,
      membership.organization_id
    ) : [];
    const catalog = await getOrganizationCatalog(membership.organization_id);
    const locations = await sql(
      `SELECT id, name, city, state FROM academy_locations WHERE organization_id = $1 AND active = true ORDER BY name`,
      membership.organization_id
    );
    return { profile, membership, license, licenses, staff, catalog, locations };
  }

  const [assignment] = await sql(
    `SELECT a.*, o.name AS organization_name, o.logo_url AS organization_logo_url, p.title AS product_title, tv.title AS training_title, tv.version_key, tv.pass_mark, tv.max_attempts, tv.required_watch_percent, tv.acknowledgement_text, COALESCE(v.watched_percent,0) AS watched_percent, COALESCE(v.position_seconds,0) AS position_seconds, ack.signed_at, c.certificate_number, c.issued_at FROM academy_assignments a JOIN academy_licenses l ON l.id = a.license_id JOIN academy_organizations o ON o.id = l.organization_id JOIN academy_products p ON p.id = l.product_id JOIN academy_training_versions tv ON tv.id = a.training_version_id LEFT JOIN academy_video_progress v ON v.assignment_id = a.id LEFT JOIN academy_acknowledgements ack ON ack.assignment_id = a.id LEFT JOIN academy_certificates c ON c.assignment_id = a.id WHERE a.profile_id = $1 AND a.status != 'ACCESS_REVOKED' ORDER BY a.assigned_at DESC LIMIT 1`,
    profile.id
  );
  const attempts = assignment ? await sql(
    `SELECT id, attempt_number, score, passed, started_at, completed_at FROM academy_assessment_attempts WHERE assignment_id = $1 ORDER BY attempt_number`,
    assignment.id
  ) : [];
  return { profile, membership, assignment, attempts };
}

// ---------------------------------------------------------------------------
// getOrganizationCatalog — private helper
// ---------------------------------------------------------------------------
async function getOrganizationCatalog(organizationId: string) {
  return sql(
    `SELECT p.product_key, p.title, p.product_type,
       (count(l.id) FILTER (WHERE l.status='ACTIVE') > 0) AS purchased,
       COALESCE(sum(l.seats_purchased) FILTER (WHERE l.status='ACTIVE'),0)::int AS seats_purchased
     FROM academy_products p
     LEFT JOIN academy_licenses l ON l.product_id = p.id AND l.organization_id = $1
     WHERE p.active = true
     GROUP BY p.id, p.product_key, p.title, p.product_type
     ORDER BY purchased DESC, p.title`,
    organizationId
  );
}

// ---------------------------------------------------------------------------
// getCourseLibrary
// ---------------------------------------------------------------------------
export async function getCourseLibrary(profile: AcademyProfile) {
  const [membership] = await sql(
    `SELECT m.*, o.name AS organization_name FROM academy_memberships m JOIN academy_organizations o ON o.id = m.organization_id WHERE m.profile_id = $1 ORDER BY m.joined_at LIMIT 1`,
    profile.id
  );
  if (!membership) {
    const products = await sql(
      `SELECT product_key, title, product_type, false AS purchased, 0::int AS seats_purchased FROM academy_products WHERE active = true ORDER BY title`
    );
    return { membership: null, products };
  }
  return { membership, products: await getOrganizationCatalog(membership.organization_id) };
}

// ---------------------------------------------------------------------------
// getTrainingEcosystem
// ---------------------------------------------------------------------------
export async function getTrainingEcosystem(profile: AcademyProfile) {
  const [membership] = await sql(
    `SELECT m.*, o.name AS organization_name FROM academy_memberships m JOIN academy_organizations o ON o.id = m.organization_id WHERE m.profile_id = $1 ORDER BY m.joined_at LIMIT 1`,
    profile.id
  );

  const ecosystemQuery = membership
    ? `SELECT p.product_key, p.title, p.product_type,
         EXISTS(SELECT 1 FROM academy_licenses lic WHERE lic.organization_id = $1 AND lic.product_id = p.id AND lic.status='ACTIVE') AS purchased,
         tv.version_key, tv.title AS version_title,
         CASE WHEN p.product_key='course:30-day-tax-office-launch' THEN 4 ELSE count(DISTINCT lm.id)::int END AS module_count,
         CASE WHEN p.product_key='course:30-day-tax-office-launch' THEN 30 ELSE count(ll.id)::int END AS lesson_count,
         CASE WHEN p.product_key='course:30-day-tax-office-launch' THEN 30 ELSE count(ll.id) FILTER (WHERE ll.lesson_type='EXERCISE')::int END AS exercise_count
       FROM academy_products p
       LEFT JOIN academy_training_versions tv ON tv.product_id = p.id AND tv.active = true
       LEFT JOIN academy_learning_modules lm ON lm.training_version_id = tv.id
       LEFT JOIN academy_learning_lessons ll ON ll.module_id = lm.id
       WHERE p.active = true
       GROUP BY p.id, p.product_key, p.title, p.product_type, tv.version_key, tv.title
       ORDER BY purchased DESC, p.title`
    : `SELECT p.product_key, p.title, p.product_type, false AS purchased, tv.version_key, tv.title AS version_title,
         CASE WHEN p.product_key='course:30-day-tax-office-launch' THEN 4 ELSE count(DISTINCT lm.id)::int END AS module_count,
         CASE WHEN p.product_key='course:30-day-tax-office-launch' THEN 30 ELSE count(ll.id)::int END AS lesson_count
       FROM academy_products p
       LEFT JOIN academy_training_versions tv ON tv.product_id = p.id AND tv.active = true
       LEFT JOIN academy_learning_modules lm ON lm.training_version_id = tv.id
       LEFT JOIN academy_learning_lessons ll ON ll.module_id = lm.id
       WHERE p.active = true
       GROUP BY p.id, p.product_key, p.title, p.product_type, tv.version_key, tv.title
       ORDER BY p.title`;

  const products = membership
    ? await sql(ecosystemQuery, membership.organization_id)
    : await sql(ecosystemQuery);

  const [completedRow] = await sql(
    `SELECT count(*)::int AS count FROM academy_exercise_submissions WHERE profile_id = $1`,
    profile.id
  );
  return { membership, products, completedExercises: completedRow?.count || 0 };
}

// ---------------------------------------------------------------------------
// getLearningPath
// ---------------------------------------------------------------------------
export async function getLearningPath(profile: AcademyProfile, productKey: string) {
  const [membership] = await sql(
    `SELECT m.*, o.name AS organization_name FROM academy_memberships m JOIN academy_organizations o ON o.id = m.organization_id WHERE m.profile_id = $1 ORDER BY m.joined_at LIMIT 1`,
    profile.id
  );
  const [product] = await sql(
    `SELECT p.id, p.product_key, p.title, p.product_type, tv.id AS training_version_id, tv.version_key, tv.title AS version_title
     FROM academy_products p LEFT JOIN academy_training_versions tv ON tv.product_id = p.id AND tv.active = true
     WHERE p.product_key = $1 AND p.active = true LIMIT 1`,
    productKey
  );
  if (!product) return null;

  const purchased = membership
    ? Boolean((await sql(`SELECT 1 FROM academy_licenses WHERE organization_id = $1 AND product_id = $2 AND status='ACTIVE' LIMIT 1`, membership.organization_id, product.id))[0])
    : false;

  const modules = product.training_version_id ? await sql(
    `SELECT lm.id, lm.title, lm.description, lm.position,
       COALESCE(json_agg(json_build_object('id',ll.id,'title',ll.title,'lesson_type',ll.lesson_type,'duration_minutes',ll.duration_minutes,'position',ll.position,'completed',es.id IS NOT NULL) ORDER BY ll.position) FILTER (WHERE ll.id IS NOT NULL),'[]') AS lessons
     FROM academy_learning_modules lm
     LEFT JOIN academy_learning_lessons ll ON ll.module_id = lm.id
     LEFT JOIN academy_exercise_submissions es ON es.lesson_id = ll.id AND es.profile_id = $1
     WHERE lm.training_version_id = $2
     GROUP BY lm.id ORDER BY lm.position`,
    profile.id, product.training_version_id
  ) : [];

  return { membership, product: { ...product, purchased }, modules };
}

// ---------------------------------------------------------------------------
// getGuidedExercise
// ---------------------------------------------------------------------------
export async function getGuidedExercise(profile: AcademyProfile, lessonId: string) {
  const [membership] = await sql(
    `SELECT * FROM academy_memberships WHERE profile_id = $1 ORDER BY joined_at LIMIT 1`,
    profile.id
  );
  const [exercise] = await sql(
    `SELECT ll.id, ll.title, ll.content, p.id AS product_id, p.product_key, p.title AS product_title, lm.title AS module_title
     FROM academy_learning_lessons ll
     JOIN academy_learning_modules lm ON lm.id = ll.module_id
     JOIN academy_training_versions tv ON tv.id = lm.training_version_id
     JOIN academy_products p ON p.id = tv.product_id
     WHERE ll.id = $1 AND ll.lesson_type = 'EXERCISE' LIMIT 1`,
    lessonId
  );
  if (!exercise) return null;

  const organizationAccess = membership
    ? Boolean((await sql(`SELECT 1 FROM academy_licenses WHERE organization_id = $1 AND product_id = $2 AND status='ACTIVE' LIMIT 1`, membership.organization_id, exercise.product_id))[0])
    : false;
  const assignmentAccess = Boolean((await sql(
    `SELECT 1 FROM academy_assignments a JOIN academy_licenses lic ON lic.id = a.license_id WHERE a.profile_id = $1 AND lic.product_id = $2 AND a.status != 'ACCESS_REVOKED' LIMIT 1`,
    profile.id, exercise.product_id
  ))[0]);
  const [submission] = await sql(
    `SELECT selected_option, correct, completed_at FROM academy_exercise_submissions WHERE lesson_id = $1 AND profile_id = $2`,
    lessonId, profile.id
  );

  return { ...exercise, organization_id: membership?.organization_id || null, purchased: organizationAccess || assignmentAccess, submission };
}

// ---------------------------------------------------------------------------
// getLaunchCourse
// ---------------------------------------------------------------------------
export async function getLaunchCourse(profile: AcademyProfile) {
  const [membership] = await sql(
    `SELECT * FROM academy_memberships WHERE profile_id = $1 ORDER BY joined_at LIMIT 1`,
    profile.id
  );
  const [product] = await sql(
    `SELECT id, product_key, title FROM academy_products WHERE product_key='course:30-day-tax-office-launch' AND active=true LIMIT 1`
  );
  if (!product) return null;

  const organizationAccess = membership
    ? Boolean((await sql(`SELECT 1 FROM academy_licenses WHERE organization_id = $1 AND product_id = $2 AND status='ACTIVE' LIMIT 1`, membership.organization_id, product.id))[0])
    : false;
  const assignmentAccess = Boolean((await sql(
    `SELECT 1 FROM academy_assignments a JOIN academy_licenses lic ON lic.id = a.license_id WHERE a.profile_id = $1 AND lic.product_id = $2 AND a.status != 'ACCESS_REVOKED' LIMIT 1`,
    profile.id, product.id
  ))[0]);

  const progress = await sql(
    `SELECT day_number, status, reflection, completed_at FROM academy_course_day_progress WHERE profile_id = $1 AND product_id = $2 ORDER BY day_number`,
    profile.id, product.id
  );
  return { product, membership, purchased: organizationAccess || assignmentAccess, progress };
}
