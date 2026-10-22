import {NextResponse,type NextRequest} from 'next/server';

// Enabled only for the final, synchronized data copy during a hosting move.
export function proxy(request:NextRequest){
 if(process.env.CLOSET_READ_ONLY==='1'&&(!['GET','HEAD','OPTIONS'].includes(request.method)||request.nextUrl.pathname.startsWith('/api/auth/'))){
  return NextResponse.json({error:'網站資料搬移中，請稍後再試。'},{status:503,headers:{'Retry-After':'60','Cache-Control':'no-store'}});
 }
 return NextResponse.next();
}
export const config={matcher:'/api/:path*'};
