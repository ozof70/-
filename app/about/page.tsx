import {cookies} from 'next/headers';
import {publicMetadata,SITE_ORIGIN} from '@/lib/seo';
import {serviceFaqs} from '@/lib/service-info';
import AboutContent from './about-content';
export const metadata=publicMetadata('COZ COS｜Cosplay 服裝租借服務介紹與常見問題','COZ COS（COZ COS CLOSET）提供 Cosplay 服裝租借與衣櫃分享。了解租借申請、服裝上架、尺寸、社群資訊，以及目前付款與交付方式。','/about');
export default async function AboutPage(){
 const en=(await cookies()).get('cos_language')?.value==='en';
 const schema={'@context':'https://schema.org','@type':'FAQPage','@id':SITE_ORIGIN+'/about#faq',url:SITE_ORIGIN+'/about',isPartOf:{'@id':SITE_ORIGIN+'/#website'},mainEntity:serviceFaqs.map(f=>({'@type':'Question',name:en?f.questionEn:f.question,acceptedAnswer:{'@type':'Answer',text:en?f.answerEn:f.answer}}))};
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/><AboutContent/></>;
}
