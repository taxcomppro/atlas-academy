"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  type CatalogProduct,
  presentationFor,
  tcpFeedUrl,
} from "@/lib/catalog";

export function EroDashboard({ data }: { data: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const license = data.license;
  const licenses = data.licenses || [];
  const eligibleLicenses = licenses.filter(
    (item: any) => presentationFor(item.product_key).staffSeatsAvailable,
  );
  const staff = data.staff || [];
  const products: CatalogProduct[] = data.catalog || [];
  const purchased = products.filter((product) => product.purchased);
  const assigned = staff.length;
  const complete = staff.filter(
    (staffMember: any) => staffMember.status === "TRAINING_COMPLETED",
  ).length;

  async function invite(formData: FormData) {
    setBusy(true);
    const response = await fetch("/api/academy/invitations", {
      method: "POST",
      body: formData,
    });
    const body = await response.json();
    setBusy(false);
    if (response.ok) {
      setInviteUrl(body.inviteUrl);
      router.refresh();
    } else {
      alert(body.error);
    }
  }

  return (
    <>
      <section className="dashboard-hero">
        <div className="office-identity">
          {data.membership.organization_logo_url && (
            <div className="office-logo">
              <Image
                src={data.membership.organization_logo_url}
                alt={`${data.membership.organization_name} logo`}
                width={150}
                height={82}
                sizes="150px"
              />
            </div>
          )}
          <div>
          <p className="eyebrow">ERO TRAINING CENTER</p>
          <h1>{data.membership.organization_name}</h1>
          <p>Invite your staff. Track completion. Document your training.</p>
          </div>
        </div>
        <div className="hero-actions">
          <Link className="ghost link-button" href="/academy/management">
            Manage Training
          </Link>
          <button
            className="gold"
            onClick={() => {
              setInviteUrl("");
              setOpen(true);
            }}
          >
            Invite Staff Member
          </button>
          <Link className="danger-button link-button" href={tcpFeedUrl}>
            Buy More Seats
          </Link>
        </div>
      </section>

      <section className="metric-grid">
        <Metric label="Purchased seats" value={license?.seats_purchased || 0} />
        <Metric label="Assigned" value={assigned} />
        <Metric
          label="Available"
          value={Math.max(0, (license?.seats_purchased || 0) - assigned)}
        />
        <Metric label="Completed" value={complete} />
      </section>

      <section className="dashboard-grid">
        <article className="panel wide">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">STAFF PROGRESS</p>
              <h2>{license?.training_title || "Training license pending"}</h2>
            </div>
            <a className="outline-button" href="/api/academy/report">
              Download CSV report
            </a>
          </div>
          {staff.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Staff member</th>
                    <th>Status</th>
                    <th>Video</th>
                    <th>Score</th>
                    <th>Acknowledgment</th>
                    <th>Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((row: any) => (
                    <tr key={row.id}>
                      <td>
                        <b>{row.full_name}</b>
                        <small>{row.email}</small>
                      </td>
                      <td>
                        <span className="status-badge">
                          {row.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td>{row.watched_percent}%</td>
                      <td>{row.score || "—"}</td>
                      <td>{row.acknowledgement_status}</td>
                      <td>{row.certificate_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">
              <h3>No staff assigned yet</h3>
              <p>Invite your first preparer to begin tracking training.</p>
            </div>
          )}
        </article>
        <aside className="panel license-card">
          <p className="eyebrow">ACTIVE LICENSE</p>
          <h3>{license?.title}</h3>
          <strong>{license?.seats_purchased || 0} staff seats</strong>
          <span>Access status: {license?.status}</span>
          <Link className="danger-button link-button center-button" href={tcpFeedUrl}>
            Buy More Seats
          </Link>
        </aside>
      </section>

      <section className="learning-sections">
        <div id="purchased-courses" className="section-heading purchased-heading">
          <div>
            <p className="eyebrow">FIRM ACCESS</p>
            <h2>Purchased Products</h2>
          </div>
          <span>{purchased.length} currently owned</span>
        </div>
        <div className="product-row">
          {purchased.map((product) => (
            <ProductCard key={product.product_key} product={product} />
          ))}
        </div>
        <div className="section-heading purchased-heading">
          <div>
            <p className="eyebrow">SEATS BY PRODUCT</p>
            <h2>Staff Training Seats</h2>
          </div>
          <span>Seats are purchased separately for each eligible product</span>
        </div>
        <div className="seat-product-grid">
          {licenses.map((item: any) => {
            const details = presentationFor(item.product_key);
            if (!details.staffSeatsAvailable) return null;
            return (
              <article className="seat-product-card" key={item.id}>
                <div>
                  <span className="owned-badge">ACTIVE</span>
                  <h3>{item.title}</h3>
                  <p>{item.seats_purchased} staff seats purchased</p>
                </div>
                <Link className="danger-button link-button" href={details.purchaseUrl}>
                  Buy More Seats
                </Link>
              </article>
            );
          })}
        </div>

        <div className="section-heading purchased-heading">
          <div>
            <p className="eyebrow">ATLAS ACADEMY</p>
            <h2>Training Ecosystem</h2>
          </div>
          <span>All Tax Compliance Pro learning paths in one Academy</span>
        </div>
        <div className="ecosystem-dashboard-callout">
          <div>
            <h3>Your connected training ecosystem</h3>
            <p>Explore product learning paths and Atlas-guided exercises across the Tax Compliance Pro product family.</p>
          </div>
          <Link className="gold link-button" href="/academy/ecosystem">Open Training Ecosystem</Link>
        </div>
      </section>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Close invitation dialog"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <p className="eyebrow">ASSIGN A SEAT</p>
            <h2 id="invite-dialog-title">Invite a staff preparer</h2>
            {inviteUrl ? (
              <div className="invite-success">
                <p>
                  Invitation created. Email delivery will be connected in the
                  integration phase. For this preview, copy this secure link:
                </p>
                <input
                  readOnly
                  value={inviteUrl}
                  onFocus={(event) => event.currentTarget.select()}
                />
                <button
                  className="gold"
                  onClick={() => navigator.clipboard.writeText(inviteUrl)}
                >
                  Copy invitation link
                </button>
              </div>
            ) : (
              <form action={invite}>
                <label>
                  Course seat
                  <select name="licenseId" required defaultValue={license?.id}>
                    {eligibleLicenses.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Office location
                  <select name="locationId" required>
                    {(data.locations || []).map((location: any) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Full name
                  <input name="fullName" required />
                </label>
                <label>
                  Email address
                  <input name="email" type="email" required />
                </label>
                <button className="gold" disabled={busy}>
                  {busy ? "Creating…" : "Create invitation"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ProductCard({ product }: { product: CatalogProduct }) {
  const presentation = presentationFor(product.product_key);
  return (
    <article className="owned-product">
      <Image
        src={presentation.image}
        alt=""
        width={180}
        height={110}
        sizes="180px"
      />
      <div>
        <span className="owned-badge">PURCHASED</span>
        <h3>{product.title}</h3>
        <p>{presentation.description}</p>
        {presentation.staffSeatsAvailable && product.seats_purchased > 0 && (
          <small>{product.seats_purchased} seats purchased</small>
        )}
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
