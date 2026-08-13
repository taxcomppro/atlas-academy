CREATE TABLE IF NOT EXISTS academy_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text UNIQUE NOT NULL,
  tcp_user_id text UNIQUE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'LEARNER' CHECK (role IN ('ERO','PREPARER','LEARNER','ADMIN')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS academy_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_profile_id uuid NOT NULL REFERENCES academy_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE academy_organizations ADD COLUMN IF NOT EXISTS logo_url text;
CREATE TABLE IF NOT EXISTS academy_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES academy_organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  city text,
  state text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);
CREATE TABLE IF NOT EXISTS academy_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES academy_organizations(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES academy_profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('ERO','PREPARER','MANAGER')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, profile_id)
);
ALTER TABLE academy_memberships ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES academy_locations(id);
CREATE TABLE IF NOT EXISTS academy_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_key text UNIQUE NOT NULL,
  title text NOT NULL,
  product_type text NOT NULL CHECK (product_type IN ('COURSE','TOOLKIT','TRAINING','BUNDLE')),
  active boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS academy_training_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES academy_products(id),
  version_key text NOT NULL,
  title text NOT NULL,
  pass_mark integer NOT NULL DEFAULT 80,
  max_attempts integer NOT NULL DEFAULT 2,
  required_watch_percent integer NOT NULL DEFAULT 90,
  acknowledgement_text text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, version_key)
);
CREATE TABLE IF NOT EXISTS academy_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES academy_organizations(id),
  product_id uuid NOT NULL REFERENCES academy_products(id),
  purchaser_profile_id uuid NOT NULL REFERENCES academy_profiles(id),
  stripe_session_id text UNIQUE,
  seats_purchased integer NOT NULL CHECK (seats_purchased >= 0),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','EXPIRED','REVOKED','REFUNDED')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS academy_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES academy_organizations(id) ON DELETE CASCADE,
  license_id uuid NOT NULL REFERENCES academy_licenses(id) ON DELETE CASCADE,
  invited_by_profile_id uuid NOT NULL REFERENCES academy_profiles(id),
  full_name text NOT NULL,
  email text NOT NULL,
  token text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'SENT' CHECK (status IN ('SENT','ACCEPTED','EXPIRED','REVOKED')),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE academy_invitations ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'PREPARER';
ALTER TABLE academy_invitations ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES academy_locations(id);
CREATE TABLE IF NOT EXISTS academy_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id uuid NOT NULL REFERENCES academy_licenses(id) ON DELETE CASCADE,
  training_version_id uuid NOT NULL REFERENCES academy_training_versions(id),
  profile_id uuid REFERENCES academy_profiles(id),
  invitation_id uuid REFERENCES academy_invitations(id),
  status text NOT NULL DEFAULT 'INVITATION_SENT' CHECK (status IN ('INVITATION_SENT','REGISTERED','TRAINING_STARTED','VIDEO_COMPLETED','ASSESSMENT_REQUIRED','FAILED_RETAKE_REQUIRED','PASSED','TRAINING_COMPLETED','ACCESS_REVOKED')),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (license_id, profile_id, training_version_id)
);
ALTER TABLE academy_assignments ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES academy_locations(id);
CREATE TABLE IF NOT EXISTS academy_video_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid UNIQUE NOT NULL REFERENCES academy_assignments(id) ON DELETE CASCADE,
  watched_percent integer NOT NULL DEFAULT 0,
  furthest_seconds integer NOT NULL DEFAULT 0,
  position_seconds integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS academy_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_version_id uuid NOT NULL REFERENCES academy_training_versions(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  options jsonb NOT NULL,
  correct_option integer NOT NULL,
  explanation text,
  active boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS academy_assessment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES academy_assignments(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL,
  question_ids jsonb NOT NULL,
  answers jsonb,
  score integer,
  passed boolean,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (assignment_id, attempt_number)
);
CREATE TABLE IF NOT EXISTS academy_acknowledgements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid UNIQUE NOT NULL REFERENCES academy_assignments(id) ON DELETE CASCADE,
  statement_hash text NOT NULL,
  signer_name text NOT NULL,
  signer_ip text,
  user_agent text,
  signed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS academy_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid UNIQUE NOT NULL REFERENCES academy_assignments(id) ON DELETE CASCADE,
  certificate_number text UNIQUE NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','REVOKED'))
);
CREATE TABLE IF NOT EXISTS academy_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES academy_organizations(id),
  actor_profile_id uuid REFERENCES academy_profiles(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS academy_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES academy_assignments(id) ON DELETE CASCADE,
  reminder_type text NOT NULL DEFAULT 'TRAINING_INCOMPLETE',
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED','READY','SENT','CANCELLED')),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS academy_learning_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_version_id uuid NOT NULL REFERENCES academy_training_versions(id) ON DELETE CASCADE,
  module_key text NOT NULL,
  title text NOT NULL,
  description text,
  position integer NOT NULL DEFAULT 1,
  UNIQUE (training_version_id, module_key)
);
CREATE TABLE IF NOT EXISTS academy_learning_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES academy_learning_modules(id) ON DELETE CASCADE,
  lesson_key text NOT NULL,
  title text NOT NULL,
  lesson_type text NOT NULL CHECK (lesson_type IN ('VIDEO','READING','EXERCISE','ASSESSMENT','DOWNLOAD')),
  duration_minutes integer NOT NULL DEFAULT 10,
  content jsonb,
  position integer NOT NULL DEFAULT 1,
  UNIQUE (module_id, lesson_key)
);
CREATE TABLE IF NOT EXISTS academy_exercise_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES academy_learning_lessons(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES academy_profiles(id) ON DELETE CASCADE,
  selected_option integer NOT NULL,
  correct boolean NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, profile_id)
);
CREATE TABLE IF NOT EXISTS academy_course_day_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES academy_profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES academy_products(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number BETWEEN 1 AND 30),
  reflection text,
  status text NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS','COMPLETED')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, product_id, day_number)
);
ALTER TABLE academy_profiles DROP CONSTRAINT IF EXISTS academy_profiles_role_check;
ALTER TABLE academy_profiles ADD CONSTRAINT academy_profiles_role_check CHECK (role IN ('ERO','PREPARER','LEARNER','MANAGER','ADMIN'));
INSERT INTO academy_locations (organization_id,name)
SELECT id,'Main Office' FROM academy_organizations
ON CONFLICT (organization_id,name) DO NOTHING;
CREATE INDEX IF NOT EXISTS idx_membership_profile ON academy_memberships(profile_id);
CREATE INDEX IF NOT EXISTS idx_license_org ON academy_licenses(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_invitation_email ON academy_invitations(lower(email), status);
CREATE INDEX IF NOT EXISTS idx_assignment_profile ON academy_assignments(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_org_date ON academy_audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_location_org ON academy_locations(organization_id, active);
CREATE INDEX IF NOT EXISTS idx_reminder_schedule ON academy_reminders(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_learning_module_version ON academy_learning_modules(training_version_id, position);
CREATE INDEX IF NOT EXISTS idx_learning_lesson_module ON academy_learning_lessons(module_id, position);
CREATE INDEX IF NOT EXISTS idx_exercise_profile ON academy_exercise_submissions(profile_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_day_profile ON academy_course_day_progress(profile_id, product_id, day_number);
ALTER TABLE academy_licenses DROP CONSTRAINT IF EXISTS academy_licenses_seats_purchased_check;
ALTER TABLE academy_licenses ADD CONSTRAINT academy_licenses_seats_purchased_check CHECK (seats_purchased >= 0);
