import Image from "next/image";
import Link from "next/link";
import { getTrainingEcosystem, requireProfile } from "@/lib/academy";
import { presentationFor } from "@/lib/catalog";

export const dynamic="force-dynamic";

export default async function MyLearning(){
  const profile=await requireProfile();
  const data=await getTrainingEcosystem(profile);
  const learning=data.products.filter((product:any)=>product.purchased&&product.lesson_count>0);

  return <main className="my-learning-page">
    <header className="my-learning-header">
      <Link href="/academy">&larr; Academy Dashboard</Link>
      <p className="eyebrow">PERSONAL LEARNING</p>
      <h1>My Learning</h1>
      <p>Your courses, toolkits, exercises, and learning paths are collected here under your Academy profile.</p>
    </header>
    <section className="my-learning-summary">
      <div><strong>{learning.length}</strong><span>Available learning paths</span></div>
      <div><strong>{data.completedExercises}</strong><span>Exercises completed</span></div>
    </section>
    <section className="my-learning-content">
      <div className="section-heading"><div><p className="eyebrow">YOUR ACCESS</p><h2>Courses and Toolkits</h2></div><span>Connected to this profile</span></div>
      {learning.length?<div className="my-learning-grid">{learning.map((product:any)=>{
        const presentation=presentationFor(product.product_key);
        const learningHref=product.product_key==='course:30-day-tax-office-launch'?'/academy/courses/30-day-launch':`/academy/products/${encodeURIComponent(product.product_key)}`;
        return <article className="my-learning-card" key={product.product_key}>
          <Image src={presentation.image} alt="" width={180} height={140} sizes="150px"/>
          <div><span className="owned-badge">AVAILABLE TO YOU</span><h2>{product.title}</h2><p>{presentation.description}</p><small>{product.module_count} modules · {product.lesson_count} lessons</small><Link className="gold link-button" href={learningHref}>Continue Learning</Link></div>
        </article>;
      })}</div>:<div className="empty-learning"><h2>No personal learning available yet</h2><p>Courses and toolkits will appear here when a purchase or assignment is connected to your profile.</p><Link className="outline-button" href="/academy/ecosystem">Explore Training Ecosystem</Link></div>}
    </section>
  </main>;
}
