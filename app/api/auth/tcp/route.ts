import { NextRequest,NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAcademySession,verifyTcpToken } from "@/lib/tcp-session";

export async function GET(request:NextRequest){
  const identity=verifyTcpToken(request.nextUrl.searchParams.get("token")||"");
  if(!identity)return NextResponse.redirect("https://www.taxcomppro.com/login?next=/academy-access");
  const sql=db(),email=identity.email.trim().toLowerCase();
  let [profile]=await sql`SELECT * FROM academy_profiles WHERE tcp_user_id=${identity.tcpUserId} OR lower(email)=lower(${email}) ORDER BY CASE WHEN tcp_user_id=${identity.tcpUserId} THEN 0 ELSE 1 END LIMIT 1`;
  if(!profile){[profile]=await sql`INSERT INTO academy_profiles (clerk_user_id,tcp_user_id,email,full_name,role) VALUES (${`tcp:${identity.tcpUserId}`},${identity.tcpUserId},${email},${identity.fullName},'LEARNER') RETURNING *`;}
  else{await sql`UPDATE academy_profiles SET tcp_user_id=${identity.tcpUserId},email=${email},full_name=${identity.fullName},updated_at=now() WHERE id=${profile.id}`;}
  const response=NextResponse.redirect(new URL("/academy/my-learning",request.url));
  response.cookies.set("atlas_tcp_session",createAcademySession(identity),{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:30*24*60*60});
  return response;
}
