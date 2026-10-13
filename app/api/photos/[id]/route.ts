import {env} from '@/lib/runtime-env';
import {database} from '@/db/raw';
import {getAppUser} from '@/lib/auth';
import {isAdmin} from '@/lib/admin-auth';
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const {id}=await params;if(!/^[a-f0-9-]{36}$/.test(id))return new Response('Not found',{status:404});
  const listing=await database().prepare("SELECT owner,active FROM items WHERE id=? OR EXISTS(SELECT 1 FROM json_each(CASE WHEN json_valid(photos) THEN photos ELSE '[]' END) WHERE value=?) LIMIT 1").bind(id,'/api/photos/'+id).first<{owner:string;active:number}>();
  if(!listing)return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
  const privateListing=listing?.active===0;
  if(privateListing){const user=await getAppUser();if(!user||(user.userId!==listing!.owner&&!isAdmin(user)))return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}})}
  const file=await env.BUCKET?.get('costumes/'+id);if(!file)return new Response('Not found',{status:404});
  return new Response(file.body,{headers:{'Content-Type':file.httpMetadata?.contentType??'application/octet-stream','Cache-Control':privateListing?'private, no-store':'private, max-age=3600','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response('Unavailable',{status:503})}
}

