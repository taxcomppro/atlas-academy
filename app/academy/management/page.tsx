import Link from "next/link";
import { headers } from "next/headers";
import { getTrainingManagement, requireProfile } from "@/lib/academy";
import {
  createOfficeLocation,
  inviteComplianceManager,
  logReminder,
  revokeSeat,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function TrainingManagement({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    error?: string;
    managerInvite?: string;
  }>;
}) {
  const profile = await requireProfile();
  const data = await getTrainingManagement(profile);
  const params = await searchParams;
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host") || "atlas-academy-phase1.vercel.app";
  const protocol = headerStore.get("x-forwarded-proto") || "https";
  const managerInviteUrl = params.managerInvite
    ? `${protocol}://${host}${params.managerInvite}`
    : "";
  const activeAssignments = data.assignments.filter(
    (item: any) => !["TRAINING_COMPLETED", "ACCESS_REVOKED"].includes(item.status),
  );

  return (
    <main className="management-page">
      <header className="management-header">
        <Link href="/academy">← Academy Dashboard</Link>
        <p className="eyebrow">PHASE 2</p>
        <h1>Training Management</h1>
        <p>
          Manage office locations, compliance managers, staff seats, reminders,
          and annual training versions from one place.
        </p>
      </header>

      {params.saved && (
        <div className="management-message">The training-management change was saved.</div>
      )}
      {params.error && (
        <div className="error-message">That change could not be completed. Review the information and try again.</div>
      )}
      {managerInviteUrl && (
        <div className="manager-invite-result">
          <strong>Compliance manager invitation created</strong>
          <p>Copy this secure preview link. Production email delivery will send it automatically.</p>
          <input readOnly value={managerInviteUrl} />
        </div>
      )}

      <section className="phase2-summary">
        <Summary label="Office locations" value={data.locations.length} />
        <Summary label="Management team" value={data.managers.length} />
        <Summary label="Active staff" value={activeAssignments.length} />
        <Summary label="Scheduled reminders" value={data.reminders.filter((item:any)=>item.status==='SCHEDULED').length} />
      </section>

      <section className="management-grid">
        <article className="management-panel">
          <p className="eyebrow">MULTIPLE LOCATIONS</p>
          <h2>Office Locations</h2>
          <div className="location-list">
            {data.locations.map((location: any) => (
              <div key={location.id}>
                <strong>{location.name}</strong>
                <span>{[location.city, location.state].filter(Boolean).join(", ") || "Location details pending"}</span>
              </div>
            ))}
          </div>
          <form action={createOfficeLocation} className="compact-form">
            <label>Location name<input name="name" placeholder="Downtown Office" required /></label>
            <div className="form-row">
              <label>City<input name="city" /></label>
              <label>State<input name="state" maxLength={2} /></label>
            </div>
            <button className="gold">Add Office Location</button>
          </form>
        </article>

        <article className="management-panel">
          <p className="eyebrow">DELEGATED ACCESS</p>
          <h2>Compliance Managers</h2>
          <div className="manager-list">
            {data.managers.map((manager: any) => (
              <div key={manager.id}>
                <strong>{manager.full_name}</strong>
                <span>{manager.email}</span>
                <small>{manager.role} · {manager.location_name || "All locations"}</small>
              </div>
            ))}
          </div>
          <form action={inviteComplianceManager} className="compact-form">
            <label>Manager name<input name="fullName" required /></label>
            <label>Email address<input name="email" type="email" required /></label>
            <label>Primary location
              <select name="locationId" required>
                {data.locations.map((location:any)=><option key={location.id} value={location.id}>{location.name}</option>)}
              </select>
            </label>
            <button className="gold">Invite Compliance Manager</button>
          </form>
        </article>
      </section>

      <section className="management-panel full-management-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">SEAT CONTROL</p><h2>Assignments and Reminders</h2></div>
          <span className="management-rule">Completed seats remain used for that training year.</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Staff member</th><th>Product</th><th>Location</th><th>Status</th><th>Progress</th><th>Controls</th></tr></thead>
            <tbody>
              {data.assignments.map((assignment:any)=><tr key={assignment.id}>
                <td><b>{assignment.full_name}</b><small>{assignment.email}</small></td>
                <td>{assignment.product_title}</td>
                <td>{assignment.location_name || "Main Office"}</td>
                <td><span className="status-badge">{assignment.status.replaceAll("_"," ")}</span></td>
                <td>{assignment.watched_percent}%</td>
                <td><div className="row-actions">
                  {!['TRAINING_COMPLETED','ACCESS_REVOKED'].includes(assignment.status)&&<form action={logReminder}><input type="hidden" name="assignmentId" value={assignment.id}/><button className="text-button">Record Reminder</button></form>}
                  {!['TRAINING_STARTED','VIDEO_COMPLETED','ASSESSMENT_REQUIRED','PASSED','TRAINING_COMPLETED','ACCESS_REVOKED'].includes(assignment.status)&&<form action={revokeSeat}><input type="hidden" name="assignmentId" value={assignment.id}/><button className="text-button danger-text">Revoke Seat</button></form>}
                </div></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section className="management-grid lower-management-grid">
        <article className="management-panel">
          <p className="eyebrow">ANNUAL HISTORY</p>
          <h2>Training Versions</h2>
          <div className="version-list">
            {data.versions.map((version:any)=><div key={version.id}>
              <span className={version.active?'owned-badge':'available-badge'}>{version.active?'ACTIVE':'ARCHIVED'}</span>
              <strong>{version.title}</strong>
              <small>{version.assignments} assignments</small>
            </div>)}
          </div>
        </article>
        <article className="management-panel">
          <p className="eyebrow">AUTOMATED FOLLOW-UP</p>
          <h2>Reminder Schedule</h2>
          <p className="panel-copy">New invitations automatically receive reminder checkpoints after 3 and 7 days. Delivery will connect to the approved TCP email provider.</p>
          <div className="reminder-list">
            {data.reminders.length?data.reminders.slice(0,8).map((reminder:any)=><div key={reminder.id}><span className="status-badge">{reminder.status}</span><strong>{reminder.full_name}</strong><small>{new Date(reminder.scheduled_for).toLocaleDateString()}</small></div>):<div className="empty-mini">No reminders scheduled yet.</div>}
          </div>
        </article>
      </section>
    </main>
  );
}

function Summary({label,value}:{label:string;value:number}){return <div><strong>{value}</strong><span>{label}</span></div>}
