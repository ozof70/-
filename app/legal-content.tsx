'use client';
import Link from 'next/link';
import Image from 'next/image';
import {PreferenceControls,useLocale} from './preferences';
import {legalDocuments,LEGAL_CONTACT,LEGAL_UPDATED,type LegalKind} from '@/lib/legal-content';
import './landing.css';
import './legal.css';

export default function LegalContent({kind}:{kind:LegalKind}) {
 const {language,t}=useLocale();
 const locale=language==='en'?'en':'zh';
 const doc=legalDocuments[kind];
 const other=kind==='terms'?'privacy':'terms';
 return <div className="portal-page legal-page">
  <header className="portal-nav">
   <Link className="portal-brand" href="/"><Image src="/coz-logo-transparent.png" width={42} height={42} alt="" unoptimized/><span>COz Cos Closet<small>{t('你的次元共用衣櫃')}</small></span></Link>
   <nav aria-label={t('首頁導覽')}><PreferenceControls/><Link className="portal-login" href="/login">{t('登入')}</Link></nav>
  </header>
  <main className="legal-main">
   <Link className="legal-link" href="/">{locale==='en'?'Back to home':'返回首頁'}</Link>
   <p className="portal-kicker">COz Cos Closet</p>
   <h1>{doc.title[locale]}</h1>
   <p className="legal-lead">{doc.description[locale]}</p>
   <p className="legal-updated">{locale==='en'?'Last updated: ':'最後更新：'}<time dateTime={LEGAL_UPDATED}>{LEGAL_UPDATED}</time></p>
   <nav className="legal-toc" aria-labelledby="legal-toc-title">
    <h2 id="legal-toc-title">{locale==='en'?'On this page':'頁面目錄'}</h2>
    <ol>{doc.sections.map(section=><li key={section.id}><a href={'#'+section.id}>{section.title[locale]}</a></li>)}</ol>
   </nav>
   <div className="legal-sections">{doc.sections.map((section,index)=><section key={section.id} id={section.id} aria-labelledby={section.id+'-title'}>
    <h2 id={section.id+'-title'}><span className="legal-section-number">{String(index+1).padStart(2,'0')}</span>{section.title[locale]}</h2>
    {section.paragraphs.map((paragraph,i)=><p key={i}>{paragraph[locale]}</p>)}
   </section>)}</div>
   <aside className="legal-contact" aria-labelledby="legal-contact-title"><h2 id="legal-contact-title">{locale==='en'?'Contact COz Cos Closet':'聯絡 COz Cos Closet'}</h2><p>{locale==='en'?'Operator: COz Cos Closet team':'營運者：COz Cos Closet 團隊'}</p><a className="legal-link" href={'mailto:'+LEGAL_CONTACT}>{LEGAL_CONTACT}</a></aside>
  </main>
  <footer className="legal-footer"><Link className="legal-link" href="/">{locale==='en'?'Back to home':'返回首頁'}</Link><Link className="legal-link" href={'/'+other}>{legalDocuments[other].title[locale]}</Link></footer>
 </div>;
}
