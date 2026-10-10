export const metadata={title:'登入｜COz Cos Closet',robots:{index:false,follow:false},alternates:{canonical:null}};
import {lineConfig} from '@/lib/line-auth';
import LoginView from './login-view';

import {getAppUser,googleConfig} from '@/lib/auth';

import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
 const params=await searchParams;const user=await getAppUser();if(user)redirect('/explore');const ready=!!googleConfig();
 return <LoginView ready={ready} lineReady={!!lineConfig()} error={params.error}/>;
}
