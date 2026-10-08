'use client';
import {useId,useState,type ReactNode} from 'react';
import {ChevronDown} from 'lucide-react';
export default function QuestCard({icon,number,title,description}:{icon:ReactNode;number:string;title:string;description:string}){
 const id=useId(),[hovered,setHovered]=useState(false),[expanded,setExpanded]=useState(false);
 const open=hovered||expanded;
 return <article className="quest-card" data-open={open} onPointerEnter={e=>{if(e.pointerType==='mouse')setHovered(true)}} onPointerLeave={()=>setHovered(false)}>
  <h3><button type="button" className="quest-toggle" aria-expanded={open} aria-controls={id} onClick={()=>setExpanded(value=>!value)}>
   <span className="quest-card-meta">{icon}<span>QUEST / {number}</span><ChevronDown className="quest-chevron" size={18}/></span>
   <span className="quest-card-title">{title}</span>
  </button></h3>
  <p id={id} className="quest-description" hidden={!open}>{description}</p>
 </article>;
}
