import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
const dir=process.env.DATA_DIR||path.join(process.cwd(),'.data');
if(process.env.RAILWAY_ENVIRONMENT_ID&&!process.env.RAILWAY_VOLUME_MOUNT_PATH)throw new Error('Attach a Railway persistent volume before starting this service.');
mkdirSync(dir,{recursive:true});const db=new DatabaseSync(path.join(dir,'cos-closet.sqlite'));
db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
db.exec('CREATE TABLE IF NOT EXISTS app_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL)');
try{db.exec('BEGIN IMMEDIATE');for(const name of readdirSync('drizzle').filter(x=>x.endsWith('.sql')).sort()){
 const sql=readFileSync(path.join('drizzle',name),'utf8'),checksum=createHash('sha256').update(sql).digest('hex');const applied=db.prepare('SELECT checksum FROM app_migrations WHERE name=?').get(name);
 if(applied){if(applied.checksum!==checksum)throw new Error('Applied migration changed: '+name);continue}
 db.exec(sql);db.prepare('INSERT INTO app_migrations (name,checksum) VALUES (?,?)').run(name,checksum);console.log('Applied migration: '+name);
}db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}finally{db.close()}
