import {database} from '@/db/raw';
import {digest,randomToken} from '@/lib/auth';
import {appleConfig,appleClientSecret,appleStateCookie} from '@/lib/apple-auth';
import {trustedOrigin} from '@/lib/runtime-env';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const cfg=appleConfig();if(!cfg)return Response.redirect(trustedOrigin(req)+'/login?error=apple_setup',303);
 try{
  // Validate the configured signing key before sending the visitor to Apple.
  await appleClientSecret(cfg);
  const state=randomToken(),nonce=randomToken(),db=database();
  await db.batch([db.prepare('DELETE FROM oauth_attempts WHERE expires<?').bind(Date.now()),db.prepare('INSERT INTO oauth_attempts (hash,verifier,nonce,expires) VALUES (?,?,?,?)').bind(await digest('apple:'+state),'apple',nonce,Date.now()+600000)]);
  const auth=new URL('https://appleid.apple.com/auth/authorize');auth.search=new URLSearchParams({client_id:cfg.clientId,redirect_uri:cfg.callback,response_type:'code',response_mode:'form_post',scope:'name email',state,nonce}).toString();
  return new Response(null,{status:303,headers:{Location:auth.toString(),'Set-Cookie':appleStateCookie(state),'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
 }catch{console.error('Unable to start Apple login');return Response.redirect(cfg.origin+'/login?error=unavailable',303)}
}
