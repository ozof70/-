'use client';
import {useLocale} from './preferences';

import {useEffect,useRef,useState} from 'react';
import {Pause,Play,RotateCcw,RotateCw} from 'lucide-react';
export default function CostumeShowcase(){const {t}=useLocale();
 const mount=useRef<HTMLDivElement>(null),control=useRef({paused:false,angle:-.35,dragging:false});
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[paused,setPaused]=useState(false);
 useEffect(()=>{let disposed=false;let cleanup=()=>{};const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');control.current.paused=reduced.matches;setPaused(reduced.matches);
 void import('./costume-scene').then(({createCostumeScene})=>{if(disposed||!mount.current)return;cleanup=createCostumeScene(mount.current,control.current,()=>{if(!disposed){setFailed(true);setReady(false)}});setReady(true)}).catch(()=>{if(!disposed)setFailed(true)});
 return()=>{disposed=true;cleanup()}},[]);
 function toggle(){control.current.paused=!control.current.paused;setPaused(control.current.paused)}
 function turn(amount:number){control.current.angle+=amount;control.current.paused=true;setPaused(true)}
 return <div className="showcase"><div className="showcase-coordinate">EQUIPMENT / 001 <span>ORIGINAL COSPLAY</span></div><div className="showcase-stage"><div className="showcase-halo"/><img className="showcase-watermark" src="/coz-logo-transparent.png" alt="" aria-hidden="true" draggable={false}/><div ref={mount} className="showcase-canvas" role="img" aria-label={t("可旋轉的原創星月魔法使 Cos 服裝 3D 展示")}/>{!ready&&<img className="showcase-fallback" src="/portal-costume.svg" width="400" height="470" alt={t("Cos 服裝展示插畫")}/>}<span className="showcase-rank" aria-hidden="true">SSR ✦</span></div><div className="showcase-label"><span>{t("星月魔法使")}<small>{t("原創 3D 概念服裝 · 非出租商品")}</small></span><span>MOONLIT MAGE</span></div>{ready?<div className="showcase-controls"><button onClick={()=>turn(-Math.PI/4)} aria-label={t("向左旋轉服裝")}><RotateCcw size={17}/></button><button onClick={toggle} aria-pressed={paused}>{paused?<Play size={16}/>:<Pause size={16}/>} {paused?t("繼續旋轉"):t("暫停旋轉")}</button><button onClick={()=>turn(Math.PI/4)} aria-label={t("向右旋轉服裝")}><RotateCw size={17}/></button><small>{t("拖曳看細節 · 360° 展示")}</small></div>:<p className="showcase-status" role="status">{failed?t("此裝置顯示靜態預覽，仍可正常探索衣櫃。"):t("正在準備 3D 服裝…")}</p>}</div>
}
