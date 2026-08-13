import Image from "next/image";
import Link from "next/link";

const academyAccessUrl = "https://www.taxcomppro.com/academy-access";

const products = [
  {
    title: "30 Day Tax Office Launch",
    type: "BUSINESS LAUNCH",
    image: "/assets/30-day-launch-transparent.png",
    description: "Build the foundation, systems, compliance, and client plan for your tax office in 30 focused days.",
    href: "https://30daylaunch.taxcomppro.com/",
  },
  {
    title: "The Staff’s Audit Ready Due Diligence Course",
    type: "STAFF TRAINING",
    image: "/assets/staff-audit-ready-due-diligence.png",
    description: "Train staff, document completion, and maintain stronger office due-diligence records.",
    href: "https://www.taxcomppro.com/feed",
  },
  {
    title: "IRS Fine Defense Toolkit",
    type: "COMPLIANCE TOOLKIT",
    image: "/assets/irs-fine-defense-toolkit.png",
    description: "Organize procedures, documentation, staff resources, and audit-readiness materials in one place.",
    href: "https://www.taxcomppro.com/feed",
  },
  {
    title: "Schedule C Reconstruction",
    type: "TAX PREPARATION",
    image: "/assets/schedule-c-toolkit.png",
    description: "Use a structured approach to interview, corroborate, and document reconstructed business records.",
    href: "https://www.taxcomppro.com/feed",
  },
  {
    title: "Audit Ready Playbook",
    type: "AUDIT READINESS",
    image: "/assets/audit-playbook-toolkit.png",
    description: "Build repeatable workpaper, review, and documentation practices for defensible client files.",
    href: "https://www.taxcomppro.com/feed",
  },
];

export default function Home() {
  return (
    <main className="academy-landing">
      <header className="academy-landing-nav">
        <Link href="/" aria-label="Atlas Academy home">
          <Image className="landing-academy-logo" src="/assets/Atlas_Academy_Logo.png" alt="Atlas Academy" width={138} height={92} priority />
        </Link>
        <nav aria-label="Public navigation">
          <a href="#experience">Academy Experience</a>
          <a href="#products">Training Ecosystem</a>
        </nav>
        <div className="academy-landing-actions">
          <Link className="landing-text-link" href="https://www.taxcomppro.com/feed">Tax Compliance Pro</Link>
          <Link className="academy-sign-in" href={academyAccessUrl}>Sign In</Link>
        </div>
      </header>

      <section className="academy-landing-hero">
        <div className="academy-landing-copy">
          <p className="landing-kicker">THE TRAINING CENTER FOR TAX PROFESSIONALS</p>
          <h1>Learn. Apply.<br/><em>Advance.</em></h1>
          <p>Build stronger tax-office systems, train your staff, and keep every purchased course and toolkit connected to one Academy profile.</p>
          <div className="landing-hero-actions">
            <Link className="landing-primary" href={academyAccessUrl}>Sign In to Academy</Link>
            <a className="landing-secondary" href="#products">Explore the Ecosystem</a>
          </div>
          <div className="landing-trust-row">
            <span><b>ONE</b> member profile</span>
            <span><b>ALL</b> purchased products</span>
            <span><b>ONE</b> training record</span>
          </div>
        </div>
        <div className="academy-landing-visual">
          <div className="academy-orbit orbit-one" />
          <div className="academy-orbit orbit-two" />
          <Image src="/assets/Atlas_Academy_Logo.png" alt="Atlas, your Academy learning guide" width={610} height={406} priority />
          <span className="landing-floating-card card-one">COURSES</span>
          <span className="landing-floating-card card-two">TOOLKITS</span>
          <span className="landing-floating-card card-three">STAFF TRAINING</span>
        </div>
      </section>

      <section className="academy-experience" id="experience">
        <div className="landing-section-heading">
          <p className="landing-kicker">YOUR ACADEMY EXPERIENCE</p>
          <h2>Everything you purchase, organized in one place.</h2>
          <p>Atlas Academy is the learning and training side of Tax Compliance Pro. Your profile keeps your products, progress, staff seats, and completion records together.</p>
        </div>
        <div className="experience-grid">
          <article><span>01</span><h3>One connected profile</h3><p>Use your Tax Compliance Pro identity to reach every Academy product you own.</p></article>
          <article><span>02</span><h3>Protected learning</h3><p>Course missions, lessons, tools, and downloads unlock only after purchase.</p></article>
          <article><span>03</span><h3>Team visibility</h3><p>EROs can manage product-specific staff seats, assignments, progress, and completion.</p></article>
        </div>
      </section>

      <section className="landing-products" id="products">
        <div className="landing-section-heading product-heading">
          <div><p className="landing-kicker">TRAINING ECOSYSTEM</p><h2>Courses and toolkits built for the real work.</h2></div>
          <p>Purchase through Tax Compliance Pro. Learn, apply, and manage training here in Atlas Academy.</p>
        </div>
        <div className="landing-product-grid">
          {products.map((product) => (
            <article className="landing-product-card" key={product.title}>
              <div className="landing-product-image"><Image src={product.image} alt="" width={420} height={300} sizes="(max-width: 700px) 100vw, 33vw" /></div>
              <div className="landing-product-copy">
                <span>{product.type}</span>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <Link href={product.href}>Learn More <b aria-hidden="true">→</b></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-final-cta">
        <div><p className="landing-kicker">ALREADY A MEMBER?</p><h2>Your learning is ready when you are.</h2><p>Sign in to view purchased products, continue courses, and manage staff training.</p></div>
        <Link className="landing-primary" href={academyAccessUrl}>Enter Academy</Link>
      </section>

      <footer className="academy-landing-footer">
        <Image src="/assets/tax-compliance-pro-logo-dark.webp" alt="Tax Compliance Pro" width={170} height={56} />
        <p>Atlas Academy · Learn. Apply. Advance.</p>
        <Link href="https://www.taxcomppro.com/feed">Return to Tax Compliance Pro</Link>
      </footer>
    </main>
  );
}
