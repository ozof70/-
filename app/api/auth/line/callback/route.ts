import {lineConfig,LINE_STATE_COOKIE} from '@/lib/line-auth';
import {database} from '@/db/raw';
import {digest,randomToken,readCookie,SESSION_AGE,SESSION_COOKIE,tokenCookie} from '@/lib/auth';
import {trustedOrigin} from '@/lib/runtime-env';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const cfg=lineConfig();if(!cfg)return Response.redirect(trustedOrigin(req)+'/login?error=line_setup',303);
 function redirect(path:string,session?:string){const h=new Headers({Location:cfg!.origin+path,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});h.append('Set-Cookie',tokenCookie(LINE_STATE_COOKIE,'',0,cfg!.origin));if(session)h.append('Set-Cookie',tokenCookie(SESSION_COOKIE,session,SESSION_AGE,cfg!.origin));return new Response(null,{status:303,headers:h})}
 try{
  const url=new URL(req.url),state=url.searchParams.get('state'),code=url.searchParams.get('code');
  if(!state||!/^[A-Za-z0-9_-]{43}$/.test(state)||state!==readCookie(req.headers.get('cookie'),LINE_STATE_COOKIE))return redirect('/login?error=expired');
  const db=database();const attempt=await db.prepare('DELETE FROM oauth_attempts WHERE hash=? AND expires>? RETURNING verifier,nonce').bind(await digest('line:'+state),Date.now()).first<{verifier:string;nonce:string}>();
  if(!attempt)return redirect('/login?error=expired');
  if(url.searchParams.has('error'))return redirect('/login?error=cancelled');
  if(!code||code.length>4096)return redirect('/login?error=failed');
  const tokenResult=await fetch('https://api.line.me/oauth2/v2.1/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:cfg.clientId,client_secret:cfg.clientSecret,redirect_uri:cfg.callback,grant_type:'authorization_code',code_verifier:attempt.verifier}),signal:AbortSignal.timeout(15000)});
  if(!tokenResult.ok)return redirect('/login?error=failed');
  const token=await tokenResult.json() as {id_token?:string};if(!token.id_token)return redirect('/login?error=failed');
  const verification=await fetch('https://api.line.me/oauth2/v2.1/verify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({id_token:token.id_token,client_id:cfg.clientId,nonce:attempt.nonce}),signal:AbortSignal.timeout(15000)});
  if(!verification.ok)return redirect('/login?error=failed');
  const payload=await verification.json() as Record<string,unknown>;
  if(payload.iss!=='https://access.line.me'||payload.aud!==cfg.clientId||payload.nonce!==attempt.nonce||typeof payload.exp!=='number'||payload.exp<=Date.now()/1000||typeof payload.sub!=='string'||!payload.sub||payload.sub.length>255)return redirect('/login?error=failed');
  if(typeof payload.email!=='string'||!payload.email.includes('@')||payload.email.length>320)return redirect('/login?error=line_email');
  const id='line:'+payload.sub;const name=typeof payload.name==='string'&&payload.name.trim()?payload.name.trim().slice(0,80):'Coser';const session=randomToken();const oldSession=readCookie(req.headers.get('cookie'),SESSION_COOKIE);
  await db.batch([
   db.prepare('INSERT INTO users (id,email,name,created) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET email=excluded.email,name=excluded.name').bind(id,payload.email,name,Date.now()),
   db.prepare('DELETE FROM sessions WHERE expires<? OR hash=?').bind(Date.now(),await digest(oldSession)),
   db.prepare('INSERT INTO sessions (hash,userId,expires) VALUES (?,?,?)').bind(await digest(session),id,Date.now()+SESSION_AGE*1000),
  ]);
  return redirect('/explore',session);
 }catch{console.error('LINE login verification failed');return redirect('/login?error=failed')}
}


