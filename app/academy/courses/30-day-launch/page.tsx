import Image from "next/image";
import Link from "next/link";
import { getLaunchCourse, requireProfile } from "@/lib/academy";
import { launchPhases } from "@/lib/launch-course";

export const dynamic="force-dynamic";

export default async function LaunchMissionControl({searchParams}:{searchParams:Promise<{courseComplete?:string}>}){
  const profile=await requireProfile();
  const course=await getLaunchCourse(profile);
  if(!course)return null;
  if(!course.purchased)return <main className="launch-control-page"><section className="course-access-lock"><Link href="/academy/products/course%3A30-day-tax-office-launch">&larr; Course Preview</Link><p className="eyebrow">PURCHASE REQUIRED</p><h1>Course Mission Control is locked.</h1><p>Your curriculum preview is available in the Training Ecosystem. Purchase the course to unlock all mission details, lessons, worksheets, and progress tracking.</p><Link className="danger-button link-button" href="https://30daylaunch.taxcomppro.com/">Learn More</Link></section></main>;
  const params=await searchParams;
  const completed=new Set(course.progress.filter((item:any)=>item.status==="COMPLETED").map((item:any)=>Number(item.day_number)));
  const percent=Math.round((completed.size/30)*100);
  const nextDay=Math.min(30,Array.from({length:30},(_,i)=>i+1).find(day=>!completed.has(day))||30);

  return <main className="launch-control-page">
    <header className="launch-control-hero">
      <div className="launch-brand"><Link href="/academy/my-learning">&larr; My Learning</Link><p className="eyebrow">ATLAS ACADEMY COURSE</p><h1>30 Day Tax Office Launch</h1><p>Thirty focused missions that turn your tax-office idea into a documented, launch-ready operation.</p>
        <div className="launch-progress"><div><strong>{percent}%</strong><span>{completed.size} of 30 missions complete</span></div><div><i style={{width:`${percent}%`}}/></div></div>
        <Link className="gold link-button" href={`/academy/courses/30-day-launch/day/${nextDay}`}>{completed.size?`Continue Day ${nextDay}`:"Begin Day 1"}</Link>
      </div>
      <div className="launch-course-art"><Image src="/assets/30-day-launch-transparent.png" alt="30 Day Tax Office Launch" width={460} height={520} priority/></div>
    </header>
    {params.courseComplete?<div className="course-complete-message"><strong>All 30 missions complete.</strong> Your complete Launch record is now stored with your Academy profile.</div>:null}
    <section className="mission-roadmap"><div className="section-heading"><div><p className="eyebrow">COURSE ROADMAP</p><h2>Your 30-Day Mission Plan</h2></div><span>Four phases · Thirty daily missions</span></div>
      {launchPhases.map(phase=><section className="launch-phase" key={phase.number}><header><div><span>PHASE {phase.number}</span><h2>{phase.title}</h2></div><p>{phase.subtitle}</p></header><div className="launch-day-grid">{phase.days.map(day=>{
        const done=completed.has(day.day);const unlocked=done||day.day===1||completed.has(day.day-1);
        return unlocked?<Link className={`launch-day-card ${done?"complete":"ready"}`} href={`/academy/courses/30-day-launch/day/${day.day}`} key={day.day}><b>DAY {String(day.day).padStart(2,"0")}</b><div><strong>{day.title}</strong><p>{day.description}</p></div><span>{done?"Complete":"Open Mission"}</span></Link>:<article className="launch-day-card locked" key={day.day}><b>DAY {String(day.day).padStart(2,"0")}</b><div><strong>{day.title}</strong><p>{day.description}</p></div><span>Locked</span></article>;
      })}</div></section>)}
    </section>
  </main>;
}
