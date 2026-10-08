export const metadata={title:'登入｜COZ COS CLOSET',robots:{index:false,follow:false},alternates:{canonical:null}};
import {lineConfig} from '@/lib/line-auth';
import LoginView from './login-view';
import {Shirt,ArrowLeft,ShieldCheck} from 'lucide-react';
import {getAppUser,googleConfig} from '@/lib/auth';
import {appleConfig} from '@/lib/apple-auth';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
 const params=await searchParams;const user=await getAppUser();if(user)redirect('/explore');const ready=!!googleConfig(),appleReady=!!appleConfig();
 return <LoginView ready={ready} appleReady={appleReady} lineReady={!!lineConfig()} error={params.error}/>;
}
