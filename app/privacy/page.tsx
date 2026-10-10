import {cookies} from 'next/headers';
import {publicMetadata} from '@/lib/seo';
import {legalDocuments} from '@/lib/legal-content';
import LegalContent from '../legal-content';
export async function generateMetadata(){
 const locale=(await cookies()).get('cos_language')?.value==='en'?'en':'zh';
 const doc=legalDocuments.privacy;
 return publicMetadata(doc.title[locale]+'｜COz Cos Closet',doc.description[locale],'/privacy');
}
export default function PrivacyPage(){return <LegalContent kind="privacy"/>}
