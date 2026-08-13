"use server";

import { redirect } from "next/navigation";
import { getGuidedExercise, requireProfile } from "@/lib/academy";
import { db } from "@/lib/db";

export async function submitExercise(formData:FormData){
  const profile=await requireProfile();
  const lessonId=String(formData.get("lessonId")||"");
  const selectedOption=Number(formData.get("selectedOption"));
  const exercise=await getGuidedExercise(profile,lessonId);
  if(!exercise||!exercise.purchased)throw new Error("EXERCISE_ACCESS_REQUIRED");
  const options=exercise.content?.options;
  if(!Array.isArray(options)||!Number.isInteger(selectedOption)||selectedOption<0||selectedOption>=options.length)throw new Error("INVALID_EXERCISE_RESPONSE");
  const correct=selectedOption===Number(exercise.content.correctOption);
  const sql=db();
  await sql`INSERT INTO academy_exercise_submissions (lesson_id,profile_id,selected_option,correct)
    VALUES (${lessonId},${profile.id},${selectedOption},${correct})
    ON CONFLICT (lesson_id,profile_id) DO UPDATE SET selected_option=EXCLUDED.selected_option,correct=EXCLUDED.correct,completed_at=now()`;
  await sql`INSERT INTO academy_audit_logs (organization_id,actor_profile_id,action,entity_type,entity_id,metadata)
    VALUES (${exercise.organization_id||null},${profile.id},'GUIDED_EXERCISE_COMPLETED','LEARNING_LESSON',${lessonId},${JSON.stringify({correct,productKey:exercise.product_key})}::jsonb)`;
  redirect(`/academy/exercises/${lessonId}?saved=1`);
}
