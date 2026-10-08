import {getAppUser} from './auth';
export type AdminIdentity={userId:string;email:string;fullName:string};
export function isAdmin(user:{userId:string;email:string}|null){
 const emails=(process.env.ADMIN_GOOGLE_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
 return !!user&&user.userId.startsWith('google:')&&emails.includes(user.email.toLowerCase());
}
export async function getAdmin(){const user=await getAppUser();return isAdmin(user)?user:null}
