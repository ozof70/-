import {env} from '@/lib/runtime-env';
import {headers} from 'next/headers';
import {database} from '@/db/raw';


export const SESSION_COOKIE='cos_session';
export const STATE_COOKIE='cos_oauth_state';
export const SESSION_AGE=7*24*60*60;
export function googleConfig(){
 if(!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET||!env.SITE_URL)return null;
 try{const url=new URL(env.SITE_URL);const local=['localhost','127.0.0.1'].includes(url.hostname);
  if(url.protocol!=='https:'&&!(process.env.NODE_ENV==='development'&&local&&url.protocol==='http:'))return null;
  if(url.username||url.password||url.search||url.hash||url.pathname!=='/')return null;
  return {clientId:env.GOOGLE_CLIENT_ID,clientSecret:env.GOOGLE_CLIENT_SECRET,origin:url.origin,callback:url.origin+'/api/auth/google/callback'};
 }catch{return null}
}
export function randomToken(){const bytes=crypto.getRandomValues(new Uint8Array(32));return btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')}
export async function digest(value:string){const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));return btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')}
export function readCookie(raw:string|null,name:string){return (raw??'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1)??''}
export function tokenCookie(name:string,value:string,age:number,origin:string){return `${name}=${value}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${age}${origin.startsWith('https:')?'; Secure':''}`}
export async function getAppUser(){
 const h=await headers();const token=readCookie(h.get('cookie'),SESSION_COOKIE);
 if(/^[A-Za-z0-9_-]{43}$/.test(token)){
  const user=await database().prepare('SELECT u.id,u.email,u.name FROM sessions s JOIN users u ON u.id=s.userId WHERE s.hash=? AND s.expires>?').bind(await digest(token),Date.now()).first<{id:string;email:string;name:string}>();
  if(user)return {userId:user.id,email:user.email,fullName:user.name,displayName:user.name};
 }
 // The starter test identity is never accepted by a production build.

 return null;
}


