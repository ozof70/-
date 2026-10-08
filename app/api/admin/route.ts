import {getAppUser} from '@/lib/auth';
import {isAdmin} from '@/lib/admin-auth';
import {database} from '@/db/raw';
import {trustedOrigin} from '@/lib/runtime-env';
import {z} from 'zod';
export const dynamic='force-dynamic';
const response=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(req:Request){
 const user=await getAppUser();if(!user)return response({error:'請先登入'},401);if(!isAdmin(user))return response({error:'沒有管理員權限'},403);
 try{
  const db=database(),url=new URL(req.url);const kind=url.searchParams.get('kind')||'items';
  const page=Math.max(1,Math.min(100000,Number(url.searchParams.get('page'))||1));const offset=(Math.floor(page)-1)*30;
  const raw=(url.searchParams.get('q')||'').trim().slice(0,100);const q='%'+raw.replace(/[\\%_]/g,'\\$&')+'%';
  const summary=await db.prepare(`SELECT (SELECT COUNT(*) FROM items) AS items,(SELECT COUNT(*) FROM items WHERE active=1) AS active,(SELECT COUNT(*) FROM users) AS members,(SELECT COUNT(*) FROM bookings WHERE status='pending') AS pending,(SELECT COUNT(*) FROM bookings WHERE status='accepted') AS accepted`).first();
  let sql:string;
  if(kind==='items')sql=`SELECT i.id,i.title,i.series,i.ownerName,i.size,i.city,i.price,i.active,i.created,m.reason AS moderationReason FROM items i LEFT JOIN item_moderation m ON m.item=i.id WHERE i.title LIKE ? ESCAPE '\\' OR i.ownerName LIKE ? ESCAPE '\\' ORDER BY i.created DESC,i.id LIMIT 31 OFFSET ?`;
  else if(kind==='bookings')sql=`SELECT b.*,i.title,i.ownerName FROM bookings b JOIN items i ON i.id=b.item WHERE i.title LIKE ? ESCAPE '\\' OR b.renterName LIKE ? ESCAPE '\\' ORDER BY b.start DESC,b.id LIMIT 31 OFFSET ?`;
  else if(kind==='members')sql=`SELECT u.id,u.name,u.email,u.created,(SELECT COUNT(*) FROM items i WHERE i.owner=u.id) AS listings,(SELECT COUNT(*) FROM bookings b WHERE b.renter=u.id) AS rentals FROM users u WHERE u.name LIKE ? ESCAPE '\\' OR u.email LIKE ? ESCAPE '\\' ORDER BY u.created DESC,u.id LIMIT 31 OFFSET ?`;
  else if(kind==='audit')sql=`SELECT a.*,u.name AS actorName FROM admin_audit a JOIN users u ON u.id=a.actor WHERE a.target LIKE ? ESCAPE '\\' OR a.reason LIKE ? ESCAPE '\\' ORDER BY a.created DESC,a.id LIMIT 31 OFFSET ?`;
  else return response({error:'不支援的類別'},400);
  const rows=(await db.prepare(sql).bind(q,q,offset).all()).results;
  return response({summary,rows:rows.slice(0,30),hasMore:rows.length>30,page:Math.floor(page)});
 }catch{console.error('Admin read failed');return response({error:'後台資料暫時無法載入'},503)}
}
const mutation=z.discriminatedUnion('action',[
 z.object({action:z.literal('moderate'),id:z.string().min(1).max(200),active:z.boolean(),expectedActive:z.number().int().min(0).max(1),reason:z.string().trim().min(2).max(300)}),
 z.object({action:z.literal('cancel'),id:z.string().min(1).max(200),expectedStatus:z.enum(['pending','accepted']),reason:z.string().trim().min(2).max(300)})
]);
export async function POST(req:Request){
 if(req.headers.get('origin')!==trustedOrigin(req))return response({error:'來源不符'},403);
 const user=await getAppUser();if(!user)return response({error:'請先登入'},401);if(!isAdmin(user))return response({error:'沒有管理員權限'},403);
 if(!req.headers.get('content-type')?.includes('application/json'))return response({error:'格式不符'},415);
 if(Number(req.headers.get('content-length')||0)>8192)return response({error:'資料過大'},413);
 try{
  const text=await req.text();if(text.length>8192)return response({error:'資料過大'},413);
  let input:unknown;try{input=JSON.parse(text)}catch{return response({error:'JSON 格式不符'},400)}
  const parsed=mutation.safeParse(input);if(!parsed.success)return response({error:'請填寫有效操作與至少兩字的原因'},400);
  const v=parsed.data,db=database(),now=Date.now(),audit=crypto.randomUUID();let changed:number;
  if(v.action==='moderate'){
   const statements=[db.prepare('INSERT INTO admin_audit(id,actor,action,target,reason,created) SELECT ?,?,?,?,?,? FROM items WHERE id=? AND active=?').bind(audit,user.userId,v.active?'restore_item':'hide_item',v.id,v.reason,now,v.id,v.expectedActive)];
   if(v.active)statements.push(db.prepare('DELETE FROM item_moderation WHERE item=? AND EXISTS(SELECT 1 FROM items WHERE id=? AND active=?)').bind(v.id,v.id,v.expectedActive));
   else statements.push(db.prepare('INSERT INTO item_moderation(item,reason,actor,updated) SELECT ?,?,?,? FROM items WHERE id=? AND active=? ON CONFLICT(item) DO UPDATE SET reason=excluded.reason,actor=excluded.actor,updated=excluded.updated').bind(v.id,v.reason,user.userId,now,v.id,v.expectedActive));
   statements.push(db.prepare('UPDATE items SET active=? WHERE id=? AND active=?').bind(v.active?1:0,v.id,v.expectedActive));
   const results=await db.batch(statements);changed=Number(results[results.length-1].changes);
  }else{
   const results=await db.batch([
    db.prepare('INSERT INTO admin_audit(id,actor,action,target,reason,created) SELECT ?,?,?,?,?,? FROM bookings WHERE id=? AND status=?').bind(audit,user.userId,'cancel_booking',v.id,v.reason,now,v.id,v.expectedStatus),
    db.prepare("UPDATE bookings SET status='cancelled' WHERE id=? AND status=?").bind(v.id,v.expectedStatus)
   ]);changed=Number(results[1].changes);
  }
  return changed?response({ok:true}):response({error:'資料已被更新或不存在，請重新整理後再操作'},409);
 }catch{console.error('Admin mutation failed');return response({error:'未能儲存，請稍後重試'},503)}
}
