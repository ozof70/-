import {DatabaseSync,type SQLInputValue} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
const remote=()=>process.env.CLOSET_STORAGE==='netlify';
async function execute(sql:string,values:unknown[]){const {executePostgres}=await import('./postgres');return (await executePostgres([{sql,values}],!/^\s*SELECT\b/i.test(sql)))[0]}
let connection:DatabaseSync|undefined;
function connectionForApp(){if(!connection){const dir=process.env.DATA_DIR||path.join(process.cwd(),'.data');mkdirSync(dir,{recursive:true});connection=new DatabaseSync(path.join(dir,'cos-closet.sqlite'));connection.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;')}return connection}
class Statement{
 constructor(readonly sql:string,readonly values:SQLInputValue[]=[]){ }
 bind(...values:unknown[]){return new Statement(this.sql,values as SQLInputValue[])}
 async first<T=Record<string,unknown>>(){if(remote())return ((await execute(this.sql,this.values)).rows[0] as T|undefined)??null;return (connectionForApp().prepare(this.sql).get(...this.values) as T|undefined)??null}
 async all<T=Record<string,unknown>>(){if(remote())return {results:(await execute(this.sql,this.values)).rows as T[]};return {results:connectionForApp().prepare(this.sql).all(...this.values) as T[]}}
 async run(){if(remote())return {meta:{changes:(await execute(this.sql,this.values)).changes}};const r=connectionForApp().prepare(this.sql).run(...this.values);return {meta:{changes:Number(r.changes)}}}
 runSync(){return connectionForApp().prepare(this.sql).run(...this.values)}
}
export function database(){return {prepare:(sql:string)=>new Statement(sql),async batch(statements:Statement[]){if(remote()){const {executePostgres}=await import('./postgres');return executePostgres(statements,true)}const db=connectionForApp();db.exec('BEGIN IMMEDIATE');try{const results=statements.map(s=>s.runSync());db.exec('COMMIT');return results}catch(e){db.exec('ROLLBACK');throw e}}}}
