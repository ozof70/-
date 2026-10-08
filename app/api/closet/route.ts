import {isAdmin} from '@/lib/admin-auth';
import {getAppUser as getChatGPTUser} from '@/lib/auth';
import {database} from '@/db/raw';
import {env,trustedOrigin} from '@/lib/runtime-env';
import {z} from 'zod';
import type {Item} from '@/lib/catalog';
import {listingDetailsSchema,parseDetails,parsePhotos} from '@/lib/listing-details';
export const dynamic='force-dynamic';
const fail=(error:string,status=400)=>Response.json({error},{status});
export async function GET(req:Request){try{const user=await getChatGPTUser();const db=database();const id=new URL(req.url).searchParams.get('availability');if(id){const dates=await db.prepare("SELECT start,end FROM bookings WHERE item=? AND status='accepted' AND end>=? ORDER BY start").bind(id,new Date().toISOString().slice(0,10)).all();return Response.json({dates:dates.results})}const items=await db.prepare('SELECT * FROM items WHERE active=1 OR owner=? ORDER BY created DESC LIMIT 500').bind(user?.userId??'').all();const bookings=user?await db.prepare('SELECT b.*,i.title,i.owner,i.details FROM bookings b JOIN items i ON i.id=b.item WHERE b.renter=? OR i.owner=? ORDER BY b.start DESC').bind(user.userId,user.userId).all():{results:[]};return Response.json({items:items.results.map(i=>({...i,details:parseDetails(i.details),photos:parsePhotos(i.photos,String(i.image))})),bookings:bookings.results.map(b=>({...b,details:parseDetails(b.details)})),user:user?{id:user.userId,name:user.fullName??'我的衣櫃',admin:isAdmin(user)}:null})}catch(e){console.error(e);return fail('衣櫃暫時無法載入，請稍後重試。',503)}}
const input=z.object({title:z.string().trim().min(2).max(80),series:z.string().trim().min(1).max(60),ownerName:z.string().trim().min(1).max(30),size:z.enum(['XS','S','M','L','XL','其他']),city:z.string().trim().min(1).max(30),price:z.coerce.number().int().min(1).max(50000),deposit:z.coerce.number().int().min(0).max(100000),description:z.string().trim().min(10).max(2000),delivery:z.enum(['面交','宅配','面交或宅配'])});
function validDate(v:unknown):v is string{return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v}
export async function POST(req:Request){try{
 const origin=req.headers.get('origin');if(origin&&origin!==trustedOrigin(req))return fail('來源不符',403);
 const user=await getChatGPTUser();if(!user)return fail('請先登入再繼續。',401);const db=database();
 if(req.headers.get('content-type')?.includes('multipart/form-data')){
  if(Number(req.headers.get('content-length')??0)>21*1024*1024)return fail('照片合計上限為 20 MB',413);
  const form=await req.formData();const fields=Object.fromEntries(form);const result=input.safeParse(fields);if(!result.success)return fail('請確認服裝資料完整，租金與押金須為有效整數。');
  const details=listingDetailsSchema.safeParse(fields);if(!details.success)return fail('請確認社群網址使用正確平台的 HTTPS 個人頁，身形數值也須在合理範圍內。');
  const photos=form.getAll('photo');
  if(photos.length<1||photos.length>6)return fail('請上傳 1 至 6 張服裝照片。');
  const files:File[]=[];let total=0;
  for(const photo of photos){if(!(photo instanceof File)||photo.size===0||photo.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(photo.type))return fail('每張照片須為 5 MB 以內的 JPG、PNG 或 WebP。');files.push(photo);total+=photo.size;}
  if(total>20*1024*1024)return fail('照片合計上限為 20 MB',413);
  const images:{bytes:ArrayBuffer;type:string}[]=[];
  for(const photo of files){const bytes=await photo.arrayBuffer();const h=new Uint8Array(bytes);const valid=photo.type==='image/jpeg'?h[0]===255&&h[1]===216&&h[2]===255:photo.type==='image/png'?h[0]===137&&h[1]===80&&h[2]===78&&h[3]===71:String.fromCharCode(...h.slice(0,4))==='RIFF'&&String.fromCharCode(...h.slice(8,12))==='WEBP';if(!valid)return fail('照片格式不符');images.push({bytes,type:photo.type});}
  const id=crypto.randomUUID(),keys:string[]=[],urls:string[]=[];const v=result.data;
  try{
   for(const [index,image] of images.entries()){const photoId=index===0?id:crypto.randomUUID();const key='costumes/'+photoId;await env.BUCKET.put(key,image.bytes,{httpMetadata:{contentType:image.type}});keys.push(key);urls.push('/api/photos/'+photoId);}
   await db.prepare('INSERT INTO items (id,owner,ownerName,title,series,size,city,price,deposit,description,delivery,image,created,details,photos,active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)').bind(id,user.userId,v.ownerName,v.title,v.series,v.size,v.city,v.price,v.deposit,v.description,v.delivery,urls[0],Date.now(),JSON.stringify(details.data),JSON.stringify(urls)).run();
  }catch(e){await Promise.allSettled(keys.map(key=>env.BUCKET.delete(key)));throw e}
  return Response.json({ok:true,id});
 }
 const b=await req.json() as Record<string,unknown>;
 if(b.action==='book'){
  if(typeof b.item!=='string'||!validDate(b.start)||!validDate(b.end))return fail('請選擇有效租期。');
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const days=(Date.parse(b.end)-Date.parse(b.start))/86400000+1;if(b.start<today||days<1||days>30)return fail('租期須從今天起，且介於 1 至 30 天。');
  const item=await db.prepare('SELECT * FROM items WHERE id=? AND active=1').bind(b.item).first<Item>();if(!item)return fail('服裝已下架或不存在。',404);if(item.owner===user.userId)return fail('不能租借自己的服裝。');
  const id=crypto.randomUUID();const result=await db.prepare("INSERT INTO bookings (id,item,renter,renterName,start,end,status,total) SELECT ?,?,?,?,?,?,'pending',? WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE item=? AND start<=? AND end>=? AND (status='accepted' OR (renter=? AND status='pending')))").bind(id,item.id,user.userId,user.fullName??'租借者',b.start,b.end,item.price*days,item.id,b.end,b.start,user.userId).run();if(!result.meta.changes)return fail('這段租期已有確認租借，或您已有重疊申請。',409);return Response.json({ok:true});
 }
 if(b.action==='availability'&&typeof b.item==='string'&&typeof b.active==='boolean'){const r=await db.prepare('UPDATE items SET active=? WHERE id=? AND owner=? AND (?=0 OR NOT EXISTS (SELECT 1 FROM item_moderation WHERE item=items.id))').bind(b.active?1:0,b.item,user.userId,b.active?1:0).run();return r.meta.changes?Response.json({ok:true}):fail('服裝不存在或已由管理員下架，請聯絡管理員。',409)}
 if(b.action==='status'&&typeof b.id==='string'&&['accepted','declined','cancelled'].includes(String(b.status))){
  const record=await db.prepare('SELECT b.*,i.owner FROM bookings b JOIN items i ON i.id=b.item WHERE b.id=?').bind(b.id).first<{owner:string;renter:string;status:string;item:string;start:string;end:string}>();if(!record)return fail('找不到申請',404);const cancel=b.status==='cancelled';if(cancel?record.renter!==user.userId:record.owner!==user.userId)return fail('沒有權限',403);if(record.status!=='pending')return fail('此申請已處理',409);
  const r=await db.prepare("UPDATE bookings SET status=? WHERE id=? AND status='pending' AND (?!='accepted' OR NOT EXISTS (SELECT 1 FROM bookings other WHERE other.item=bookings.item AND other.id!=bookings.id AND other.status='accepted' AND other.start<=bookings.end AND other.end>=bookings.start))").bind(b.status,b.id,b.status).run();if(!r.meta.changes)return fail('狀態已變更，或租期與已確認租借重疊。',409);return Response.json({ok:true});
 }return fail('不支援的操作');
 }catch(e){console.error(e);return fail('未能儲存，請保留資料並稍後重試。',503)}}

