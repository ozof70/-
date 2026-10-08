import {z} from 'zod';

function socialLink(hosts:string[]){return z.string().trim().max(300).default('').refine(value=>{
 if(!value)return true;
 try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&hosts.includes(url.hostname)&&url.pathname.length>1&&!url.hash;}catch{return false}
},'請填入完整的 HTTPS Facebook 或 Instagram 個人頁連結。')}
const measurement=(min:number,max:number)=>z.preprocess(v=>v===''||v==null?undefined:v,z.coerce.number().finite().min(min).max(max).optional());
export const listingDetailsSchema=z.object({
 brand:z.string().trim().max(80).default(''),
 facebook:socialLink(['facebook.com','www.facebook.com','m.facebook.com']),
 instagram:socialLink(['instagram.com','www.instagram.com']),
 height:measurement(80,250),weight:measurement(20,250),
 bust:measurement(30,200),waist:measurement(30,200),hips:measurement(30,200),
 fitNote:z.string().trim().max(300).default(''),
});
export type ListingDetails=z.infer<typeof listingDetailsSchema>;
export function parseDetails(raw:unknown):Partial<ListingDetails>{try{const result=listingDetailsSchema.safeParse(typeof raw==='string'?JSON.parse(raw):raw);return result.success?result.data:{}}catch{return {}}}
export function parsePhotos(raw:unknown,fallback:string):string[]{try{const photos=typeof raw==='string'?JSON.parse(raw):raw;if(Array.isArray(photos)&&photos.length&&photos.length<=6&&photos.every(p=>typeof p==='string'&&/^\/api\/photos\/[a-f0-9-]{36}$/.test(p)))return photos}catch{}return [fallback]}
