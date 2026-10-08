'use client';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {Sun,Moon,Languages,ArrowUp} from 'lucide-react';
import {english} from '@/lib/translations';
export type Language='zh'|'en';
export type Theme='light'|'dark';
const Preferences=createContext({language:'zh' as Language,theme:'dark' as Theme,t:(text:string)=>text,setLanguage:(_value:Language)=>{},setTheme:(_value:Theme)=>{}});
export function useLocale(){return useContext(Preferences)}
export function PreferencesProvider({children,initialLanguage,initialTheme}:{children:ReactNode;initialLanguage:Language;initialTheme:Theme}){
 const [language,setLanguage]=useState(initialLanguage),[theme,setTheme]=useState(initialTheme);
 const [showTop,setShowTop]=useState(false);
 useEffect(()=>{const update=()=>setShowTop(window.scrollY>220);update();window.addEventListener("scroll",update,{passive:true});return()=>window.removeEventListener("scroll",update)},[]);
 const t=(text:string)=>language==='en'?(english[text]??text):text;
 useEffect(()=>{document.documentElement.lang=language==='en'?'en':'zh-Hant';document.documentElement.dataset.theme=theme;document.documentElement.dataset.language=language;document.cookie=`cos_language=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;document.cookie=`cos_theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`},[language,theme]);
 return <Preferences.Provider value={{language,theme,t,setLanguage,setTheme}}><div id="page-top" tabIndex={-1}/>{children}{showTop&&<button className="back-top" aria-label={t("回到頂端")} onClick={()=>{window.scrollTo({top:0,left:0,behavior:"instant"});document.getElementById("page-top")?.focus({preventScroll:true})}}><ArrowUp size={19}/><span>{t("回到頂端")}</span></button>}</Preferences.Provider>
}

export function PreferenceControls(){const {language,theme,t,setLanguage,setTheme}=useContext(Preferences);return <div className="preferences-controls"><button type="button" className="theme-switch" aria-label={theme==='dark'?t('切換為白底'):t('切換為深色底')} onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?<Sun size={16}/>:<Moon size={16}/>}<span>{theme==='dark'?t('白底'):t('深色')}</span></button><button type="button" className="language-switch" aria-label={language==='zh'?'Switch to English':'切換為繁體中文'} onClick={()=>setLanguage(language==='zh'?'en':'zh')}><Languages size={16}/><span>{language==='zh'?'English':'繁體中文'}</span></button></div>}
