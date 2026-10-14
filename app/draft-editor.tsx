'use client';
import {useState,type FormEvent} from 'react';
import type {Item} from '@/lib/catalog';
import {useLocale} from './preferences';

export default function DraftEditor({item,onSaved}:{item:Item;onSaved:()=>Promise<void>}){
 const {language}=useLocale();const L=(zh:string,en:string)=>language==='en'?en:zh;
 const [saving,setSaving]=useState(false),[error,setError]=useState('');
 async function save(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setSaving(true);setError('');
  try{const fields=Object.fromEntries(new FormData(event.currentTarget));const r=await fetch('/api/closet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'completeDraft',id:item.id,fields})});const d=await r.json() as {error?:string};if(!r.ok)throw new Error(d.error||L('無法儲存草稿','Unable to save draft'));await onSaved()}catch(e){setError(e instanceof Error?e.message:L('無法儲存草稿','Unable to save draft'))}finally{setSaving(false)}
 }
 return <form onSubmit={save} className="form-panel draft-editor"><p className="form-note">{L('這是私人草稿，只有你與管理員可查看。補齊資料並儲存後，仍須在我的衣櫃按「重新上架」才會公開。','This private draft is visible only to you and administrators. Saving the details does not publish it. Relist it in My wardrobe when ready.')}</p>
  <label>{L('服裝名稱','Outfit name')}<input name="title" defaultValue={item.title} minLength={2} maxLength={80} required/></label>
  <label>{L('作品／角色','Series / character')}<input name="series" defaultValue={item.series} maxLength={60} required/></label>
  <div className="form-row"><input type="hidden" name="ownerName" value={item.ownerName}/><label>{L('尺寸','Size')}<select name="size" defaultValue="" required><option value="" disabled>{L('請選擇','Select a size')}</option>{['XS','S','S/M','M','M/L','L','L/XL','XL','2XL','其他'].map(size=><option key={size} value={size}>{size==='其他'?L('其他','Other'):size}</option>)}</select></label></div>
  <input type="hidden" name="city" value="新北市"/><p>{L('所在縣市：新北市','City: New Taipei City')}</p>
  <label>{L('衣況、尺寸與配件清單','Condition, fit and included accessories')}<textarea name="description" defaultValue={item.description} rows={4} minLength={10} maxLength={2000} required/></label>
  <div className="form-row"><label>{item.details?.pricingMode==='rental'?L('每次租借總價（NT$）','Total per rental (NT$)'):L('每日租金（NT$）','Daily rental (NT$)')}<input name="price" type="number" min={1} max={50000} step={1} required/></label><label>{L('押金（NT$）','Deposit (NT$)')}<input name="deposit" type="number" min={0} max={100000} step={1} required/></label></div>
  <label>{L('交付方式','Delivery')}<select name="delivery" defaultValue="" required><option value="" disabled>{L('請選擇','Select delivery')}</option><option value="面交">{L('面交','Meet-up')}</option><option value="宅配">{L('宅配','Shipping')}</option><option value="面交或宅配">{L('面交或宅配','Meet-up or shipping')}</option></select></label>
  {error&&<p role="alert" className="date-error">{error}</p>}<button className="primary full" type="submit" disabled={saving}>{saving?L('儲存中…','Saving…'):L('儲存資料，維持不公開','Save details, keep private')}</button>
 </form>;
}
