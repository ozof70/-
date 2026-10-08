import {database} from '@/db/raw';
import {digest,randomToken,readCookie,SESSION_COOKIE,SESSION_AGE,tokenCookie} from '@/lib/auth';
import {appleConfig,appleClientSecret,appleStateCookie,APPLE_STATE_COOKIE,verifyAppleIdentity,appleDisplayName} from '@/lib/apple-auth';
import {trustedOrigin} from '@/lib/runtime-env';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 const cfg=appleConfig();if(!cfg)return Response.redirect(trustedOrigin(req)+'/login?error=apple_setup',303);
 function redirect(path:string,session?:string){const h=new Headers({Location:cfg!.origin+path,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});h.append('Set-Cookie',appleStateCookie('',0));if(session)h.append('Set-Cookie',tokenCookie(SESSION_COOKIE,session,SESSION_AGE,cfg!.origin));return new Response(null,{status:303,headers:h})}
 try{
  if(!req.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))return redirect('/login?error=failed');
  // Apple callbacks are small; bound streamed bodies as well as Content-Length.
  if(Number(req.headers.get('content-length')??0)>16384)return redirect('/login?error=failed');
  const reader=req.body?.getReader();if(!reader)return redirect('/login?error=failed');let length=0;const chunks:Uint8Array[]=[];
  while(true){const part=await reader.read();if(part.done)break;length+=part.value.length;if(length>16384){await reader.cancel();return redirect('/login?error=failed')}chunks.push(part.value)}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
  const body=new URLSearchParams(new TextDecoder().decode(bytes)),state=body.get('state'),code=body.get('code');
  if(!state||!/^[A-Za-z0-9_-]{43}$/.test(state)||state!==readCookie(req.headers.get('cookie'),APPLE_STATE_COOKIE))return redirect('/login?error=expired');
  const db=database();const attempt=await db.prepare("DELETE FROM oauth_attempts WHERE hash=? AND verifier='apple' AND expires>? RETURNING nonce").bind(await digest('apple:'+state),Date.now()).first<{nonce:string}>();
  if(!attempt)return redirect('/login?error=expired');
  if(body.has('error'))return redirect('/login?error=cancelled');
  if(!code||code.length>4096)return redirect('/login?error=failed');
  const result=await fetch('https://appleid.apple.com/auth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:cfg.clientId,client_secret:await appleClientSecret(cfg),code,grant_type:'authorization_code',redirect_uri:cfg.callback}),signal:AbortSignal.timeout(15000)});
  if(!result.ok)return redirect('/login?error=failed');const token=await result.json() as {id_token?:string};if(!token.id_token)return redirect('/login?error=failed');
  const identity=await verifyAppleIdentity(token.id_token,cfg.clientId,attempt.nonce);
  // Apple only supplies the name on first consent. Preserve the existing name.
  const name=appleDisplayName(body.get('user'));const session=randomToken();
  await db.batch([
   db.prepare("INSERT INTO users (id,email,name,created) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET email=excluded.email").bind(identity.id,identity.email,name||'Apple 使用者',Date.now()),
   db.prepare('DELETE FROM sessions WHERE expires<? OR hash=?').bind(Date.now(),await digest(readCookie(req.headers.get('cookie'),SESSION_COOKIE))),
   db.prepare('INSERT INTO sessions (hash,userId,expires) VALUES (?,?,?)').bind(await digest(session),identity.id,Date.now()+SESSION_AGE*1000),
  ]);
  return redirect('/explore',session);
 }catch{console.error('Apple login verification failed');return redirect('/login?error=failed')}
}
export async function GET(req:Request){return Response.redirect(trustedOrigin(req)+'/login?error=expired',303)}
