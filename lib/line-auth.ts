import {env} from '@/lib/runtime-env';
export const LINE_STATE_COOKIE='cos_line_state';
export function lineConfig(){
 if(!process.env.LINE_CHANNEL_ID||!process.env.LINE_CHANNEL_SECRET||!env.SITE_URL)return null;
 try{const url=new URL(env.SITE_URL);const local=['localhost','127.0.0.1'].includes(url.hostname);
  if(url.protocol!=='https:'&&!(process.env.NODE_ENV==='development'&&local&&url.protocol==='http:'))return null;
  if(url.username||url.password||url.search||url.hash||url.pathname!=='/')return null;
  return {clientId:process.env.LINE_CHANNEL_ID,clientSecret:process.env.LINE_CHANNEL_SECRET,origin:url.origin,callback:url.origin+'/api/auth/line/callback'};
 }catch{return null}
}
