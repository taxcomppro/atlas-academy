"use server";

import { redirect } from "next/navigation";
import { getLaunchCourse, requireProfile } from "@/lib/academy";
import { db } from "@/lib/db";

export async function completeLaunchDay(formData:FormData){
  const profile=await requireProfile();
  const course=await getLaunchCourse(profile);
  if(!course)throw new Error("COURSE_NOT_FOUND");
  if(!course.purchased)throw new Error("COURSE_ACCESS_REQUIRED");
  const day=Number(formData.get("day"));
  const reflection=String(formData.get("reflection")||"").trim();
  if(!Number.isInteger(day)||day<1||day>30||reflection.length<10)throw new Error("MISSION_RESPONSE_REQUIRED");
  const completed=new Set(course.progress.filter((item:any)=>item.status==="COMPLETED").map((item:any)=>Number(item.day_number)));
  if(day>1&&!completed.has(day-1))throw new Error("PREVIOUS_MISSION_REQUIRED");
  const sql=db();
  await sql`INSERT INTO academy_course_day_progress (profile_id,product_id,day_number,reflection,status,completed_at)
    VALUES (${profile.id},${course.product.id},${day},${reflection},'COMPLETED',now())
    ON CONFLICT (profile_id,product_id,day_number) DO UPDATE SET reflection=EXCLUDED.reflection,status='COMPLETED',completed_at=now(),updated_at=now()`;
  await sql`INSERT INTO academy_audit_logs (organization_id,actor_profile_id,action,entity_type,entity_id,metadata)
    VALUES (${course.membership?.organization_id||null},${profile.id},'COURSE_DAY_COMPLETED','COURSE_DAY',${`${course.product.product_key}:day-${day}`},${JSON.stringify({day,productKey:course.product.product_key})}::jsonb)`;
  redirect(day<30?`/academy/courses/30-day-launch/day/${day+1}?completed=${day}`:"/academy/courses/30-day-launch?courseComplete=1");
}
