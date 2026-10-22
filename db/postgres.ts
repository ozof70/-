import {getDatabase} from '@netlify/database';
import {postgresSQL} from './postgres-sql';
const numbers=new Set(['created','expires','updated','price','deposit','total','active','items','members','pending','accepted','listings','rentals','count']);
function normalize(row:Record<string,unknown>){return Object.fromEntries(Object.entries(row).map(([key,value])=>[key,numbers.has(key)&&typeof value==='string'?Number(value):value]))}
export async function executePostgres(statements:{sql:string;values:unknown[]}[],transaction:boolean){
 const client=await getDatabase().pool.connect();
 try{
  if(transaction){await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(684365001)')}
  const results=[];
  for(const statement of statements){const result=await client.query(postgresSQL(statement.sql),statement.values);results.push({rows:result.rows.map(normalize),changes:result.rowCount??0})}
  if(transaction)await client.query('COMMIT');
  return results;
 }catch(error){if(transaction)await client.query('ROLLBACK');throw error}finally{client.release()}
}
