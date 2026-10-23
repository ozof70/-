export function migrationResponse(){
 return process.env.CLOSET_READ_ONLY==='1'?Response.json({error:'網站資料搬移中，請稍後再試。'},{status:503,headers:{'Retry-After':'60','Cache-Control':'no-store'}}):null;
}
