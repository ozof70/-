import {createRemoteJWKSet,importPKCS8,jwtVerify,SignJWT,type JWTVerifyGetKey} from 'jose';

export const APPLE_STATE_COOKIE='__Host-cos_apple_state';
const appleKeys=createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));
export function appleConfig(){
 const clientId=process.env.APPLE_CLIENT_ID?.trim(),teamId=process.env.APPLE_TEAM_ID?.trim(),keyId=process.env.APPLE_KEY_ID?.trim(),privateKey=process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g,'\n').trim();
 const site=process.env.SITE_URL||(process.env.RAILWAY_PUBLIC_DOMAIN?'https://'+process.env.RAILWAY_PUBLIC_DOMAIN:'');
 if(!clientId||!teamId||!keyId||!privateKey||!site)return null;
 try{const url=new URL(site);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/'||['localhost','127.0.0.1'].includes(url.hostname))return null;
 if(!/^[A-Za-z0-9.-]+$/.test(clientId)||! /^[A-Z0-9]{10}$/.test(teamId)||! /^[A-Z0-9]{10}$/.test(keyId)||!privateKey.startsWith('-----BEGIN PRIVATE KEY-----'))return null;
 return {clientId,teamId,keyId,privateKey,origin:url.origin,callback:url.origin+'/api/auth/apple/callback'};
 }catch{return null}
}
export type AppleConfig=NonNullable<ReturnType<typeof appleConfig>>;
export async function appleClientSecret(cfg:AppleConfig){const key=await importPKCS8(cfg.privateKey,'ES256');return new SignJWT({}).setProtectedHeader({alg:'ES256',kid:cfg.keyId}).setIssuer(cfg.teamId).setSubject(cfg.clientId).setAudience('https://appleid.apple.com').setIssuedAt().setExpirationTime('5m').sign(key)}
export function appleStateCookie(value:string,age=600){return `${APPLE_STATE_COOKIE}=${value}; HttpOnly; Secure; Path=/; SameSite=None; Max-Age=${age}`}
export async function verifyAppleIdentity(token:string,clientId:string,nonce:string,key:JWTVerifyGetKey=appleKeys){
 const {payload}=await jwtVerify(token,key,{issuer:'https://appleid.apple.com',audience:clientId,algorithms:['RS256'],requiredClaims:['sub','exp','iat','nonce'],maxTokenAge:'10m'});
 if(payload.nonce!==nonce||typeof payload.sub!=='string'||!payload.sub||payload.sub.length>255)throw new Error('Invalid Apple identity');
 if(typeof payload.email!=='string'||payload.email.length>320||!(payload.email_verified===true||payload.email_verified==='true'))throw new Error('Verified Apple email required');
 return {id:'apple:'+payload.sub,email:payload.email};
}
export function appleDisplayName(raw:FormDataEntryValue|null){
 if(typeof raw!=='string'||raw.length>4096)return '';
 try{const value=JSON.parse(raw);return [value?.name?.firstName,value?.name?.lastName].filter(v=>typeof v==='string').join(' ').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,80)}catch{return ''}
}
