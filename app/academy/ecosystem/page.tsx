import Image from "next/image";
import Link from "next/link";
import { getTrainingEcosystem, requireProfile } from "@/lib/academy";
import { presentationFor } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function TrainingEcosystem() {
  const profile = await requireProfile();
  const data = await getTrainingEcosystem(profile);
  const readyProducts = data.products.filter((product: any) => product.lesson_count > 0);
  const ownedProducts = readyProducts.filter((product: any) => product.purchased);

  return (
    <main className="ecosystem-page">
      <header className="ecosystem-hero">
        <div>
          <Link href="/academy">&larr; Academy Dashboard</Link>
          <p className="eyebrow">ATLAS ACADEMY</p>
          <h1>Tax Compliance Pro Training Ecosystem</h1>
          <p>
            One Academy profile connects every purchased product, guided
            exercise, and completion record.
          </p>
        </div>
        <div className="ecosystem-promise">
          <span>ONE PROFILE</span>
          <strong>Learn across the entire TCP product family.</strong>
          <small>No taxpayer names, Social Security numbers, documents, or real client data belong in Academy exercises.</small>
        </div>
      </header>

      <section className="ecosystem-summary">
        <Summary value={readyProducts.length} label="Learning paths" />
        <Summary value={ownedProducts.length} label="Purchased" />
        <Summary value={readyProducts.reduce((sum: number, item: any) => sum + item.lesson_count, 0)} label="Lessons" />
        <Summary value={data.completedExercises} label="Exercises completed" />
      </section>

      <section className="ecosystem-content">
        <div className="section-heading ecosystem-heading">
          <div><p className="eyebrow">CONNECTED LEARNING</p><h2>Academy Learning Paths</h2></div>
          <span>Courses unlock on this same profile after purchase</span>
        </div>
        <div className="ecosystem-grid">
          {readyProducts.map((product: any) => {
            const presentation = presentationFor(product.product_key);
            return (
              <article className="ecosystem-card" key={product.product_key}>
                <div className="ecosystem-image">
                  <Image src={presentation.image} alt="" width={420} height={220} sizes="(max-width: 850px) 100vw, 380px" />
                  <span className={product.purchased ? "owned-badge" : "available-badge"}>{product.purchased ? "PURCHASED" : "AVAILABLE"}</span>
                </div>
                <div className="ecosystem-card-copy">
                  <small>{presentation.audience}</small>
                  <h2>{product.title}</h2>
                  <p>{presentation.description}</p>
                  <div className="curriculum-counts">
                    <span><b>{product.module_count}</b> modules</span>
                    <span><b>{product.lesson_count}</b> lessons</span>
                    <span><b>{product.exercise_count}</b> {product.product_key==='course:30-day-tax-office-launch'?'daily missions':'guided exercise'}</span>
                  </div>
                  <Link className={product.purchased ? "gold link-button" : "outline-button preview-course-link"} href={`/academy/products/${encodeURIComponent(product.product_key)}`}>
                    {product.purchased ? "Open Learning Path" : "Preview Course"}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="ce-notice">
          <div><p className="eyebrow">FUTURE EXPANSION</p><h2>Continuing Education</h2></div>
          <p>Continuing-education courses will remain clearly marked as future offerings until the necessary provider approvals are obtained.</p>
          <span>NOT YET OFFERED FOR CE CREDIT</span>
        </aside>
      </section>
    </main>
  );
}

function Summary({value,label}:{value:number;label:string}){
  return <div><strong>{value}</strong><span>{label}</span></div>;
}
