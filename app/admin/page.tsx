export const metadata={title:'管理後台｜COz Cos Closet',robots:{index:false,follow:false},alternates:{canonical:null}};
import {getAppUser} from '@/lib/auth';
import {isAdmin} from '@/lib/admin-auth';
import {redirect} from 'next/navigation';
import AdminPanel from './panel';
import './admin.css';
export const dynamic='force-dynamic';
export default async function Admin(){
 const user=await getAppUser();if(!user)redirect('/login');
 if(!isAdmin(user))return <main className="admin-denied"><h1>無法進入管理後台</h1><p>請使用指定的 Google 管理員帳號登入。</p><a href="/">返回首頁</a></main>;
 return <AdminPanel name={user.fullName} picture={user.picture} />;
}
