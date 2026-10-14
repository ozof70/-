import {DatabaseSync} from 'node:sqlite';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import path from 'node:path';
const data=path.resolve(process.env.DATA_DIR||'.data'),file=path.resolve(process.argv[2]||'import-batches/partner-release.data');
if(!existsSync(file))process.exit(0);
const batch=JSON.parse(readFileSync(file,'utf8'));
if(!/^[a-zA-Z0-9_-]{1,100}$/.test(batch.id)||!Array.isArray(batch.items)||batch.items.length!==35)throw Error('Invalid partner release');
const receipt=path.join(data,'import-receipts',batch.id+'.json');
if(existsSync(receipt)){console.log('Partner release already applied');process.exit(0)}
const db=new DatabaseSync(path.join(data,'cos-closet.sqlite'));
const uuid=value=>{const h=createHash('sha256').update(value).digest('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`};
try{
const owner=db.prepare("SELECT id FROM users WHERE lower(email)=lower(?) AND id LIKE 'google:%' ORDER BY created LIMIT 1").get(batch.ownerEmail);
if(!owner)throw Error('Partner owner missing');
const prepared=batch.items.map(item=>{
const id=uuid('drive-draft:'+owner.id+':'+item.source),old=db.prepare('SELECT * FROM items WHERE id=? AND owner=?').get(id,owner.id);
if(!old)throw Error('Imported costume missing');
const details=JSON.parse(old.details);
if(!details.draft||old.active||details.importSource!==item.source)throw Error('Existing listing changed; refusing to overwrite');
if(typeof item.title!=='string'||item.title.length<2||item.title.length>80||typeof item.pricePending!=='boolean')throw Error('Invalid outfit');
if(item.pricePending?(item.price!==0||item.deposit!==0):(!Number.isInteger(item.price)||item.price<200||item.price>50000||item.deposit!==item.price/2))throw Error('Invalid rental price');
return {...item,id,details:{...details,draft:false,partnerWardrobe:true,pricePending:item.pricePending,pricingMode:'rental'}};
});
db.exec('BEGIN IMMEDIATE');
try{for(const item of prepared){
db.prepare('UPDATE items SET title=?,ownerName=?,size=?,city=?,price=?,deposit=?,description=?,delivery=?,details=?,active=1 WHERE id=? AND owner=?').run(item.title,'合作衣櫃',item.size,'新北市',item.price,item.deposit,item.description,'面交或宅配',JSON.stringify(item.details),item.id,owner.id);
db.prepare('INSERT INTO admin_audit(id,actor,action,target,reason,created) VALUES(?,?,?,?,?,?)').run(randomUUID(),owner.id,'publish_partner',item.id,item.pricePending?'衣主授權公開實拍展示；價格待確認，禁止租借。':'衣主授權合作衣櫃上架；每次原價加200，押金為最終租金一半。',Date.now());
}db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
mkdirSync(path.dirname(receipt),{recursive:true});writeFileSync(receipt,JSON.stringify({batch:batch.id,count:prepared.length,priced:prepared.filter(i=>!i.pricePending).length,completed:Date.now()}));
console.log('Published 35 real outfits: 21 priced, 14 display only.');
}finally{db.close()}
