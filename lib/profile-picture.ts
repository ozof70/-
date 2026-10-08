/** Only accept Google-hosted HTTPS pictures from a verified Google ID token. */
export function googleProfilePicture(value:unknown):string|null {
 if(typeof value!=='string'||value.length>2048)return null;
 try{
  const url=new URL(value);
  const googleHost=['googleusercontent.com','ggpht.com'].some(host=>url.hostname===host||url.hostname.endsWith('.'+host));
  return url.protocol==='https:'&&!url.username&&!url.password&&googleHost?url.href:null;
 }catch{return null}
}
