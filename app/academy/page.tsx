import { getDashboard, requireProfile } from "@/lib/academy";
import { EroDashboard } from "./ero-dashboard";
import { LearnerDashboard } from "./learner-dashboard";

export const dynamic = "force-dynamic";

export default async function Academy() {
  const profile = await requireProfile();
  const data = await getDashboard(profile);
  const isManager =
    data.membership?.role === "ERO" || data.membership?.role === "MANAGER";

  return (
    <main>
      {!data.membership ? (
        <SetupCard />
      ) : isManager ? (
        <EroDashboard data={data} />
      ) : (
        <LearnerDashboard data={data} />
      )}
    </main>
  );
}

function SetupCard() {
  return (
    <section className="setup-state">
      <p className="eyebrow">PROFILE READY</p>
      <h1>Your Academy profile is connected.</h1>
      <p>
        Your Tax Compliance Pro profile is connected. Create your ERO Training
        Center to begin managing products, seats, and staff training.
      </p>
      <form action="/api/academy/demo/setup" method="post">
        <button className="gold">Create sample Training Center</button>
      </form>
    </section>
  );
}
