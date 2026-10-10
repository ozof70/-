import {database} from '@/db/raw';
import type {Item} from '@/lib/catalog';
import {parseDetails,parsePhotos} from '@/lib/listing-details';
import {publicMetadata} from '@/lib/seo';
export const metadata=publicMetadata('探索 Cosplay 服裝租借｜COz Cos Closet','探索 COz Cos Closet 共用衣櫃，尋找動漫與遊戲 Cosplay 服裝。依角色、尺寸及地區挑選服裝，查看照片、品牌與租金，選擇租期向衣主提出申請。','/explore');
import Closet from '../closet';
export const dynamic='force-dynamic';
export default async function Explore(){
 let initialItems:Item[]=[];
 try{const {results}=await database().prepare('SELECT * FROM items WHERE active=1 ORDER BY created DESC LIMIT 500').all<Item & {details:string;photos:string}>();initialItems=results.map(i=>({...i,details:parseDetails(i.details),photos:parsePhotos(i.photos,i.image)}))}catch{console.error('Public catalog initial render unavailable')}
 return <Closet initialItems={initialItems}/>;
}
