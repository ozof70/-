import ts from '../node_modules/typescript/lib/typescript.js';
import {readFileSync,readdirSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const compile=source=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const {googleProfilePicture}=await import(compile(readFileSync('lib/profile-picture.ts','utf8')));
const photo='https://lh3.googleusercontent.com/a/test-profile';
assert.equal(googleProfilePicture(photo),photo);
for(const v of [null,'http://lh3.googleusercontent.com/a/test','https://lh3.googleusercontent.com.evil.test/a','https://user:pass@lh3.googleusercontent.com/a','javascript:alert(1)','https://example.com/a'])assert.equal(googleProfilePicture(v),null);
const db=new DatabaseSync(':memory:');for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(readFileSync('drizzle/'+f,'utf8'));
class Statement{constructor(sql,values=[]){this.sql=sql;this.values=values}bind(...values){return new Statement(this.sql,values)}async first(){return db.prepare(this.sql).get(...this.values)}runSync(){return db.prepare(this.sql).run(...this.values)}}
const digest=async s=>createHash('sha256').update(s).digest('base64url');
const state='s'.repeat(43),origin='https://example.com';
let payload={sub:'avatar-user',name:'Coser',email:'coser@example.com',email_verified:true,nonce:'nonce',picture:photo};
const previousFetch=globalThis.fetch;globalThis.fetch=async()=>Response.json({id_token:'verified-test-token'});
globalThis.profileTest={googleProfilePicture,database:()=>({prepare:sql=>new Statement(sql),async batch(rows){db.exec('BEGIN');try{const results=rows.map(r=>r.runSync());db.exec('COMMIT');return results}catch(e){db.exec('ROLLBACK');throw e}}}),createRemoteJWKSet:()=>null,jwtVerify:async(_token,_keys,options)=>{assert.equal(options.audience,'test-client');assert.ok(options.requiredClaims.includes('nonce'));return{payload}},digest,googleConfig:()=>({origin,clientId:'test-client',clientSecret:'test-secret',callback:origin+'/api/auth/google/callback'}),randomToken:()=>Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url'),readCookie:(raw,name)=>(raw||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='))?.slice(name.length+1)||'',SESSION_AGE:604800,SESSION_COOKIE:'cos_session',STATE_COOKIE:'cos_oauth_state',tokenCookie:(name,value)=>name+'='+value,trustedOrigin:()=>origin};
const source=readFileSync('app/api/auth/google/callback/route.ts','utf8').replace(/^import .*;\r?\n/gm,'');
const {GET}=await import(compile('const {googleProfilePicture,database,createRemoteJWKSet,jwtVerify,digest,googleConfig,randomToken,readCookie,SESSION_AGE,SESSION_COOKIE,STATE_COOKIE,tokenCookie,trustedOrigin}=globalThis.profileTest;\n'+source));
async function login(){db.prepare('INSERT INTO oauth_attempts VALUES (?,?,?,?)').run(await digest(state),'verifier','nonce',Date.now()+10000);return GET(new Request(origin+'/api/auth/google/callback?state='+state+'&code=test',{headers:{cookie:'cos_oauth_state='+state}}));}
try{
 assert.equal((await login()).headers.get('location'),origin+'/explore');assert.equal(db.prepare('SELECT picture FROM users WHERE id=?').get('google:avatar-user').picture,photo);
 payload={...payload,picture:'https://lh3.googleusercontent.com/a/new'};await login();assert.equal(db.prepare('SELECT picture FROM users WHERE id=?').get('google:avatar-user').picture,payload.picture);
 payload={...payload,picture:undefined};await login();assert.equal(db.prepare('SELECT picture FROM users WHERE id=?').get('google:avatar-user').picture,null);
 payload={...payload,sub:'unverified',email_verified:false,picture:photo};assert.match((await login()).headers.get('location'),/error=failed/);assert.equal(db.prepare('SELECT COUNT(*) n FROM users').get().n,1);
 console.log('PASS Google profile: verified-token avatar, login refresh, missing-photo fallback, unsafe URL rejection and unverified-account denial.');
}finally{globalThis.fetch=previousFetch;delete globalThis.profileTest;db.close();}
