import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuidedExercise, requireProfile } from "@/lib/academy";
import { submitExercise } from "./actions";

export const dynamic="force-dynamic";

export default async function GuidedExercise({params,searchParams}:{params:Promise<{lessonId:string}>;searchParams:Promise<{saved?:string}>}){
  const profile=await requireProfile();
  const {lessonId}=await params;
  const query=await searchParams;
  const exercise=await getGuidedExercise(profile,lessonId);
  if(!exercise)notFound();
  const content=exercise.content||{};
  const result=query.saved&&exercise.submission;

  return <main className="guided-exercise-page">
    <section className="exercise-shell">
      <Link href={`/academy/products/${encodeURIComponent(exercise.product_key)}`}>&larr; {exercise.product_title}</Link>
      <p className="eyebrow">ATLAS-GUIDED STAFF EXERCISE</p>
      <span className="exercise-module">{exercise.module_title}</span>
      <h1>{exercise.title}</h1>
      <div className="privacy-guardrail"><strong>Training data only</strong><span>Do not enter taxpayer names, Social Security numbers, documents, or real client information.</span></div>
      {!exercise.purchased?<div className="locked-exercise"><h2>This exercise unlocks with the product.</h2><p>You may preview the learning path, but interactive exercises require a purchase attached to your Academy profile.</p></div>:
      result?<div className={exercise.submission.correct?'exercise-result correct':'exercise-result review'}>
        <span>{exercise.submission.correct?'STRONG DECISION':'REVIEW THE GUIDANCE'}</span>
        <h2>{exercise.submission.correct?'You selected the defensible next step.':'This response needs another look.'}</h2>
        <p>{content.explanation}</p>
        <div className="exercise-actions"><Link className="gold link-button" href={`/academy/products/${encodeURIComponent(exercise.product_key)}`}>Return to Learning Path</Link><Link className="outline-button" href={`/academy/exercises/${lessonId}`}>Try Again</Link></div>
      </div>:
      <form action={submitExercise} className="exercise-form">
        <div className="scenario-card"><span>SCENARIO</span><p>{content.scenario}</p></div>
        <fieldset><legend>{content.prompt}</legend>{(content.options||[]).map((option:string,index:number)=><label className="exercise-option" key={option}><input type="radio" name="selectedOption" value={index} required/><span>{option}</span></label>)}</fieldset>
        <input type="hidden" name="lessonId" value={lessonId}/>
        <button className="gold">Submit Decision</button>
      </form>}
    </section>
  </main>;
}
