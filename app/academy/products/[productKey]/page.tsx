import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearningPath, requireProfile } from "@/lib/academy";
import { presentationFor } from "@/lib/catalog";
import { launchPhases } from "@/lib/launch-course";

export const dynamic = "force-dynamic";

export default async function ProductLearningPath({params}:{params:Promise<{productKey:string}>}){
  const profile=await requireProfile();
  const {productKey}=await params;
  const data=await getLearningPath(profile,decodeURIComponent(productKey));
  if(!data)notFound();
  const presentation=presentationFor(data.product.product_key);
  const isLaunchCourse=data.product.product_key==='course:30-day-tax-office-launch';
  const lessonCount=data.modules.reduce((sum:number,module:any)=>sum+module.lessons.length,0);
  const exerciseCount=data.modules.reduce((sum:number,module:any)=>sum+module.lessons.filter((lesson:any)=>lesson.lesson_type==='EXERCISE').length,0);

  return <main className="learning-path-page">
    <header className="learning-path-hero">
      <div className="learning-path-copy">
        <Link href="/academy/ecosystem">&larr; Training Ecosystem</Link>
        <span className={data.product.purchased?'owned-badge':'available-badge'}>{data.product.purchased?'PURCHASED':'CURRICULUM PREVIEW'}</span>
        <p className="eyebrow">{presentation.audience}</p>
        <h1>{data.product.title}</h1>
        <p>{presentation.description}</p>
        <div className="path-meta">{isLaunchCourse?<><span>4 phases</span><span>30 daily missions</span><span>30 original worksheets</span></>:<><span>{data.modules.length} modules</span><span>{lessonCount} lessons</span><span>{exerciseCount} Atlas-guided exercise{exerciseCount===1?'':'s'}</span></>}</div>
        {isLaunchCourse&&data.product.purchased?<Link className="gold link-button" href="/academy/courses/30-day-launch">Open Course Mission Control</Link>:null}
        {!isLaunchCourse&&!data.product.purchased?<Link className="danger-button launch-purchase-link" href={presentation.purchaseUrl}>Learn More</Link>:null}
      </div>
      <div className="learning-path-art"><Image src={presentation.image} alt={data.product.title} width={460} height={300} sizes="(max-width: 850px) 100vw, 420px" /></div>
    </header>

    {isLaunchCourse?<section className="curriculum-section" id="curriculum-preview"><div className="section-heading"><div><p className="eyebrow">COURSE PREVIEW</p><h2>Thirty Days. Four Launch Phases.</h2></div><span>{data.product.purchased?'Your course is unlocked':'Curriculum preview only'}</span></div><div className="launch-preview-phases">{launchPhases.map(phase=><article key={phase.number}><span>PHASE {phase.number}</span><h2>{phase.title}</h2><p>{phase.subtitle}</p><small>{phase.days.length} daily missions</small></article>)}</div>{data.product.purchased?<Link className="gold link-button" href="/academy/courses/30-day-launch">Open Course Mission Control</Link>:<Link className="danger-button link-button" href={presentation.purchaseUrl}>Learn More</Link>}</section>:<section className="curriculum-section">
      <div className="section-heading"><div><p className="eyebrow">LEARNING PATH</p><h2>{data.product.version_title}</h2></div><span>{data.product.purchased?'Your office has access':'Preview only until purchase'}</span></div>
      <div className="module-list">
        {data.modules.map((module:any,index:number)=><article className="module-card" key={module.id}>
          <div className="module-number">{String(index+1).padStart(2,'0')}</div>
          <div className="module-content"><h2>{module.title}</h2><p>{module.description}</p>
            <div className="lesson-list">{module.lessons.map((lesson:any)=><div key={lesson.id} className="lesson-row">
              <span className={`lesson-type type-${lesson.lesson_type.toLowerCase()}`}>{lesson.lesson_type}</span>
              <div><strong>{lesson.title}</strong><small>{lesson.duration_minutes} minutes{lesson.completed?' · Completed':''}</small></div>
              {lesson.lesson_type==='EXERCISE'&&data.product.purchased?<Link href={`/academy/exercises/${lesson.id}`}>{lesson.completed?'Review':'Begin'}</Link>:<span className="lesson-lock">{data.product.purchased?'Included':'Preview'}</span>}
            </div>)}</div>
          </div>
        </article>)}
      </div>
    </section>}
  </main>;
}
