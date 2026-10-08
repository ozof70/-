import {env} from '@/lib/runtime-env';
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;if(!/^[a-f0-9-]{36}$/.test(id))return new Response('Not found',{status:404});const file=await env.BUCKET?.get('costumes/'+id);if(!file)return new Response('Not found',{status:404});return new Response(file.body,{headers:{'Content-Type':file.httpMetadata?.contentType??'application/octet-stream','Cache-Control':'private, max-age=3600','X-Content-Type-Options':'nosniff'}})}catch{return new Response('Unavailable',{status:503})}}

