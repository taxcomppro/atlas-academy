import { NextResponse } from "next/server";
export async function GET(){const response=NextResponse.redirect("https://www.taxcomppro.com/feed");response.cookies.set("atlas_tcp_session","",{path:"/",maxAge:0});return response;}
