'use client';
import {useId,type ReactNode} from 'react';
export default function QuestCard({icon,number,title,description,open,onToggle,onOpen,onClose}:{icon:ReactNode;number:string;title:string;description:string;open:boolean;onToggle:()=>void;onOpen:()=>void;onClose:()=>void}){
 const id=useId();
 return <article className="quest-card" data-open={open} onPointerEnter={e=>{if(e.pointerType==='mouse')onOpen()}} onPointerLeave={e=>{if(e.pointerType==='mouse')onClose()}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))onClose()}}>
  <h3><button type="button" className="quest-toggle" aria-expanded={open} aria-controls={id} onClick={e=>{if(e.detail>0&&window.matchMedia('(hover:hover) and (pointer:fine)').matches)onOpen();else onToggle()}}>
   <span className="quest-card-meta">{icon}<span>QUEST / {number}</span></span>
   <span className="quest-card-title">{title}</span>
  </button></h3>
  <p id={id} className="quest-description" hidden={!open}>{description}</p>
 </article>;
}
