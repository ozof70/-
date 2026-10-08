import {lineConfig,LINE_STATE_COOKIE} from '@/lib/line-auth';
import {database} from '@/db/raw';
import {digest,randomToken,tokenCookie} from '@/lib/auth';
import {trustedOrigin} from '@/lib/runtime-env';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const cfg=lineConfig();if(!cfg)return Response.redirect(trustedOrigin(req)+'/login?error=line_setup',303);
 try{const state=randomToken(),verifier=randomToken(),nonce=randomToken();const db=database();
  await db.batch([db.prepare('DELETE FROM oauth_attempts WHERE expires<?').bind(Date.now()),db.prepare('INSERT INTO oauth_attempts (hash,verifier,nonce,expires) VALUES (?,?,?,?)').bind(await digest('line:'+state),verifier,nonce,Date.now()+600000)]);
  const auth=new URL('https://access.line.me/oauth2/v2.1/authorize');
  auth.search=new URLSearchParams({client_id:cfg.clientId,redirect_uri:cfg.callback,response_type:'code',scope:'openid email profile',state,nonce,code_challenge:await digest(verifier),code_challenge_method:'S256'}).toString();
  return new Response(null,{status:303,headers:{Location:auth.toString(),'Set-Cookie':tokenCookie(LINE_STATE_COOKIE,state,600,cfg.origin),'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
 }catch{console.error('Unable to start LINE login');return Response.redirect(cfg.origin+'/login?error=unavailable',303)}
}

