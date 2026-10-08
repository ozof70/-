import type {Metadata} from 'next';
export const SITE_NAME='COZ COS CLOSET';
export const SITE_ORIGIN='https://cos-closet-production.up.railway.app';
export const SITE_DESCRIPTION='COZ COS CLOSET（COZ COS）共用衣櫃，專為 Cosplay 服裝租借與分享打造。探索動漫、遊戲角色服裝，查看多張照片、品牌與尺寸，選擇租期提出申請，也能上架自己的 Cos 服裝出租。';
export function publicMetadata(title:string,description:string,path:string):Metadata{return {
 title,description,alternates:{canonical:path},
 openGraph:{type:'website',siteName:SITE_NAME,title,description,url:path,locale:'zh_TW',images:[{url:'/opengraph-image?v=20261008',width:1200,height:630,alt:'COZ COS CLOSET — Cosplay rental and shared wardrobe'}]},
 twitter:{card:'summary_large_image',title,description,images:['/opengraph-image?v=20261008']}
}}
export const siteGraph={'@context':'https://schema.org','@graph':[
 {'@type':'Organization','@id':SITE_ORIGIN+'/#organization',name:SITE_NAME,alternateName:['COZ COS','Coz Cos','COZ','共用衣櫃'],url:SITE_ORIGIN+'/',logo:{'@type':'ImageObject',url:SITE_ORIGIN+'/brand-icon.png',width:512,height:512}},
 {'@type':'WebSite','@id':SITE_ORIGIN+'/#website',url:SITE_ORIGIN+'/',name:SITE_NAME,alternateName:['COZ COS','Coz Cos','COZ Cos Closet'],description:SITE_DESCRIPTION,inLanguage:['zh-Hant','en'],publisher:{'@id':SITE_ORIGIN+'/#organization'}},
 {'@type':'Service','@id':SITE_ORIGIN+'/#service',name:'COZ COS Cosplay 服裝租借與分享',serviceType:'Cosplay costume rental and sharing platform',description:SITE_DESCRIPTION,url:SITE_ORIGIN+'/about',provider:{'@id':SITE_ORIGIN+'/#organization'}},
 {'@type':'WebPage','@id':SITE_ORIGIN+'/#webpage',url:SITE_ORIGIN+'/',name:SITE_NAME+'｜Cosplay 服裝租借・共用衣櫃',description:SITE_DESCRIPTION,isPartOf:{'@id':SITE_ORIGIN+'/#website'},about:{'@id':SITE_ORIGIN+'/#organization'}}
]};
