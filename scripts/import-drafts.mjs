import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import path from 'node:path';

const batchDir=path.resolve(process.argv[2]||'import-batches');
const dataDir=path.resolve(process.env.DATA_DIR||'.data');
if(!existsSync(batchDir))process.exit(0);
const manifests=readdirSync(batchDir).filter(name=>name.endsWith('.json'));
if(!manifests.length)process.exit(0);
const db=new DatabaseSync(path.join(dataDir,'cos-closet.sqlite'));
db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
const uuid=value=>{const hex=createHash('sha256').update(value).digest('hex');return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`};
try{for(const name of manifests){
 const batch=JSON.parse(readFileSync(path.join(batchDir,name),'utf8'));
 if(!/^[a-zA-Z0-9_-]{1,100}$/.test(batch.id)||!Array.isArray(batch.items)||batch.items.length>100)throw new Error('Invalid import batch');
 const receipt=path.join(dataDir,'import-receipts',batch.id+'.json');
 if(existsSync(receipt)){console.log('Draft batch already imported: '+batch.id);continue}
 const owner=db.prepare("SELECT id,name FROM users WHERE lower(email)=lower(?) AND id LIKE 'google:%' ORDER BY created LIMIT 1").get(batch.ownerEmail);
 if(!owner)throw new Error('Import owner must already have a Google account on the website');
 const prepared=batch.items.map(item=>{
  if(typeof item.source!=='string'||!item.source||typeof item.title!=='string'||item.title.length<2||item.title.length>80||typeof item.series!=='string'||!item.series||item.series.length>60||!Array.isArray(item.photos)||item.photos.length<1||item.photos.length>6)throw new Error('Invalid draft item');
  const id=uuid('drive-draft:'+owner.id+':'+item.source);
  const images=item.photos.map(photo=>{
   if(!/^[a-zA-Z0-9_-]{10,100}\.jpg$/.test(photo.file))throw new Error('Invalid image filename');
   const bytes=readFileSync(path.join(batchDir,'photos',photo.file));
   if(bytes.length<3||bytes.length>5*1024*1024||bytes[0]!==255||bytes[1]!==216||bytes[2]!==255||createHash('sha256').update(bytes).digest('hex')!==photo.sha256)throw new Error('Invalid image data');
   return {id:uuid('drive-photo:'+id+':'+photo.file),bytes};
  });
  return {...item,id,images};
 });
 mkdirSync(path.join(dataDir,'uploads'),{recursive:true});
 let count=0;db.exec('BEGIN IMMEDIATE');
 try{for(const item of prepared){
  const existing=db.prepare('SELECT owner FROM items WHERE id=?').get(item.id);
  if(existing){if(existing.owner!==owner.id)throw new Error('Draft owner mismatch');continue}
  for(const image of item.images){const dest=path.join(dataDir,'uploads',image.id);if(!existsSync(dest))writeFileSync(dest,image.bytes,{flag:'wx'});else if(createHash('sha256').update(readFileSync(dest)).digest('hex')!==createHash('sha256').update(image.bytes).digest('hex'))throw new Error('Image collision')}
  const photos=item.images.map(image=>'/api/photos/'+image.id);
  const description='由衣主提供的服裝照片建立草稿。尺寸、衣況、配件、租金、押金與交付方式尚待確認，未開放租借。';
  db.prepare('INSERT INTO items(id,owner,ownerName,title,series,size,city,price,deposit,description,delivery,image,created,details,photos,active) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0)').run(item.id,owner.id,owner.name,item.title,item.series,'','',0,0,description,'',photos[0],Date.now(),JSON.stringify({draft:true,importSource:item.source}),JSON.stringify(photos));
  db.prepare('INSERT INTO admin_audit(id,actor,action,target,reason,created) VALUES(?,?,?,?,?,?)').run(randomUUID(),owner.id,'import_draft',item.id,'衣主授權匯入 Drive 服裝照片；草稿不公開。',Date.now());count++;
 }db.exec('COMMIT')}catch(error){db.exec('ROLLBACK');throw error}
 mkdirSync(path.dirname(receipt),{recursive:true});writeFileSync(receipt,JSON.stringify({batch:batch.id,owner:owner.id,count,ids:prepared.map(item=>item.id),completed:Date.now()}));
 console.log('Imported '+count+' private costume drafts from '+batch.id);
}}finally{db.close()}
