import { createHmac, timingSafeEqual } from "node:crypto";

export type TcpIdentity = { tcpUserId:string; email:string; fullName:string; expiresAt:number };

function secret(){const value=process.env.TCP_ACADEMY_INTEGRATION_TOKEN;if(!value)throw new Error("TCP Academy integration is not configured");return value;}
function sign(payload:string){return createHmac("sha256",secret()).update(payload).digest("base64url");}

export function verifyTcpToken(token:string):TcpIdentity|null{
  const [payload,supplied]=token.split(".");if(!payload||!supplied)return null;
  const expected=sign(payload),left=Buffer.from(expected),right=Buffer.from(supplied);
  if(left.length!==right.length||!timingSafeEqual(left,right))return null;
  try{const identity=JSON.parse(Buffer.from(payload,"base64url").toString("utf8")) as TcpIdentity;return identity.expiresAt>=Date.now()?identity:null;}catch{return null;}
}

export function createAcademySession(identity:Omit<TcpIdentity,"expiresAt">){
  const payload=Buffer.from(JSON.stringify({...identity,expiresAt:Date.now()+30*24*60*60*1000}),"utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}
