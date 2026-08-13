import Link from "next/link";
import Image from "next/image";

export function LearnerDashboard({ data }: { data: any }) {
  const assignment = data.assignment;
  if (!assignment) {
    return (
      <section className="setup-state">
        <h1>No training assigned</h1>
        <p>Your ERO&apos;s assignments will appear here.</p>
        <Link className="outline-button" href="/academy/ecosystem">
          View Training Ecosystem
        </Link>
      </section>
    );
  }
  const passed = (data.attempts || []).some((attempt: any) => attempt.passed);
  return (
    <>
      <section className="dashboard-hero learner" id="my-learning">
        <div className="office-identity">
          {assignment.organization_logo_url && (
            <div className="office-logo">
              <Image
                src={assignment.organization_logo_url}
                alt={`${assignment.organization_name} logo`}
                width={150}
                height={82}
                sizes="150px"
              />
            </div>
          )}
          <div>
          <p className="eyebrow">MY ASSIGNED TRAINING</p>
          <h1>{assignment.training_title}</h1>
          <p>Assigned by {assignment.organization_name}</p>
          </div>
        </div>
        <span className="status-large">
          {assignment.status.replaceAll("_", " ")}
        </span>
      </section>
      <section className="training-steps">
        <Step
          n="01"
          title="Training video"
          status={
            assignment.watched_percent >= assignment.required_watch_percent
              ? "Complete"
              : `${assignment.watched_percent}% watched`
          }
          href="/academy/training"
        />
        <Step
          n="02"
          title="Final assessment"
          status={
            passed
              ? "Passed"
              : `${data.attempts?.length || 0} of ${assignment.max_attempts} attempts`
          }
          href="/academy/assessment"
        />
        <Step
          n="03"
          title="Acknowledgment"
          status={assignment.signed_at ? "Signed" : "Required after passing"}
          href="/academy/acknowledgement"
        />
        <Step
          n="04"
          title="Certificate"
          status={assignment.certificate_number ? "Issued" : "Pending"}
          href={
            assignment.certificate_number
              ? `/certificate/${assignment.certificate_number}`
              : "#"
          }
        />
      </section>
    </>
  );
}

function Step({
  n,
  title,
  status,
  href,
}: {
  n: string;
  title: string;
  status: string;
  href: string;
}) {
  return (
    <Link className="step-card" href={href}>
      <span>{n}</span>
      <div>
        <h3>{title}</h3>
        <p>{status}</p>
      </div>
      <b>→</b>
    </Link>
  );
}
