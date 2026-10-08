'use client';
import {useState} from 'react';
export default function AccountAvatar({name,picture}:{name:string;picture?:string|null}){
 const [failed,setFailed]=useState<string|null>(null);
 return <span className="account-dot account-avatar" title={name} role="img" aria-label={name}>
  {picture&&failed!==picture?<img src={picture} alt="" width={34} height={34} referrerPolicy="no-referrer" onError={()=>setFailed(picture)}/>:name.slice(0,1)}
 </span>;
}
