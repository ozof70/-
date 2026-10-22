import {mkdir,readFile,writeFile,unlink} from 'node:fs/promises';
import path from 'node:path';
function uploadPath(key:string){if(!/^costumes\/[a-f0-9-]{36}$/.test(key))throw new Error('Invalid object key');return path.join(process.env.DATA_DIR||path.join(process.cwd(),'.data'),'uploads',key.split('/')[1])}
async function blobStore(){const {getStore}=await import('@netlify/blobs');return getStore({name:'closet-photos',consistency:'strong'})}
function validateKey(key:string){if(!/^costumes\/[a-f0-9-]{36}$/.test(key))throw new Error('Invalid object key')}
const bucket={
 async put(key:string,bytes:ArrayBuffer,_options:{httpMetadata:{contentType:string}}){validateKey(key);if(process.env.CLOSET_STORAGE==='netlify'){const result=await (await blobStore()).set(key,bytes,{onlyIfNew:true,metadata:{contentType:_options.httpMetadata.contentType}});if(!result.modified)throw new Error('Image already exists');return}const target=uploadPath(key);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,new Uint8Array(bytes),{flag:'wx'})},
 async get(key:string){validateKey(key);if(process.env.CLOSET_STORAGE==='netlify'){const file=await (await blobStore()).getWithMetadata(key,{type:'arrayBuffer'});return file?{body:file.data,httpMetadata:{contentType:String(file.metadata.contentType||'image/jpeg')}}:null}try{const bytes=await readFile(uploadPath(key));const contentType=bytes[0]===137?'image/png':bytes[0]===255?'image/jpeg':'image/webp';return {body:new Uint8Array(bytes).buffer,httpMetadata:{contentType}}}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e}},
 async delete(key:string){validateKey(key);if(process.env.CLOSET_STORAGE==='netlify'){await (await blobStore()).delete(key);return}try{await unlink(uploadPath(key))}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e}},
};
export const env={
 get GOOGLE_CLIENT_ID(){return process.env.GOOGLE_CLIENT_ID},
 get GOOGLE_CLIENT_SECRET(){return process.env.GOOGLE_CLIENT_SECRET},
 get SITE_URL(){return process.env.SITE_URL||(process.env.RAILWAY_PUBLIC_DOMAIN?'https://'+process.env.RAILWAY_PUBLIC_DOMAIN:undefined)},
 BUCKET:bucket,
};
export function trustedOrigin(req:Request){return env.SITE_URL?new URL(env.SITE_URL).origin:new URL(req.url).origin}
