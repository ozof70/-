'use client';
import {PreferenceControls,useLocale} from '../preferences';
import {serviceFaqs} from '@/lib/service-info';
import '../landing.css';
import './about.css';
export default function AboutContent(){
 const {language,t}=useLocale();const en=language==='en';
 return <div className="portal-page service-page"><header className="portal-nav"><a className="portal-brand" href="/"><img src="/coz-logo-transparent.png" width="42" height="42" alt=""/><span>COZ COS CLOSET<small>{t('你的次元共用衣櫃')}</small></span></a><nav aria-label={t('首頁導覽')}><PreferenceControls/><a className="portal-login" href="/login">{t('登入')}</a></nav></header>
 <main className="service-content"><p className="portal-kicker">COZ COS / COSPLAY RENTAL</p><h1>{en?'COZ COS: cosplay rentals and wardrobe sharing':'COZ COS｜Cosplay 服裝租借與共用衣櫃'}</h1><p className="service-lead">{en?'COZ COS CLOSET brings cosplay outfit discovery, listing and rental requests together. Find an outfit for your next character, or share your wardrobe with another fan.':'COZ COS CLOSET 將 Cosplay 服裝探索、上架與租借申請整合在同一個網站。尋找下一次出角的服裝，也讓自己的衣櫃與其他同好分享。'}</p>
 <div className="service-actions"><a className="portal-cta" href="/explore">{t('開始租借')}</a><a className="portal-secondary" href="/explore?view=upload">{t('分享我的衣櫃')}</a></div>
 <section aria-labelledby="faq-title"><h2 id="faq-title">{en?'Frequently asked questions':'服務常見問題'}</h2>{serviceFaqs.map((faq,i)=><article className="service-answer" key={i}><h3>{en?faq.questionEn:faq.question}</h3><p>{en?faq.answerEn:faq.answer}</p></article>)}</section>
 <a className="service-guide-link" href="/">{en?'Back to COZ COS CLOSET':'回到 COZ COS CLOSET 首頁'}</a></main></div>;
}
