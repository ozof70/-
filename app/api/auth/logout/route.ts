import {database} from '@/db/raw';
import {digest,readCookie,SESSION_COOKIE,tokenCookie} from '@/lib/auth';
import {trustedOrigin} from '@/lib/runtime-env';
export async function POST(req:Request){const origin=trustedOrigin(req);if(req.headers.get('origin')!==origin)return new Response('Forbidden',{status:403});try{const token=readCookie(req.headers.get('cookie'),SESSION_COOKIE);if(token)await database().prepare('DELETE FROM sessions WHERE hash=?').bind(await digest(token)).run();return new Response(null,{status:303,headers:{Location:origin+'/','Set-Cookie':tokenCookie(SESSION_COOKIE,'',0,origin),'Cache-Control':'no-store'}})}catch{return new Response('登出失敗，請稍後重試。',{status:503})}}

