import {DatabaseSync,type SQLInputValue} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
let connection:DatabaseSync|undefined;
function connectionForApp(){if(!connection){const dir=process.env.DATA_DIR||path.join(process.cwd(),'.data');mkdirSync(dir,{recursive:true});connection=new DatabaseSync(path.join(dir,'cos-closet.sqlite'));connection.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;')}return connection}
class Statement{
 constructor(readonly sql:string,readonly values:SQLInputValue[]=[]){ }
 bind(...values:unknown[]){return new Statement(this.sql,values as SQLInputValue[])}
 async first<T=Record<string,unknown>>(){return (connectionForApp().prepare(this.sql).get(...this.values) as T|undefined)??null}
 async all<T=Record<string,unknown>>(){return {results:connectionForApp().prepare(this.sql).all(...this.values) as T[]}}
 async run(){const r=connectionForApp().prepare(this.sql).run(...this.values);return {meta:{changes:Number(r.changes)}}}
 runSync(){return connectionForApp().prepare(this.sql).run(...this.values)}
}
export function database(){return {prepare:(sql:string)=>new Statement(sql),async batch(statements:Statement[]){const db=connectionForApp();db.exec('BEGIN IMMEDIATE');try{const results=statements.map(s=>s.runSync());db.exec('COMMIT');return results}catch(e){db.exec('ROLLBACK');throw e}}}}
