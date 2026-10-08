import {createRemoteJWKSet,jwtVerify} from 'jose';
import {database} from '@/db/raw';
import {digest,googleConfig,randomToken,readCookie,SESSION_AGE,SESSION_COOKIE,STATE_COOKIE,tokenCookie} from '@/lib/auth';
import {trustedOrigin} from '@/lib/runtime-env';
export const dynamic='force-dynamic';
const googleKeys=createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
export async function GET(req:Request){
 const cfg=googleConfig();if(!cfg)return Response.redirect(trustedOrigin(req)+'/login?error=setup',303);
 function redirect(path:string,session?:string){const h=new Headers({Location:cfg!.origin+path,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});h.append('Set-Cookie',tokenCookie(STATE_COOKIE,'',0,cfg!.origin));if(session)h.append('Set-Cookie',tokenCookie(SESSION_COOKIE,session,SESSION_AGE,cfg!.origin));return new Response(null,{status:303,headers:h})}
 try{
  const url=new URL(req.url),state=url.searchParams.get('state'),code=url.searchParams.get('code');
  if(!state||!/^[A-Za-z0-9_-]{43}$/.test(state)||state!==readCookie(req.headers.get('cookie'),STATE_COOKIE))return redirect('/login?error=expired');
  const db=database();const attempt=await db.prepare('DELETE FROM oauth_attempts WHERE hash=? AND expires>? RETURNING verifier,nonce').bind(await digest(state),Date.now()).first<{verifier:string;nonce:string}>();
  if(!attempt)return redirect('/login?error=expired');
  if(url.searchParams.has('error'))return redirect('/login?error=cancelled');
  if(!code||code.length>4096)return redirect('/login?error=failed');
  const tokenResult=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:cfg.clientId,client_secret:cfg.clientSecret,redirect_uri:cfg.callback,grant_type:'authorization_code',code_verifier:attempt.verifier}),signal:AbortSignal.timeout(15000)});
  if(!tokenResult.ok)return redirect('/login?error=failed');
  const token=await tokenResult.json() as {id_token?:string};if(!token.id_token)return redirect('/login?error=failed');
  const {payload}=await jwtVerify(token.id_token,googleKeys,{issuer:['https://accounts.google.com','accounts.google.com'],audience:cfg.clientId,algorithms:['RS256'],maxTokenAge:'10m',requiredClaims:['sub','exp','iat','nonce']});
  if(payload.nonce!==attempt.nonce||(payload.azp&&payload.azp!==cfg.clientId)||payload.email_verified!==true||typeof payload.email!=='string'||typeof payload.sub!=='string')return redirect('/login?error=failed');
  const id='google:'+payload.sub;const name=typeof payload.name==='string'&&payload.name.trim()?payload.name.trim().slice(0,80):'Coser';const session=randomToken();const oldSession=readCookie(req.headers.get('cookie'),SESSION_COOKIE);
  await db.batch([
   db.prepare('INSERT INTO users (id,email,name,created) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET email=excluded.email,name=excluded.name').bind(id,payload.email,name,Date.now()),
   db.prepare('DELETE FROM sessions WHERE expires<? OR hash=?').bind(Date.now(),await digest(oldSession)),
   db.prepare('INSERT INTO sessions (hash,userId,expires) VALUES (?,?,?)').bind(await digest(session),id,Date.now()+SESSION_AGE*1000),
  ]);
  return redirect('/explore',session);
 }catch{console.error('Google login verification failed');return redirect('/login?error=failed')}
}
