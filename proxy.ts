import { NextRequest,NextResponse } from "next/server";
import { verifyTcpToken } from "@/lib/tcp-session";
export function proxy(req:NextRequest){const protectedRoute=req.nextUrl.pathname.startsWith("/academy")||req.nextUrl.pathname.startsWith("/api/academy");if(!protectedRoute)return NextResponse.next();const token=req.cookies.get("atlas_tcp_session")?.value;if(token&&verifyTcpToken(token))return NextResponse.next();return NextResponse.redirect("https://www.taxcomppro.com/academy-access");}
export const config={matcher:["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|pdf|mp4|zip|webmanifest)).*)","/(api)(.*)"]};
