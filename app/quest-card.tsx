'use client';
import {useId,type ReactNode} from 'react';
export default function QuestCard({icon,number,title,description,open,onToggle}:{icon:ReactNode;number:string;title:string;description:string;open:boolean;onToggle:()=>void}){
 const id=useId();
 return <article className="quest-card" data-open={open}>
  <h3><button type="button" className="quest-toggle" aria-expanded={open} aria-controls={id} onClick={onToggle}>
   <span className="quest-card-meta">{icon}<span>QUEST / {number}</span></span>
   <span className="quest-card-title">{title}</span>
  </button></h3>
  <p id={id} className="quest-description" hidden={!open}>{description}</p>
 </article>;
}
