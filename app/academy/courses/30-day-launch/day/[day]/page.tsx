import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLaunchCourse, requireProfile } from "@/lib/academy";
import { getLaunchDay } from "@/lib/launch-course";
import { completeLaunchDay } from "../../actions";

export const dynamic="force-dynamic";

export default async function LaunchDay({params,searchParams}:{params:Promise<{day:string}>;searchParams:Promise<{completed?:string}>}){
  const profile=await requireProfile();
  const course=await getLaunchCourse(profile);
  const {day:dayParam}=await params;
  const query=await searchParams;
  const lesson=getLaunchDay(Number(dayParam));
  if(!course||!lesson)notFound();
  if(!course.purchased)return <main className="launch-lesson-page locked-course-page"><section className="locked-lesson"><Link href="/academy/products/course%3A30-day-tax-office-launch">&larr; Course Preview</Link><p className="eyebrow">PURCHASE REQUIRED</p><h1>This course is locked.</h1><p>Purchase the course to unlock its mission details, lessons, worksheets, and progress tracking.</p><Link className="danger-button link-button" href="https://30daylaunch.taxcomppro.com/">Learn More</Link></section></main>;
  const completed=new Set(course.progress.filter((item:any)=>item.status==="COMPLETED").map((item:any)=>Number(item.day_number)));
  const existing=course.progress.find((item:any)=>Number(item.day_number)===lesson.day);
  const unlocked=lesson.day===1||completed.has(lesson.day)||completed.has(lesson.day-1);
  if(!unlocked)return <main className="launch-lesson-page"><section className="locked-lesson"><Link href="/academy/courses/30-day-launch">&larr; Mission Control</Link><h1>This mission is still locked.</h1><p>Complete the prior mission before continuing.</p></section></main>;

  return <main className="launch-lesson-page">
    <aside className="launch-lesson-sidebar"><Link href="/academy/courses/30-day-launch"><Image src="/assets/Atlas_Academy_Logo.png" alt="Atlas Academy" width={170} height={60}/></Link><nav><Link href="/academy/courses/30-day-launch">&larr; Course Mission Control</Link><a href="#brief">01 Mission Brief</a><a href="#lesson">02 Lesson</a><a href="#resources">03 Resources</a><a href="#mission">04 Complete Mission</a></nav><div><p>COURSE</p><strong>30 Day Tax Office Launch</strong><span>{completed.size} of 30 complete</span></div></aside>
    <section className="launch-lesson-main"><header className="launch-lesson-topbar"><div><p>PHASE {lesson.phase} · {lesson.phaseTitle.toUpperCase()}</p><h1>Day {lesson.day}: {lesson.title}</h1></div><span>{completed.has(lesson.day)?"MISSION COMPLETE":"IN PROGRESS"}</span></header>
      <div className="launch-lesson-content">
        {query.completed?<div className="mission-unlocked-message">Day {query.completed} complete. Your progress was saved and this mission is ready.</div>:null}
        <section className="launch-mission-brief" id="brief"><div><span>DAY {String(lesson.day).padStart(2,"0")} / DAILY MISSION</span><h2>{lesson.description}</h2><p>Work through the briefing, open the worksheet, and document the action you will take next.</p><div><b>30-45</b><small>MINUTES</small><b>1</b><small>MISSION WORKSHEET</small></div></div><Image src="/assets/Nova_Talia_Profile.jpg" alt="Nova Grant, Launch Commander" width={200} height={240}/></section>
        <section className="launch-lesson-card" id="lesson"><p className="eyebrow">NOVA VIDEO BRIEFING</p><h2>{lesson.title}</h2>{lesson.video?<video controls preload="metadata" poster={lesson.poster}>{<source src={lesson.video} type="video/mp4"/>}{lesson.captions?<track src={lesson.captions} kind="captions" srcLang="en" label="English" default/>:null}</video>:<div className="briefing-copy"><strong>Mission briefing</strong><p>{lesson.description}</p><p>Use the original course worksheet and source materials to complete today&apos;s documented launch action. The remaining Nova video will be placed here when production is approved.</p></div>}</section>
        <section className="launch-resources" id="resources"><div><p className="eyebrow">MISSION RESOURCE</p><h2>Day {lesson.day} Worksheet</h2><p>Open the original worksheet from the 30-Day Tax Office Launch course package.</p></div><a className="outline-button" href={lesson.worksheet} target="_blank" rel="noreferrer">Open Worksheet</a></section>
        <section className="launch-completion-card" id="mission"><p className="eyebrow">COMPLETE THE MISSION</p><h2>Document your next action</h2><p>{lesson.mission}</p><form action={completeLaunchDay}><input type="hidden" name="day" value={lesson.day}/><label>Mission reflection<textarea name="reflection" required minLength={10} defaultValue={existing?.reflection||""} placeholder="Describe the decision, document, or next action you completed today..."/></label><button className="gold">{completed.has(lesson.day)?"Update Mission Record":"Complete Day and Continue"}</button></form></section>
      </div>
    </section>
  </main>;
}
