import {DatabaseSync} from 'node:sqlite';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import path from 'node:path';
const dir=path.resolve(process.argv[2]||'import-batches'),file=path.join(dir,'partner-photos.data'),data=path.resolve(process.env.DATA_DIR||'.data');
if(!existsSync(file))process.exit(0);
const batch=JSON.parse(readFileSync(file,'utf8'));
if(!/^[a-zA-Z0-9_-]{1,100}$/.test(batch.id)||!Array.isArray(batch.items)||batch.items.length!==35)throw Error('Invalid photo batch');
const receipt=path.join(data,'import-receipts',batch.id+'.json');
if(existsSync(receipt)){console.log('Partner photos already applied');process.exit(0)}
const db=new DatabaseSync(path.join(data,'cos-closet.sqlite'));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const uuid=value=>{const h=digest(value);return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`};
try{
const owner=db.prepare("SELECT id FROM users WHERE lower(email)=lower(?) AND id LIKE 'google:%' ORDER BY created LIMIT 1").get(batch.ownerEmail);
if(!owner)throw Error('Photo owner missing');
const prepared=batch.items.map(item=>{
const id=uuid('drive-draft:'+owner.id+':'+item.source),old=db.prepare('SELECT * FROM items WHERE id=? AND owner=?').get(id,owner.id);
if(!old||JSON.parse(old.details).importSource!==item.source)throw Error('Photo ownership mismatch');
if(!Array.isArray(item.photos)||item.photos.length<1||item.photos.length>6)throw Error('Invalid photo count');
const images=item.photos.map(photo=>{
if(!/^[a-zA-Z0-9_-]{10,120}\.jpg$/.test(photo.file))throw Error('Unsafe photo filename');
const bytes=readFileSync(path.join(dir,'retouched',photo.file));
if(bytes.length<3||bytes.length>5*1024*1024||bytes[0]!==255||bytes[1]!==216||digest(bytes)!==photo.sha256||photo.width!==2000||photo.height!==2000)throw Error('Invalid edited image');
return {id:uuid('retouched:'+id+':'+photo.sha256),bytes};
});
return {id,old,images};
});
if(prepared.reduce((n,item)=>n+item.images.length,0)!==102)throw Error('Incomplete photo batch');
mkdirSync(path.join(data,'uploads'),{recursive:true});
for(const item of prepared)for(const image of item.images){const dest=path.join(data,'uploads',image.id);if(!existsSync(dest))writeFileSync(dest,image.bytes,{flag:'wx'});else if(digest(readFileSync(dest))!==digest(image.bytes))throw Error('Image collision')}
db.exec('BEGIN IMMEDIATE');
try{for(const item of prepared){const photos=item.images.map(p=>'/api/photos/'+p.id);db.prepare('UPDATE items SET image=?,photos=?,description=? WHERE id=? AND owner=?').run(photos[0],JSON.stringify(photos),item.old.description.replace('總价','總價'),item.id,owner.id);db.prepare('INSERT INTO admin_audit(id,actor,action,target,reason,created) VALUES(?,?,?,?,?,?)').run(randomUUID(),owner.id,'update_partner_photos',item.id,'衣主授權整理服裝皺摺與挺度，保留原1:1尺寸與原照備份。',Date.now())}db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
mkdirSync(path.dirname(receipt),{recursive:true});writeFileSync(receipt,JSON.stringify({batch:batch.id,count:35,photos:102,previous:prepared.map(i=>({id:i.id,image:i.old.image,photos:i.old.photos})),completed:Date.now()}));
console.log('Updated 102 square outfit photographs; prices, ownership and bookings preserved.');
}finally{db.close()}
